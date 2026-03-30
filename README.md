# Shopping App for EC2 Auto Scaling Project

This is a production-style starter codebase for a **multi-tier shopping application** designed to fit an **AWS EC2 Auto Scaling** architecture.

## Architecture this codebase is built for

- **Route 53** DNS
- **ACM** TLS certificate
- **Internet-facing Application Load Balancer**
  - `/*` -> **frontend target group**
  - `/api/*` -> **backend target group**
- **Frontend Auto Scaling Group** in private app subnets
- **Backend Auto Scaling Group** in private app subnets
- **Amazon RDS PostgreSQL (Multi-AZ)** in private DB subnets
- **NAT Gateway per AZ**
- **CloudWatch alarms + target tracking policies**
- **IAM role / SSM / Secrets Manager** for configuration

## App features

- Product catalog
- Search and category filters
- Cart and checkout flow
- Health endpoints for load balancer checks
- Seeded product data
- Stateless API design so the backend tier can scale horizontally

## Repository layout

- `frontend/` - React + Vite storefront
- `backend/` - Express API
- `db/` - PostgreSQL schema + seed data
- `nginx/` - Frontend nginx config for EC2
- `deploy/` - Example systemd, userdata, and deployment scripts
- `loadtest/` - k6 load test

## Quick local start

### 1) Start the stack

```bash
docker compose up --build
```

### 2) Open the app

- Frontend: `http://localhost:8080`
- API health: `http://localhost:8081/health`

### 3) Run backend tests locally

```bash
cd backend
npm install
npm test
```

## Environment variables

### Backend

- `PORT` default `8081`
- `DB_HOST`
- `DB_PORT` default `5432`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `CORS_ORIGIN`
- `NODE_ENV`

### Frontend

- `VITE_API_BASE_URL`
  - Example local value: `http://localhost:8081`

## AWS deployment pattern

### Frontend ASG user data
- Installs Docker
- Pulls or builds frontend image
- Sets `VITE_API_BASE_URL=https://your-domain.example.com`
- Runs nginx container on port `80`

### Backend ASG user data
- Installs Docker
- Injects DB settings from Secrets Manager / SSM
- Runs API container on port `8081`
- Registers with backend target group

### ALB routing
- Listener `443`:
  - Rule priority 10: `/api/*` -> backend target group
  - Default rule: `/*` -> frontend target group

### Health checks
- Frontend target group: `/`
- Backend target group: `/health`

## Suggested AWS resources to show in the architecture diagram

- Route 53 hosted zone
- ACM certificate
- Internet-facing ALB
- ALB security group
- Frontend target group
- Backend target group
- Launch template (frontend)
- Launch template (backend)
- Auto Scaling Group (frontend)
- Auto Scaling Group (backend)
- App subnets in at least 2 AZs
- NAT Gateway A / NAT Gateway B
- Internet Gateway
- RDS subnet group
- RDS PostgreSQL Multi-AZ
- DB security group
- Secrets Manager
- CloudWatch alarms / dashboard
- SNS topic for alerts
- S3 bucket for ALB access logs and build artifacts
- Systems Manager Session Manager
- IAM instance profile

## Notes

- For coursework, this is intentionally realistic but still simple enough to demo.
- For a stronger submission, pair this codebase with Terraform or CloudFormation and screenshots of scale-out / scale-in events.
