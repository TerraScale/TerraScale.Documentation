---
title: "Going Global: Setting Up Multi-Region Replication"
date: 2024-09-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - multi-region
  - replication
  - tutorial
excerpt: Your users are everywhere. Your database should be too. Here's how to set up multi-region replication in TerraScale.
---

Your users are everywhere. Your database should be too.

TerraScale supports 19 regions worldwide. With multi-region replication, your data is automatically copied to regions you choose, giving users low-latency access no matter where they are.

Here's how to set it up.

## Why Multi-Region?

Three main reasons:

1. **Latency** - A user in Tokyo accessing data in us-east-1 adds 150-200ms of round-trip time. With a replica in ap-northeast-1, it's under 10ms.

2. **Availability** - If one region has an issue, reads can be served from another region.

3. **Compliance** - Some regulations require data to be stored in specific geographic locations.

## Setting Up Replication

### Via Dashboard

1. Go to your database settings
2. Click "Add Region"
3. Select the region(s) you want
4. Click "Enable Replication"

That's it. Existing data starts syncing immediately.

### Via SDK

```csharp
await client.Management.Databases.AddRegionAsync("my-database", new AddRegionRequest
{
    Region = "eu-west-1"
});
```

### Via API

```bash
POST /api/v1/management/databases/my-database/regions
{
    "region": "eu-west-1"
}
```

## How Replication Works

When you write to TerraScale:

1. The write goes to your primary region
2. It's acknowledged as soon as it's durable there
3. Asynchronously, the data is replicated to other regions
4. Replication typically completes in 100-500ms

```
Write in us-east-1 → Durable in us-east-1 (12ms) → Response to client
                   → Async replicate to eu-west-1 (~200ms)
                   → Async replicate to ap-northeast-1 (~300ms)
```

## Reading from Replicas

By default, reads go to the nearest region:

```csharp
var result = await client.GetItemAsync("user#123", "profile");
// Automatically routes to nearest region
```

If you need the absolute latest data, use a consistent read:

```csharp
var result = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ConsistentRead = true  // Routes to primary region
});
```

## Choosing Regions

Here's my mental model for choosing regions:

| User Location | Primary Region | Replica Regions |
|---------------|----------------|-----------------|
| Mostly US | us-east-1 | us-west-2 |
| US + Europe | us-east-1 | eu-west-1 |
| Global | us-east-1 | eu-west-1, ap-northeast-1 |
| Europe-focused | eu-west-1 | eu-central-1 |
| Asia-focused | ap-southeast-1 | ap-northeast-1 |

Start with your primary user base, then add regions as you grow.

## Available Regions

TerraScale runs in 19 regions:

**Americas:**
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-1 (N. California)
- us-west-2 (Oregon)
- ca-central-1 (Montreal)
- sa-east-1 (São Paulo)

**Europe:**
- eu-west-1 (Ireland)
- eu-west-2 (London)
- eu-west-3 (Paris)
- eu-central-1 (Frankfurt)
- eu-north-1 (Stockholm)

**Asia Pacific:**
- ap-northeast-1 (Tokyo)
- ap-northeast-2 (Seoul)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- ap-south-1 (Mumbai)

**Middle East & Africa:**
- me-south-1 (Bahrain)
- af-south-1 (Cape Town)

**Australia:**
- ap-southeast-2 (Sydney)

## Conflict Resolution

What happens if the same item is written in two regions simultaneously?

TerraScale uses last-writer-wins based on timestamp. The write with the later timestamp becomes the authoritative version.

For most use cases, this is fine. Users rarely update the same item from different continents at the exact same moment.

If you need stronger consistency, designate writes to go to your primary region:

```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "my-database",
    PreferredWriteRegion = "us-east-1"  // All writes go here
});
```

## Costs

Multi-region replication has costs:

- **Storage**: Each region stores a full copy of your data
- **Replication**: Data transfer between regions

For a 10GB database with 3 regions:
- Storage: 10GB × 3 = 30GB total
- Replication: Depends on write volume

The latency improvement is usually worth it for user-facing applications.

## Removing a Region

If you no longer need a region:

```csharp
await client.Management.Databases.RemoveRegionAsync("my-database", new RemoveRegionRequest
{
    Region = "eu-west-1"
});
```

Data in that region is deleted. The primary region and other replicas are unaffected.

## Monitoring Replication

The dashboard shows replication status:

- **Replication Lag**: Time behind primary
- **Sync Status**: Syncing, Synced, or Error
- **Last Sync**: When replication last completed

Healthy replication lag is under 1 second. If you see sustained lag over 5 seconds, check your write volume or reach out to support.

## Summary

1. Add regions where your users are
2. Reads automatically go to the nearest region
3. Use consistent reads when you need the latest data
4. Last-writer-wins for conflict resolution
5. Monitor replication lag in the dashboard

Questions about multi-region setup? Email mariogk@terrascale.tech.
