---
title: Best Practices
description: Best practices for building applications with TerraScale.
sidebar:
  order: 11
---

Best practices for building performant, reliable applications with TerraScale. Use this page as a practical checklist while you design keys, shape queries, and tune cost across regions.

---

## Key Design

### Use Meaningful Partition Keys

Design partition keys that distribute data evenly and support your access patterns:
```csharp
// Good: Distributes data by user
{ "pk": "user#123", "sk": "profile" }
{ "pk": "user#123", "sk": "order#001" }

// Avoid: All data in one partition
{ "pk": "all_users", "sk": "user#123" }
```

Why this matters in TerraScale: partition keys directly affect write distribution, read efficiency, and how well your workload scales across regions. A strong key strategy is one of the easiest ways to avoid avoidable latency and cost. See [Data Models](/reference/data-models/) for the core request types behind these patterns.

### Leverage Sort Keys for Related Items

Group related items under the same partition key:
```csharp
// User and their orders in same partition
{ "pk": "user#123", "sk": "profile" }
{ "pk": "user#123", "sk": "order#2024-001" }
{ "pk": "user#123", "sk": "order#2024-002" }

// Query all orders efficiently
var filter = new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};
```

Why this matters in TerraScale: colocating related items keeps common queries targeted. That usually means fewer reads, lower operation cost, and simpler pagination. For more query patterns, see [Querying Guide](/guides/querying/).

### Avoid Hot Partitions

Distribute writes across partition keys:
```csharp
// Bad: All writes to one partition
{ "pk": "orders", "sk": "order#12345" }

// Good: Partition by date or user
{ "pk": "orders#2024-01-15", "sk": "order#12345" }
{ "pk": "user#456#orders", "sk": "order#12345" }
```

Why this matters in TerraScale: hot partitions can show up quickly in global workloads where traffic from multiple regions converges on the same key. If one logical entity receives very high write volume, consider time bucketing, tenant bucketing, or another shard component in the key.

---

## Query Optimization

### Use Query Instead of Scan

Queries are efficient; scans read everything:
```csharp
// Good: Query by partition key
var result = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123"
});

// Avoid: Scan the entire database
var result = await client.ScanAsync(new PaginationOptions());
```

Why this matters in TerraScale: scans read far more data than queries, so they increase latency and can burn through request budgets faster. If you expect a production path to run frequently, design for `QueryAsync` first. Related limits are documented in [Rate Limits](/reference/rate-limits/).

### Limit Result Sizes

Always specify reasonable limits:
```csharp
var result = await client.QueryAsync(filter, new QueryOptions
{
    Limit = 50  // Don't fetch more than needed
});
```

Why this matters in TerraScale: query and scan responses are capped at 1 MB per response. Smaller page sizes also make retries cheaper and help you smooth out cross-region latency.

### Use Projection Expressions

Return only needed attributes:
```csharp
var options = new QueryOptions
{
    ProjectionAttributes = new[] { "name", "email" }  // Skip large attributes
};
```

Why this matters in TerraScale: returning only the attributes you need reduces payload size and keeps read costs more predictable, especially when documents contain large nested objects.

### Design for Access Patterns

Structure keys to support your queries:
```csharp
// Access pattern: Get user's orders by date
{ "pk": "user#123", "sk": "order#2024-01-15#001" }

// Now you can query by date range
SortKeyCondition.Between("order#2024-01-01", "order#2024-01-31")
```

Why this matters in TerraScale: access patterns should drive schema decisions. If you know you need date ranges, tenant views, or status buckets, encode that into keys early so you do not end up relying on expensive filtering later.

---

## Error Handling

### Always Check Results

Never assume operations succeed:
```csharp
var result = await client.GetItemAsync("user#123");

if (result.IsFailed)
{
    logger.LogError("Get failed: {Error}", result.Errors.First().Message);
    return null;
}

return result.Value;
```

Why this matters in TerraScale: many operational issues show up first as partial failures, validation problems, or throttling. Explicit result checks make those failures visible while they are still easy to recover from. See [API Reference](/reference/api/) for endpoint-level behavior.

### Implement Retry Logic

Handle transient failures gracefully:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(500),
        UseJitter = true
    }
});
```

Why this matters in TerraScale: network blips, short-lived replica transitions, and rate limiting are easier to absorb when retries are built in from the start. Pair retries with idempotent write patterns whenever you can.

### Log Errors with Context

Include operation details for debugging:
```csharp
if (result.IsFailed)
{
    logger.LogError(
        "Failed to get item PK={Pk} SK={Sk}: {Error}",
        pk, sk, result.Errors.First().Message
    );
}
```

Why this matters in TerraScale: request keys, region context, and operation type make incidents much faster to debug. Good logs also help you spot whether failures cluster around one access pattern or one hot partition.

---

## Transactions

### Use Transactions Only When Needed

Transactions have higher latency than batch operations:
```csharp
// Use batch for independent writes
await client.BatchWriteAsync(items);

