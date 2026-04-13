---
title: Endpoints de Saúde
description: Endpoints de verificação de saúde para monitorar o status da API TerraScale.
openapi:
  spec: /openapi/terrascale.yaml
  tag: Health
sidebar:
  order: 8
---

Os endpoints de saúde ajudam você a confirmar que a TerraScale está acessível, pronta para receber tráfego e funcionando normalmente. Nenhuma autenticação é necessária.

---

## Por que as verificações de saúde são importantes

As verificações de saúde dão aos load balancers, às plataformas de orquestração e ao seu próprio monitoramento uma forma rápida de entender o estado do serviço. Na TerraScale, elas costumam ser o primeiro sinal usado durante deploys, testes de failover e resposta a incidentes.

Mantenha esses endpoints leves e faça chamadas em um intervalo constante para detectar problemas cedo, sem adicionar tráfego desnecessário.

---

## Verificação de Saúde

### GET /health

Verificação geral de saúde da API. Use quando quiser um sinal simples de que o serviço e suas dependências principais estão saudáveis.

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

## Probe de Prontidão

### GET /health/ready

Probe de prontidão para load balancers. Retorna 200 quando o serviço está pronto para aceitar tráfego.

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

Use este endpoint para:
- Probes de prontidão do Kubernetes
- Verificações de saúde de load balancers
- Verificação de deploy

---

## Probe de Vitalidade

### GET /health/live

Probe de vitalidade para confirmar que a aplicação está em execução. Este endpoint é útil quando você quer que a plataforma reinicie um processo travado em vez de apenas desviar o tráfego.

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

Use este endpoint para:
- Probes de vitalidade do Kubernetes
- Monitoramento básico de disponibilidade
- Orquestração de contêineres

---

## Exemplos de Uso

### Configuração do Kubernetes
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

### Verificação de Saúde do Load Balancer
```bash
# Check if API is ready for traffic
curl -f https://api.terrascale.io/health/ready || exit 1
```

### Script de Monitoramento
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

## Valores de Status

| Endpoint | Resposta saudável | Resposta não saudável |
|----------|------------------|-------------------|
| `/health` | `Healthy` | `Unhealthy` |
| `/health/ready` | `Ready` | `NotReady` |
| `/health/live` | `Alive` | `Dead` |

---

## Boas Práticas

1. **Use o endpoint certo**: `/health/live` para decisões de reinício, `/health/ready` para roteamento de tráfego, `/health` para monitoramento geral.
2. **Defina expectativas rígidas de latência**: procure manter o p95 abaixo de 500 ms em condições normais e investigue qualquer coisa que ultrapasse 1 segundo com frequência.
3. **Use timeouts curtos**: a maioria das verificações deve falhar rapidamente, normalmente entre 2 e 5 segundos.
4. **Observe o tempo de resposta, não apenas o status**: uma verificação lenta costuma indicar problemas antes de falhas evidentes aparecerem.
5. **Evite sondagem agressiva**: a cada 10 a 30 segundos normalmente é suficiente para monitoramento externo.

---

## Próximos Passos

- [API Overview](/reference/api/) - Documentação completa da API
- [Best Practices](/reference/best-practices/) - Defina um comportamento de cliente mais saudável
- [Rate Limits](/reference/rate-limits/) - Entenda os limites
