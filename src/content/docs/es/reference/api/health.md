---
title: Endpoints de Salud
description: Endpoints de comprobación de salud para supervisar el estado de la API de TerraScale.
openapi:
  spec: /openapi/terrascale.yaml
  tag: Health
sidebar:
  order: 8
---

Los endpoints de salud te ayudan a confirmar que TerraScale es accesible, está lista para recibir tráfico y sigue funcionando con normalidad. No se requiere autenticación.

---

## Por qué importan las comprobaciones de salud

Las comprobaciones de salud dan a los load balancers, las plataformas de orquestación y tu propio monitoreo una forma rápida de entender el estado del servicio. En TerraScale, suelen ser la primera señal que usarás durante despliegues, pruebas de failover y respuesta a incidentes.

Mantén estos endpoints ligeros y consúltalos en intervalos constantes para detectar problemas pronto sin añadir tráfico innecesario.

---

## Comprobación de Salud

### GET /health

Comprobación general de salud de la API. Úsala cuando quieras una señal simple de que el servicio y sus dependencias principales están saludables.

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

## Sonda de Preparación

### GET /health/ready

Sonda de preparación para load balancers. Devuelve 200 cuando el servicio está listo para aceptar tráfico.

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

Usa este endpoint para:
- Sondas de preparación de Kubernetes
- Comprobaciones de salud de load balancers
- Verificación de despliegue

---

## Sonda de Vida

### GET /health/live

Sonda de vida para confirmar que la aplicación está en ejecución. Este endpoint es útil cuando quieres que la plataforma reinicie un proceso bloqueado en lugar de simplemente desviar el tráfico.

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

Usa este endpoint para:
- Sondas de vida de Kubernetes
- Monitoreo básico de disponibilidad
- Orquestación de contenedores

---

## Ejemplos de Uso

### Configuración de Kubernetes
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

### Comprobación de Salud del Load Balancer
```bash
# Check if API is ready for traffic
curl -f https://api.terrascale.io/health/ready || exit 1
```

### Script de Monitoreo
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

## Valores de Estado

| Endpoint | Respuesta saludable | Respuesta no saludable |
|----------|------------------|-------------------|
| `/health` | `Healthy` | `Unhealthy` |
| `/health/ready` | `Ready` | `NotReady` |
| `/health/live` | `Alive` | `Dead` |

---

## Buenas Prácticas

1. **Usa el endpoint correcto**: `/health/live` para decisiones de reinicio, `/health/ready` para enrutar tráfico, `/health` para monitoreo general.
2. **Define expectativas estrictas de latencia**: intenta mantener el p95 por debajo de 500 ms en condiciones normales e investiga cualquier caso que supere 1 segundo con frecuencia.
3. **Usa timeouts cortos**: la mayoría de las comprobaciones deben fallar rápido, normalmente entre 2 y 5 segundos.
4. **Observa el tiempo de respuesta, no solo el estado**: una comprobación lenta suele mostrar problemas antes de que aparezcan fallos claros.
5. **Evita el sondeo agresivo**: cada 10 a 30 segundos suele ser suficiente para el monitoreo externo.

---

## Próximos Pasos

- [API Overview](/reference/api/) - Documentación completa de la API
- [Best Practices](/reference/best-practices/) - Diseña un comportamiento de cliente más saludable
- [Rate Limits](/reference/rate-limits/) - Entiende los límites
