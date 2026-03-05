#!/usr/bin/env bash
set -euo pipefail

runuser -l app -c "cd /srv/sopumshop/frontend && npm run build"

echo "Production build done."
