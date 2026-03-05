#!/usr/bin/env bash
set -euo pipefail

cat > /etc/nginx/conf.d/sopumshop.conf <<'EOF'
server {
    listen 8080;
    server_name 192.168.64.10;

    root /srv/sopumshop/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
EOF

echo "Nginx conf created: /etc/nginx/conf.d/sopumshop.conf"
