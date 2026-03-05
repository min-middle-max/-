#!/usr/bin/env bash
set -euo pipefail

chcon -R -t httpd_sys_content_t /srv/sopumshop/frontend/dist

echo "SELinux context applied for Nginx static files."
