#!/bin/bash
set -euxo pipefail

dnf update -y || yum update -y
dnf install -y docker git || yum install -y docker git
systemctl enable docker
systemctl start docker

mkdir -p /opt/scalecart
cd /opt/scalecart

# Replace with your artifact retrieval mechanism:
# git clone https://your-repo-url scalecart || true

cat >/opt/scalecart/frontend.env <<EOF
VITE_API_BASE_URL=https://your-domain.example.com
EOF

cd /opt/scalecart/frontend
docker build --build-arg VITE_API_BASE_URL=https://your-domain.example.com -t scalecart-frontend:latest .
docker rm -f scalecart-frontend || true
docker run -d --restart unless-stopped --name scalecart-frontend -p 80:80 scalecart-frontend:latest
