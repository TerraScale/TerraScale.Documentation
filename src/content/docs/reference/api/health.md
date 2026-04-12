---
title: Health Endpoints
description: Health check endpoints for monitoring TerraScale API status.
openapi:
  spec: /openapi/terrascale.yaml
  tag: Health
sidebar:
  order: 8
---

Health endpoints help you confirm that TerraScale is reachable, ready for traffic, and still running normally. No authentication is required.

---

## Why health checks matter

Health checks give load balancers, orchestration platforms, and your own monitoring a fast way to understand service state. In TerraScale, they are often the first signal you will use during deploys, failover tests, and incident response.

Keep these endpoints lightweight and call them on a steady interval so you can catch problems early without adding unnecessary traffic.

---

## Health Check

### GET /health

Overall health check for the API. Use this when you want a simple signal that the service and its core dependencies are healthy.

**Response (200 OK):**
```json
{
  "status": "Healthy"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "Unhealthy",
  "details": "Database connection failed"
}
```

---

## Readiness Probe

### GET /health/ready

Readiness probe for load balancers. Returns 200 when the service is ready to accept traffic.

**Response (200 OK):**
```json
{
  "status": "Ready"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "NotReady",
  "details": "Warming up"
}
```

Use this endpoint for:
- Kubernetes readiness probes
- Load balancer health checks
- Deployment verification

---

## Liveness Probe

### GET /health/live

Liveness probe to confirm the application is running. This endpoint is useful when you want your platform to restart a stuck process instead of routing around it.

**Response (200 OK):**
```json
{
  "status": "Alive"
}
```

**Response (503 Service Unavailable):**
```json
{
  "status": "Dead",
  "details": "Process is shutting down"
}
```

Use this endpoint for:
- Kubernetes liveness probes
- Basic uptime monitoring
- Container orchestration

---

## Usage Examples

### Kubernetes Configuration
```yaml
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: app
    livenessProbe:
      httpGet:
        path: /health/live
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 10
    readinessProbe:
      httpGet:
        path: /health/ready
        port: 80
      initialDelaySeconds: 5
      periodSeconds: 5
```

### Load Balancer Health Check
```bash
# Check if API is ready for traffic
curl -f https://api.terrascale.io/health/ready || exit 1
```

### Monitoring Script
```bash
#!/bin/bash
# Simple uptime check

response=$(curl -s -o /dev/null -w "%{http_code}" https://api.terrascale.io/health)

if [ "$response" = "200" ]; then
  echo "API is healthy"
else
  echo "API is unhealthy: HTTP $response"
  # Send alert
fi
```

---

## Status Values

| Endpoint | Healthy Response | Unhealthy Response |
|----------|------------------|-------------------|
| `/health` | `Healthy` | `Unhealthy` |
| `/health/ready` | `Ready` | `NotReady` |
| `/health/live` | `Alive` | `Dead` |

---

## Best Practices

1. **Use the right endpoint**: `/health/live` for restart decisions, `/health/ready` for traffic routing, `/health` for general monitoring.
2. **Set tight latency expectations**: aim for p95 under 500 ms in normal conditions, and investigate anything that regularly exceeds 1 second.
3. **Use short timeouts**: most checks should fail fast, usually within 2 to 5 seconds.
4. **Watch response time, not just status**: a slow health check often shows trouble before outright failures appear.
5. **Avoid aggressive polling**: every 10 to 30 seconds is usually enough for external monitoring.

---

## Next Steps

- [API Overview](/reference/api/) - Full API documentation
- [Best Practices](/reference/best-practices/) - Design healthier client behavior
- [Rate Limits](/reference/rate-limits/) - Understand limits
