---
title: Límites de tasa
description: Límites de tasa y cuotas para las operaciones de la API de TerraScale.
sidebar:
  order: 8
---

Los límites de tasa protegen la plataforma y ayudan a mantener el rendimiento predecible para todos los que usan TerraScale. Esta página muestra los topes de solicitudes, límites de payload y cuotas del plan que debes tener en cuenta al diseñar.

---

## Límites de operación

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

## Límites de tasa de solicitudes

Los límites de tasa dependen de tu plan:

| Plan | Limit |
|------|-------|
| Free | 100 requests/second |
| Pro | 1,000 requests/second |
| Enterprise | Custom (contact sales) |

Estos límites de solicitud se aplican por segundo. Las cuotas mensuales de solicitudes, que aparecen más abajo en esta página, se siguen por separado.

---

## Respuesta de rate limit

Cuando hay rate limiting, la API devuelve HTTP 429:
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

Cuando alcanzas un límite, TerraScale rechaza la solicitud en lugar de ponerla en cola. Tu cliente debe pausar, esperar el valor de `Retry-After` o el momento de reinicio del límite, y luego reintentar con backoff.

### Encabezados

| Header | Description |
|--------|-------------|
| `Retry-After` | Segundos que debes esperar antes de reintentar |
| `X-RateLimit-Limit` | Máximo de solicitudes por ventana |
| `X-RateLimit-Remaining` | Solicitudes restantes en la ventana |
| `X-RateLimit-Reset` | Timestamp Unix de cuándo se reinicia el límite |

---

## Cuotas del plan

### Plan Free

| Resource | Limit |
|----------|-------|
| Databases | 3 |
| Storage | 100 MB |
| Requests/month | 10,000 |
| Team Members | 1 |

### Plan Pro

| Resource | Limit |
|----------|-------|
| Databases | 10 |
| Storage | 10 GB |
| Requests/month | 1,000,000 |
| Team Members | 10 |

### Plan Enterprise

| Resource | Limit |
|----------|-------|
| Databases | Unlimited |
| Storage | Unlimited |
| Requests/month | Unlimited |
| Team Members | Unlimited |

---

## Cómo manejar los rate limits

Si te pasas de la ventana configurada, espera una respuesta `429 Too Many Requests`. Los picos cortos suelen desaparecer rápido. El throttling repetido es una señal de que debes bajar la concurrencia, agrupar más trabajo o pasar a un plan superior.

### Reintento con exponential backoff
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

### Reintento automático en el Client SDK

El SDK de TerraScale maneja los rate limits automáticamente:
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

Si construyes tu propia capa de reintentos, prefiere exponential backoff con jitter y respeta la ventana de retry proporcionada por el servidor siempre que exista.

---

## Buenas prácticas

### Operaciones por lotes

En lugar de muchas solicitudes pequeñas, usa operaciones por lotes:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

Esto es especialmente útil en TerraScale porque menos round trips suelen significar menos posibilidades de alcanzar los topes de solicitudes por segundo.

### Cola de solicitudes

Para aplicaciones de alto volumen, implementa una cola de solicitudes:
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

Empieza con una concurrencia conservadora y súbela poco a poco. Eso te da datos de latencia más limpios y ayuda a evitar que los picos saturen una partición caliente o una instancia de cliente.

### Monitoriza el uso

Sigue tu uso para mantenerte dentro de los límites:
```csharp
var usage = await client.Payment.GetUsageAsync();

Console.WriteLine($"Requests this month: {usage.Value.TotalRequests}");
Console.WriteLine($"Storage used: {usage.Value.TotalStorageGb} GB");
```

Observa ambas dimensiones: la tasa de solicitudes a corto plazo y la cuota mensual a largo plazo. Resuelven problemas distintos y puedes alcanzar cualquiera de las dos primero.

---

## Aumentar límites

### Mejora de plan

Los planes superiores tienen límites más altos. Consulta [How to Choose a Plan](/guides/how-to-choose-a-plan/) para orientarte.

### Límites personalizados en Enterprise

Contacta con sales@terrascale.io para:

- límites de tasa personalizados
- capacidad dedicada
- garantías de SLA
- descuentos por volumen

---

## Próximos pasos

- [How to Choose a Plan](/guides/how-to-choose-a-plan/) - Compara ajuste del plan y capacidad
- [Best Practices](/reference/best-practices/) - Optimiza tu uso
- [API Reference](/reference/api/) - Revisa el comportamiento relacionado de los endpoints

