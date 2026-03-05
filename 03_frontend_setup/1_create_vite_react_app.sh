#!/usr/bin/env bash
set -euo pipefail

mkdir -p /srv/sopumshop/frontend
chown -R app:app /srv/sopumshop/frontend

runuser -l app -c "cd /srv/sopumshop/frontend && npx create-vite@latest . --template react --no-interactive"

echo "React + Vite project scaffolded."
