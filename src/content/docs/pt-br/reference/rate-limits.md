---
title: Limites de taxa
description: Limites de taxa e cotas para operações da API da TerraScale.
sidebar:
  order: 8
---

Os limites de taxa protegem a plataforma e ajudam a manter a performance previsível para todos que usam a TerraScale. Esta página mostra os tetos de requisição, limites de payload e cotas de plano que você deve considerar no design.

---

## Limites de operação

| Operation | Limit |
|-----------|-------|
| Batch Write | 25 items per request |
| Batch Get | 100 keys per request |
| Transactional Get | 100 items per request |
| Transactional Write | 25 items per request |
| Query/Scan | 1 MB per response |
| Item Size | 400 KB maximum |
| Total Request Size | 4 MB maximum |

---

## Limites de taxa de requisição

Os limites de taxa dependem do seu plano:

| Plan | Limit |
|------|-------|
| Free | 100 requests/second |
| Pro | 1,000 requests/second |
| Enterprise | Custom (contact sales) |

Esses limites de requisição são aplicados por segundo. As cotas mensais de requisição, listadas mais abaixo nesta página, são acompanhadas separadamente.

---

## Resposta de rate limit

Quando há rate limiting, a API retorna HTTP 429:
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 5
Content-Type: application/json

{
  "type": "https://tools.ietf.org/html/rfc6585#section-4",
  "title": "Too Many Requests",
  "status": 429,
  "detail": "Rate limit exceeded. Retry after 5 seconds.",
  "retryAfter": 5
}
```

Quando você atinge um limite, a TerraScale rejeita a requisição em vez de colocá-la em fila. Seu cliente deve pausar, esperar o valor de `Retry-After` ou o tempo de reset do limite, e então tentar novamente com backoff.

### Cabeçalhos

| Header | Description |
|--------|-------------|
| `Retry-After` | Segundos para esperar antes de tentar novamente |
| `X-RateLimit-Limit` | Máximo de requisições por janela |
| `X-RateLimit-Remaining` | Requisições restantes na janela |
| `X-RateLimit-Reset` | Timestamp Unix de quando o limite será resetado |

---

## Cotas do plano

### Plano Free

| Resource | Limit |
|----------|-------|
| Databases | 3 |
| Storage | 100 MB |
| Requests/month | 10,000 |
| Team Members | 1 |

### Plano Pro

| Resource | Limit |
|----------|-------|
| Databases | 10 |
| Storage | 10 GB |
| Requests/month | 1,000,000 |
| Team Members | 10 |

### Plano Enterprise

| Resource | Limit |
|----------|-------|
| Databases | Unlimited |
| Storage | Unlimited |
| Requests/month | Unlimited |
| Team Members | Unlimited |

---

## Como lidar com rate limits

Se você ultrapassar a janela configurada, espere uma resposta `429 Too Many Requests`. Picos curtos geralmente desaparecem rápido. Throttling repetido é sinal de que você deve reduzir concorrência, agrupar mais trabalho ou migrar para um plano superior.

### Retry com exponential backoff
```csharp
async Task<Result<T>> ExecuteWithRetry<T>(Func<Task<Result<T>>> operation)
{
    var maxRetries = 5;
    var baseDelay = TimeSpan.FromMilliseconds(100);

    for (int i = 0; i < maxRetries; i++)
    {
        var result = await operation();

        if (result.IsSuccess)
            return result;

        if (!IsRateLimited(result))
            return result;

        var delay = baseDelay * Math.Pow(2, i);
        var jitter = TimeSpan.FromMilliseconds(Random.Shared.Next(0, 100));
        await Task.Delay(delay + jitter);
    }

    return Result.Fail("Max retries exceeded");
}
```

### Retry automático no Client SDK

O SDK da TerraScale lida com rate limits automaticamente:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "ts_live_your_api_key",
    Endpoint = "https://api.terrascale.io",
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 5,
        BaseDelay = TimeSpan.FromMilliseconds(100),
        MaxDelay = TimeSpan.FromSeconds(10),
        UseJitter = true
    }
});
```

Se você criar sua própria camada de retry, prefira exponential backoff com jitter e respeite a janela de retry fornecida pelo servidor sempre que ela estiver presente.

---

## Boas práticas

### Operações em lote

Em vez de muitas requisições pequenas, use operações em lote:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

Isso é especialmente útil na TerraScale porque menos round trips normalmente significam menos chances de atingir tetos de requisições por segundo.

### Enfileiramento de requisições

Para aplicações de alto volume, implemente uma fila de requisições:
```csharp
var semaphore = new SemaphoreSlim(100); // Max concurrent requests

async Task<T> ExecuteWithThrottle<T>(Func<Task<T>> operation)
{
    await semaphore.WaitAsync();
    try
    {
        return await operation();
    }
    finally
    {
        semaphore.Release();
    }
}
```

Comece com concorrência conservadora e aumente aos poucos. Isso produz dados de latência mais limpos e ajuda a evitar que picos sobrecarreguem uma partição quente ou uma instância de cliente.

### Monitore o uso

Acompanhe seu uso para ficar dentro dos limites:
```csharp
var usage = await client.Payment.GetUsageAsync();

Console.WriteLine($"Requests this month: {usage.Value.TotalRequests}");
Console.WriteLine($"Storage used: {usage.Value.TotalStorageGb} GB");
```

Observe as duas dimensões: taxa de requisição de curto prazo e cota mensal de longo prazo. Elas resolvem problemas diferentes, e você pode atingir qualquer uma primeiro.

---

## Aumentando limites

### Faça upgrade do plano

Planos superiores têm limites maiores. Veja [How to Choose a Plan](/guides/how-to-choose-a-plan/) para orientação.

### Limites personalizados no Enterprise

Entre em contato com sales@terrascale.io para:

- limites de taxa personalizados
- capacidade dedicada
- garantias de SLA
- descontos por volume

---

## Próximos passos

- [How to Choose a Plan](/guides/how-to-choose-a-plan/) - Compare encaixe do plano e capacidade
- [Best Practices](/reference/best-practices/) - Otimize seu uso
- [API Reference](/reference/api/) - Revise o comportamento relacionado dos endpoints

