# Recommended architecture decisions

## Why this design is stronger

- Frontend and backend are split into separate target groups, so you can scale them independently.
- Both tiers stay stateless, which fits EC2 Auto Scaling well.
- The database is managed by Amazon RDS instead of self-hosting PostgreSQL on EC2.
- NAT gateways are placed in both AZs for better resiliency.
- The ALB handles HTTPS termination and health checks.
- Private app subnets reduce direct exposure of EC2 instances.
- CloudWatch metrics and target tracking scaling policies simplify scale-out / scale-in logic.

## Example scaling metrics

### Frontend ASG
- Target tracking on `ALBRequestCountPerTarget`
- Min 2, desired 2, max 6

### Backend ASG
- Target tracking on `ASGAverageCPUUtilization`
- Min 2, desired 2, max 8

## Security groups

### ALB SG
- Inbound 80/443 from internet
- Outbound 80 to frontend instances
- Outbound 8081 to backend instances

### Frontend EC2 SG
- Inbound 80 only from ALB SG
- Outbound 443/80 via NAT
- Optional outbound 8081 only if needed internally

### Backend EC2 SG
- Inbound 8081 only from ALB SG
- Outbound 5432 to DB SG
- Outbound 443/80 via NAT

### DB SG
- Inbound 5432 only from backend SG

## Demo tips

- Record baseline latency with 2 instances.
- Run k6 load test.
- Show CloudWatch CPU / request metrics crossing the scaling threshold.
- Show new EC2 instances registering healthy in the target group.
- After load ends, show scale-in.
