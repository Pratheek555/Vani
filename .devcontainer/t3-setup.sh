#!/usr/bin/env bash
set -euo pipefail

export T3CODE_HOME=/data/t3
export CODEX_HOME=/data/providers/codex
export CLAUDE_CONFIG_DIR=/data/providers/claude
export T3CODE_INSTALL_BIN_DIR=/data/bin
export T3CODE_VERSION=0.1.1
export PATH="/data/bin:$PATH"

mkdir -p \
  "$T3CODE_INSTALL_BIN_DIR" \
  "$T3CODE_HOME" \
  "$CODEX_HOME" \
  "$CLAUDE_CONFIG_DIR"
chmod 700 "$T3CODE_HOME" "$CODEX_HOME" "$CLAUDE_CONFIG_DIR"

t3_bin="$T3CODE_INSTALL_BIN_DIR/t3"
installed_version=""
if [[ -x "$t3_bin" ]]; then
  installed_version="$("$t3_bin" --version 2>/dev/null || true)"
fi

if [[ ! "$installed_version" =~ (^|[^0-9])0\.1\.1([^0-9]|$) ]]; then
  curl --fail --silent --show-error --location https://t3.codes/install.sh | bash
fi

if [[ ! -x "$t3_bin" ]]; then
  echo "T3 installation did not create $t3_bin." >&2
  exit 1
fi

installed_version="$("$t3_bin" --version 2>/dev/null || true)"
if [[ ! "$installed_version" =~ (^|[^0-9])0\.1\.1([^0-9]|$) ]]; then
  echo "Expected T3 0.1.1 at $t3_bin, but the installed version did not match." >&2
  exit 1
fi

echo "T3 0.1.1 is installed in /data/bin. Run '/data/bin/t3 connect link --headless' once to connect this Codespace."