// Use transactions only for atomic operations
await client.TransactWriteAsync(items);
```

Why this matters in TerraScale: transactions give you atomicity, but they usually cost more than independent batch operations and add coordination overhead. Use them for correctness boundaries, not as the default write path.

### Keep Transactions Small

Fewer items = faster execution:
```csharp
// Good: Small, focused transaction
var items = new List<TransactWriteItem>
{
    new() { Action = TransactAction.Put, ... },
    new() { Action = TransactAction.Update, ... }
};

// Avoid: Large transactions with many items
```

Why this matters in TerraScale: smaller transactions finish faster, fail in clearer ways, and are easier to retry safely. They also make it easier to stay within request-size limits.

### Use Idempotency Tokens

Prevent duplicate operations on retry:
```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: "order-12345-payment"
);
```

Why this matters in TerraScale: if a client retries after a timeout, idempotency tokens help you avoid duplicate writes or duplicate business events.

---

## Performance

### Use Batch Operations

Reduce network round trips:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

Why this matters in TerraScale: batch operations reduce round trips and help you stay efficient under request-per-second limits. Keep the documented per-request caps in mind, such as 25 items for batch write and 100 keys for batch get. See [Rate Limits](/reference/rate-limits/).

### Parallel Processing

Process independent operations concurrently:
```csharp
var tasks = partitions.Select(pk =>
    client.QueryAsync(new QueryFilter { PartitionKey = pk })
);

var results = await Task.WhenAll(tasks);
```

Why this matters in TerraScale: parallel reads can improve throughput for independent partitions, but too much concurrency can push you into throttling. Increase concurrency gradually and watch tail latency.

### Connection Pooling

Reuse client instances:
```csharp
// Good: Create once, reuse
public class MyService
{
    private readonly TerraScaleDatabase _client;

    public MyService(TerraScaleDatabase client)
    {
        _client = client;
    }
}

// Avoid: Creating new clients per request
```

Why this matters in TerraScale: reusing clients avoids repeated connection setup and keeps your application steadier under load.

---

## Security

### Use Specific Scopes

Grant minimum necessary permissions:
```csharp
// Good: Specific permissions
{ "scopes": ["database:read", "repository:read"] }

// Avoid: Overly broad permissions
{ "scopes": ["*"] }
```

Why this matters in TerraScale: narrow scopes reduce blast radius if a key leaks and make permission reviews much simpler.

### Rotate API Keys

Set expiration and rotate regularly:
```csharp
await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Production Key",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddMonths(3)
));
```

Why this matters in TerraScale: shorter-lived credentials are easier to contain during incidents and safer for automation that spans multiple teams or regions.

### Enable MFA

Protect accounts with two-factor authentication.

Why this matters in TerraScale: admin access often includes billing, key management, and production configuration. MFA adds an important layer of protection.

### Store Secrets Securely

Never commit API keys to source control:
```csharp
// Good: Environment variable
var apiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY");

// Good: Secret manager
var apiKey = await secretManager.GetSecretAsync("terrascale-api-key");

// Bad: Hardcoded
var apiKey = "ts_live_abc123...";
```

Why this matters in TerraScale: API keys often carry broad data access. Store them in a secret manager or environment variable, never in source control.

---

## Data Modeling

### Use Repositories for Domain Entities

Typed entities with schema validation:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

var customers = client.GetRepository<Customer>("customers");
```

Why this matters in TerraScale: repositories are a good fit when you want typed entities, shared validation, and cleaner application code. See [Repository Pattern](/guides/repository/) for a fuller walkthrough.

### Use Raw Items for Flexible Data

Dynamic attributes without schema:
```csharp
var item = new DatabaseItem
{
    PartitionKey = "config#app",
    Attributes = configData
};
```

Why this matters in TerraScale: raw items work well for settings, dynamic metadata, or migration phases where the shape is still changing.

### Denormalize for Read Performance

Store data in the shape you read it:
```csharp
// Instead of joining user and address
{ "pk": "user#123", "sk": "profile", "data": {
    "name": "John",
    "address": {  // Embedded, not referenced
        "street": "123 Main St",
        "city": "NYC"
    }
}}
```

Why this matters in TerraScale: joins are not the happy path in document and key-value workloads. Storing data in the form you read most often usually gives you more predictable latency.

---

## Monitoring

### Track Usage

Monitor your usage against plan limits:
```csharp
var usage = await client.Payment.GetUsageAsync();

if (usage.Value.TotalRequests > warningThreshold)
{
    logger.LogWarning("Approaching request limit");
}
```

Why this matters in TerraScale: usage tracking helps you catch rising request volume, storage growth, and region-related cost changes before they become surprises. If you are planning an upgrade, see [How to Choose a Plan](/guides/how-to-choose-a-plan/).

### Use Health Endpoints

Monitor API availability:
```bash
curl https://api.terrascale.io/health
```

Why this matters in TerraScale: health endpoints give you a clean signal for readiness and uptime checks during deploys and incident response. See [Health Endpoints](/reference/api/health/).

---

## Next Steps

- [Data Models](/reference/data-models/) - Review the core request and entity types
- [Rate Limits](/reference/rate-limits/) - Stay within limits
- [Querying Guide](/guides/querying/) - Design more efficient access patterns
- [API Reference](/reference/api/) - Review endpoint details
