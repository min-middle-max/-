#!/usr/bin/env bash
set -euo pipefail

nginx -t
systemctl reload nginx
curl -I http://127.0.0.1:8080

echo "Nginx reloaded and checked."
