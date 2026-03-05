#!/usr/bin/env bash
set -euo pipefail

runuser -l app -c "cd /srv/sopumshop/frontend && npm install"

echo "Frontend dependencies installed."
