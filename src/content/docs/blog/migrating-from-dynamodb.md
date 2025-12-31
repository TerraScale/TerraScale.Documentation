---
title: Migrating from DynamoDB to TerraScale - A Complete Guide
date: 2024-05-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - migration
  - dynamodb
  - guide
excerpt: TerraScale offers a DynamoDB-compatible API that makes migration straightforward. Here's the complete playbook for moving your data.
---

One of the questions I get most often is: "How do I migrate from DynamoDB to TerraScale?"

The good news is that we designed TerraScale with migration in mind. Our DynamoDB-compatible API means you can often switch with minimal code changes. Here's the complete guide.

## Why Migrate?

Before diving into how, let's talk about why you might want to migrate:

1. **Simpler pricing** - TerraScale's pay-per-operation model is often more predictable than DynamoDB's capacity units
2. **Multiple APIs** - Use SQL, REST, or DynamoDB-compatible APIs against the same data
3. **Better developer experience** - First-class SDKs with modern patterns like Result types
4. **Transparent costs** - No surprise bills from forgotten auto-scaling policies

That said, DynamoDB is excellent. If it's working for you, there's no urgent need to switch.

## Migration Strategies

There are three main approaches, each with trade-offs:

### Strategy 1: Big Bang

Export everything from DynamoDB, import to TerraScale, update your application to point to TerraScale.

**Pros:**
- Simplest conceptually
- Clean cutover

**Cons:**
- Requires downtime
- Risky for large datasets
- All-or-nothing

**Best for:** Small datasets, applications that can tolerate planned downtime.

### Strategy 2: Dual Write

Update your application to write to both databases. Backfill historical data. Gradually shift reads to TerraScale. Eventually stop writing to DynamoDB.

**Pros:**
- Zero downtime
- Gradual, safe transition
- Easy rollback

**Cons:**
- More complex implementation
- Temporary cost of running two databases
- Need to handle consistency carefully

**Best for:** Production systems that can't tolerate downtime.

### Strategy 3: Incremental by Table

Migrate one table at a time. Each table goes through its own dual-write cycle.

**Pros:**
- Lower risk per migration
- Learn from each iteration
- Easier to manage

**Cons:**
- Takes longer overall
- Cross-table queries are complex during migration

**Best for:** Large systems with many independent tables.

## The Dual Write Pattern

Since dual write is the safest approach for most production systems, here's how to implement it:

### Step 1: Set Up TerraScale

Create your database and generate an API key. Make sure your table structure matches DynamoDB.

### Step 2: Implement Dual Write

```csharp
public class DualWriteRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly TerraScaleDatabase _terraScale;
    private readonly ILogger _logger;

    public async Task PutItemAsync(string pk, string sk, Dictionary<string, object> data)
    {
        // Write to DynamoDB first (primary)
        await _dynamoDb.PutItemAsync(/* ... */);

        // Write to TerraScale (secondary)
        try
        {
            await _terraScale.PutItemAsync(pk, sk, data);
        }
        catch (Exception ex)
        {
            // Log but don't fail - TerraScale is secondary during migration
            _logger.LogWarning(ex, "TerraScale write failed, will retry");
            await QueueForRetry(pk, sk, data);
        }
    }
}
```

### Step 3: Backfill Historical Data

Use DynamoDB Streams or a batch export to sync existing data:

```csharp
public async Task BackfillFromDynamoDB()
{
    string? lastKey = null;

    do
    {
        var scanResult = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = "my-table",
            ExclusiveStartKey = lastKey != null ? ParseKey(lastKey) : null
        });

        foreach (var item in scanResult.Items)
        {
            await _terraScale.PutItemAsync(
                item["pk"].S,
                item["sk"].S,
                ConvertAttributes(item)
            );
        }

        lastKey = scanResult.LastEvaluatedKey?.ToString();

        // Respect rate limits
        await Task.Delay(100);

    } while (lastKey != null);
}
```

### Step 4: Shift Read Traffic

Use a feature flag to gradually shift reads:

```csharp
public async Task<Item?> GetItemAsync(string pk, string sk)
{
    if (_featureFlags.TerraScaleReadEnabled)
    {
        try
        {
            var result = await _terraScale.GetItemAsync(pk, sk);
            if (result.IsSuccess)
                return result.Value;
        }
        catch
        {
            // Fall back to DynamoDB
        }
    }

    return await _dynamoDb.GetItemAsync(/* ... */);
}
```

Start with 1% of traffic, monitor, then increase to 10%, 50%, 100%.

### Step 5: Verify and Cutover

Once 100% of reads are on TerraScale and you're confident in the data:

1. Stop writes to DynamoDB
2. Update your application to use TerraScale only
3. Keep DynamoDB as read-only backup for 30 days
4. Decommission DynamoDB

## Using the DynamoDB-Compatible API

TerraScale offers a DynamoDB-compatible endpoint. This means you can use your existing AWS SDK code with minimal changes:

```csharp
// Before: DynamoDB
var dynamoClient = new AmazonDynamoDBClient();

// After: TerraScale (DynamoDB-compatible endpoint)
var config = new AmazonDynamoDBConfig
{
    ServiceURL = "https://dynamodb.terrascale.io"
};
var terraScaleClient = new AmazonDynamoDBClient(
    new BasicAWSCredentials("your-api-key", "ignored"),
    config
);

// Your existing code works unchanged
await terraScaleClient.PutItemAsync(/* same code as before */);
```

This compatibility layer supports:
- GetItem, PutItem, DeleteItem, UpdateItem
- Query and Scan
- BatchGetItem, BatchWriteItem
- TransactGetItems, TransactWriteItems

## Common Gotchas

### Timestamps

DynamoDB often stores timestamps as numbers (Unix epoch). TerraScale's SDK prefers ISO 8601 strings. Be explicit about your format:

```csharp
// Works in both
["createdAt"] = DateTime.UtcNow.ToString("O")
```

### Reserved Words

TerraScale has fewer reserved words than DynamoDB, but check your attribute names just in case.

### Condition Expressions

The syntax is nearly identical, but test your complex conditions during migration.

## Verification Checklist

Before completing migration:

- [ ] All data backfilled and verified
- [ ] 100% of reads serving from TerraScale
- [ ] 100% of writes going to TerraScale
- [ ] Monitoring and alerts configured
- [ ] Rollback procedure documented
- [ ] Team trained on TerraScale dashboard

## Need Help?

Migration can be stressful. If you're planning a large migration, reach out to mariogk@terrascale.tech. I'm happy to review your plan and offer suggestions.
