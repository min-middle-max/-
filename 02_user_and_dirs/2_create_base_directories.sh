#!/usr/bin/env bash
set -euo pipefail

mkdir -p /srv/sopumshop/{frontend,assets,design,deploy,docs,scripts}
chown -R app:app /srv/sopumshop

ls -la /srv/sopumshop
echo "Base directories created."
