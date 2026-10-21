#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
root_env="$repo_root/.env"
root_example="$repo_root/.env.example"
web_dir="$repo_root/apps/web"
web_env="$web_dir/.env.local"

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local temporary
  temporary="$(mktemp "${file}.XXXXXX")"

  awk -v key="$key" -v value="$value" '
    BEGIN { found = 0 }
    $0 ~ "^" key "=" { print key "=" value; found = 1; next }
    { print }
    END { if (!found) print key "=" value }
  ' "$file" > "$temporary"
  mv "$temporary" "$file"
}

get_env_value() {
  local file="$1"
  local key="$2"
  awk -v key="$key" '$0 ~ "^" key "=" { sub("^" key "=", ""); print; exit }' "$file"
}

if [[ ! -f "$root_example" ]]; then
  echo "Missing $root_example. Restore the example environment file before setup." >&2
  exit 1
fi

corepack enable
corepack prepare pnpm@10.33.4 --activate
pnpm --dir "$repo_root" install --frozen-lockfile

if [[ ! -f "$root_env" ]]; then
  cp "$root_example" "$root_env"
fi

webhook_secret="$(get_env_value "$root_env" KEIKI_WEBHOOK_SECRET)"
if [[ -z "$webhook_secret" || "$webhook_secret" == change-me-* ]]; then
  webhook_secret="$(node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))")"
  set_env_value "$root_env" KEIKI_WEBHOOK_SECRET "$webhook_secret"
fi
unset webhook_secret
set_env_value "$root_env" LOG_KEIKI_PAYLOADS 0

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  gateway_origin="https://${CODESPACE_NAME}-8787.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  site_origin="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  set_env_value "$root_env" PUBLIC_URL "$gateway_origin"
  set_env_value "$root_env" DATA_DIR /data

  if [[ -d "$web_dir" ]]; then
    if [[ ! -f "$web_env" ]]; then
      touch "$web_env"
    fi
    set_env_value "$web_env" GATEWAY_URL http://localhost:8787
    set_env_value "$web_env" SITE_URL "$site_origin"
  fi
elif [[ -d "$web_dir" && ! -f "$web_env" ]]; then
  printf '%s\n' \
    'GATEWAY_URL=http://localhost:8787' \
    'SITE_URL=http://localhost:3000' > "$web_env"
fi

echo "Vani development dependencies and local environment files are ready."
