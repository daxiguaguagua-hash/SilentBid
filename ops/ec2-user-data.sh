#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y nginx tar gzip

cat >/etc/nginx/conf.d/silentbid.conf <<'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    root /var/www/silentbid;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|wasm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
NGINX

rm -f /etc/nginx/conf.d/default.conf
mkdir -p /var/www/silentbid
chown -R nginx:nginx /var/www/silentbid
systemctl enable --now nginx
