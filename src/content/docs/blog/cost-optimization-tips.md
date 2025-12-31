---
title: "10 Tips to Optimize Your TerraScale Costs"
date: 2024-08-05
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - optimization
  - cost
  - tips
excerpt: TerraScale's pricing is simple, but that doesn't mean you can't optimize. Here are 10 tips to get the most value from your database.
---

TerraScale's pricing is straightforward: you pay for storage and operations. But that doesn't mean you can't optimize. Here are 10 tips I share with developers to help them get the most value.

## 1. Use Queries, Not Scans

This is the biggest one. A query uses the partition key to find data directly. A scan reads every item in your database.

```csharp
// Good: Query by partition key
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "customer#123"
});

// Expensive: Scan everything
var allOrders = await client.ScanAsync(new ScanOptions());
```

If you're scanning regularly, redesign your data model.

## 2. Use Projection

Only fetch the attributes you need:

```csharp
// Fetches entire item (maybe 5KB)
var user = await client.GetItemAsync("user#123", "profile");

// Fetches only name and email (maybe 100 bytes)
var user = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ProjectionAttributes = new[] { "name", "email" }
});
```

Less data transferred = lower costs.

## 3. Batch Your Operations

Individual requests have overhead. Batch operations are more efficient:

```csharp
// Slow and expensive: 100 individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Fast and cheap: 1 batch request
var items = await client.BatchGetAsync(keys);
```

BatchGet supports up to 100 items. BatchWrite supports up to 25.

## 4. Don't Store Logs in TerraScale

TerraScale is optimized for operational data - things you query frequently with low latency requirements. Logs are append-only, rarely queried, and don't need sub-10ms response times.

Use a dedicated logging service instead. You'll save money and get better log-specific features.

## 5. Compress Large Attributes

If you're storing large JSON blobs or text, consider compression:

```csharp
var compressed = Compress(largeJsonString);
await client.PutItemAsync("doc#123", "content", new Dictionary<string, object>
{
    ["data"] = Convert.ToBase64String(compressed),
    ["compressed"] = true
});
```

Typical compression ratios of 3-4x mean significant storage savings.

## 6. Set TTL for Temporary Data

If data has a natural expiration, use TTL instead of manual cleanup:

```csharp
await client.PutItemAsync("session#abc", "data", new Dictionary<string, object>
{
    ["userId"] = "user#123",
    ["ttl"] = DateTimeOffset.UtcNow.AddHours(24).ToUnixTimeSeconds()
});
```

Expired items are deleted automatically at no cost.

## 7. Use the Right Item Size

TerraScale charges per operation, not per byte (for reads/writes). But there's a 400KB item limit, and larger items are slower.

If you have items over 100KB, consider:
- Splitting into multiple items
- Storing large content in blob storage with a reference in TerraScale
- Compressing the data

## 8. Consolidate Small Items

The flip side: if you have many tiny items that you always read together, consider combining them:

```csharp
// 10 individual items = 10 read operations
await client.GetItemAsync("user#123", "setting#theme");
await client.GetItemAsync("user#123", "setting#language");
// ... 8 more

// 1 combined item = 1 read operation
await client.GetItemAsync("user#123", "settings");
```

## 9. Use Staging Wisely

Your staging environment doesn't need a full copy of production data. A representative subset (10GB instead of 500GB) works fine for testing and saves storage costs.

## 10. Monitor Your Usage

The dashboard shows exactly where your costs come from:

- Storage by table
- Read/write operations by table
- Most expensive queries

Check it monthly. You'll often find quick wins.

## The Philosophy

TerraScale's pricing is designed to be predictable. You pay for what you use, and you can always see what you're using.

The goal isn't to minimize your bill at all costs - it's to make sure you're getting value for what you spend. A $100/month database bill that powers a $10,000/month business is a great deal.

Focus on building great software. Optimize costs when they become meaningful. And if you're ever unsure about the best approach, reach out at mariogk@terrascale.tech.
