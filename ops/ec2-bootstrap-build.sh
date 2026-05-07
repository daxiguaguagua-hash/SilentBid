#!/bin/bash
set -euxo pipefail

dnf update -y
dnf install -y git nginx nodejs npm tar gzip

fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile

rm -rf /opt/SilentBid
git clone https://github.com/daxiguaguagua-hash/SilentBid.git /opt/SilentBid

cd /opt/SilentBid/frontend
cat >.env <<'ENV'
VITE_CONTRACT_ADDRESS=0xAB06CB9cddC96B4c8725F3298548e56CbC10994d
ENV
npm ci
npm run build

mkdir -p /var/www/silentbid
rm -rf /var/www/silentbid/*
cp -a dist/. /var/www/silentbid/

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
chown -R nginx:nginx /var/www/silentbid
systemctl enable --now nginx
systemctl reload nginx
