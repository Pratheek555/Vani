#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bash "$repo_root/scripts/cloud-setup.sh"
bash "$repo_root/.devcontainer/t3-setup.sh"
