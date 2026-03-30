#!/bin/bash
set -euxo pipefail

dnf update -y || yum update -y
dnf install -y docker awscli git jq || yum install -y docker awscli git jq
systemctl enable docker
systemctl start docker

mkdir -p /opt/scalecart
cd /opt/scalecart

# Replace with your artifact retrieval mechanism:
# git clone https://your-repo-url scalecart || true

# Example secret JSON:
# {"username":"shopuser","password":"supersecret","host":"db.xxxxx.us-east-1.rds.amazonaws.com","port":5432,"dbname":"shopdb"}
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id scalecart/prod/db \
  --query SecretString \
  --output text)

DB_USER=$(echo "$SECRET_JSON" | jq -r .username)
DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r .password)
DB_HOST=$(echo "$SECRET_JSON" | jq -r .host)
DB_PORT=$(echo "$SECRET_JSON" | jq -r .port)
DB_NAME=$(echo "$SECRET_JSON" | jq -r .dbname)

cat >/opt/scalecart/backend.env <<EOF
PORT=8081
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
CORS_ORIGIN=https://your-domain.example.com
NODE_ENV=production
EOF

cd /opt/scalecart/backend
docker build -t scalecart-backend:latest .
docker rm -f scalecart-backend || true
docker run -d --restart unless-stopped --name scalecart-backend \
  --env-file /opt/scalecart/backend.env \
  -p 8081:8081 \
  scalecart-backend:latest
