#!/usr/bin/env bash
set -euo pipefail

runuser -l app -c "cd /srv/sopumshop/frontend && npm run dev -- --host 0.0.0.0 --port 5173"
