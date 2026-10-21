#!/usr/bin/env bash
set -euo pipefail

export T3CODE_HOME=/data/t3
export CODEX_HOME=/data/providers/codex
export CLAUDE_CONFIG_DIR=/data/providers/claude
export PATH="/data/bin:$PATH"

t3_bin=/data/bin/t3
if [[ ! -x "$t3_bin" ]]; then
  echo "Missing $t3_bin. Rebuild the devcontainer or run 'bash .devcontainer/t3-setup.sh', then restart the Codespace." >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
pid_file="$T3CODE_HOME/server.pid"
log_file="$T3CODE_HOME/server.log"

mkdir -p "$T3CODE_HOME" "$CODEX_HOME" "$CLAUDE_CONFIG_DIR"
chmod 700 "$T3CODE_HOME" "$CODEX_HOME" "$CLAUDE_CONFIG_DIR"
umask 077

is_t3_server() {
  local pid="$1"
  local -a command

  [[ "$pid" =~ ^[0-9]+$ ]] || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  [[ -r "/proc/$pid/cmdline" ]] || return 1
  mapfile -d '' -t command < "/proc/$pid/cmdline"

  [[ " ${command[*]} " == *" $t3_bin serve --host 127.0.0.1 --port 3773 --auto-bootstrap-project-from-cwd "* ]]
}

existing_pid=""
if [[ -f "$pid_file" ]]; then
  existing_pid="$(<"$pid_file")"
fi

if is_t3_server "$existing_pid"; then
  curl --retry 10 --retry-delay 1 --retry-connrefused --fail --silent --output /dev/null http://127.0.0.1:3773/
  is_t3_server "$existing_pid" || exit 1
  echo "T3 is already running on 127.0.0.1:3773."
  exit 0
fi

if (exec 3<>/dev/tcp/127.0.0.1/3773) 2>/dev/null; then
  echo "Port 3773 is occupied by a server not tracked by $pid_file. Inspect it before starting T3." >&2
  exit 1
fi

cd "$repo_root"
nohup "$t3_bin" serve \
  --host 127.0.0.1 \
  --port 3773 \
  --auto-bootstrap-project-from-cwd \
  >"$log_file" 2>&1 </dev/null &
server_pid=$!
printf '%s\n' "$server_pid" > "$pid_file"

for _ in {1..20}; do
  if ! kill -0 "$server_pid" 2>/dev/null; then
    echo "T3 stopped during startup. Inspect $log_file inside the Codespace." >&2
    exit 1
  fi

  if curl --fail --silent --output /dev/null http://127.0.0.1:3773/; then
    is_t3_server "$server_pid" || exit 1
    echo "T3 is running on 127.0.0.1:3773."
    exit 0
  fi

  sleep 1
done

echo "T3 did not become ready. Inspect $log_file inside the Codespace." >&2
exit 1
