---
title: Rate Limits
description: Rate limits and quotas for TerraScale API operations.
sidebar:
  order: 8
---

Rate limits protect the platform and help keep performance predictable for everyone using TerraScale. This page shows the request caps, payload limits, and plan quotas you should design around.

---

## Operation Limits

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

## Request Rate Limits

Rate limits depend on your plan tier:

| Plan | Limit |
|------|-------|
| Free | 100 requests/second |
| Pro | 1,000 requests/second |
| Enterprise | Custom (contact sales) |

These request limits are enforced per second. Monthly request quotas, listed later on this page, are tracked separately.

---

## Rate Limit Response

When rate limited, the API returns HTTP 429:
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

When you hit a limit, TerraScale rejects the request instead of queueing it for you. Your client should pause, wait for the `Retry-After` value or the rate-limit reset time, then retry with backoff.

### Headers

| Header | Description |
|--------|-------------|
| `Retry-After` | Seconds to wait before retrying |
| `X-RateLimit-Limit` | Maximum requests per window |
| `X-RateLimit-Remaining` | Requests remaining in window |
| `X-RateLimit-Reset` | Unix timestamp when limit resets |

---

## Plan Quotas

### Free Plan

| Resource | Limit |
|----------|-------|
| Databases | 3 |
| Storage | 100 MB |
| Requests/month | 10,000 |
| Team Members | 1 |

### Pro Plan

| Resource | Limit |
|----------|-------|
| Databases | 10 |
| Storage | 10 GB |
| Requests/month | 1,000,000 |
| Team Members | 10 |

### Enterprise Plan

| Resource | Limit |
|----------|-------|
| Databases | Unlimited |
| Storage | Unlimited |
| Requests/month | Unlimited |
| Team Members | Unlimited |

---

## Handling Rate Limits

If you burst past the configured window, expect a `429 Too Many Requests` response. Short spikes usually clear quickly. Repeated throttling is a sign that you should lower concurrency, batch more work, or move to a higher plan.

### Retry with Exponential Backoff
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

### Client SDK Automatic Retry

The TerraScale SDK handles rate limits automatically:
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

If you build your own retry layer, prefer jittered exponential backoff and respect the server-provided retry window whenever it is present.

---

## Best Practices

### Batch Operations

Instead of many small requests, use batch operations:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

This is especially helpful in TerraScale because fewer round trips usually means fewer chances to hit per-second request caps.

### Request Queuing

For high-volume applications, implement a request queue:
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

Start with conservative concurrency and increase gradually. That gives you cleaner latency data and helps prevent bursts from overwhelming one hot partition or one client instance.

### Monitor Usage

Track your usage to stay within limits:
```csharp
var usage = await client.Payment.GetUsageAsync();

Console.WriteLine($"Requests this month: {usage.Value.TotalRequests}");
Console.WriteLine($"Storage used: {usage.Value.TotalStorageGb} GB");
```

Watch both dimensions: short-term request rate and long-term monthly quota. They solve different problems, and you can hit either one first.

---

## Increasing Limits

### Upgrade Plan

Higher plans have higher limits. See [How to Choose a Plan](/guides/how-to-choose-a-plan/) for guidance.

### Enterprise Custom Limits

Contact sales@terrascale.io for:

- Custom rate limits
- Dedicated capacity
- SLA guarantees
- Volume discounts

---

## Next Steps

- [How to Choose a Plan](/guides/how-to-choose-a-plan/) - Compare plan fit and capacity
- [Best Practices](/reference/best-practices/) - Optimize your usage
- [API Reference](/reference/api/) - Review related endpoint behavior
