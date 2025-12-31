---
title: How TerraScale Achieves Sub-10ms Latency Across 19 Regions
date: 2024-06-15
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - architecture
  - deep-dive
  - performance
excerpt: An honest look at TerraScale's architecture - what works, what's hard, and how we achieve low latency globally.
---

"How is TerraScale fast everywhere?"

I get this question a lot. The honest answer is: it's not magic, but it is deliberate. Every architectural decision we've made optimizes for latency. Here's how it works.

## The Basic Architecture

TerraScale runs in 19 regions globally. Each region has:

- **Edge nodes** - Handle TLS termination and request routing
- **Query coordinators** - Parse queries and plan execution
- **Storage nodes** - Actually store and retrieve data
- **Replication layer** - Sync data between regions

When you create a database, you pick a primary region. That's where your data lives authoritatively. But here's the key: reads can be served from any region where you've enabled replication.

## Why Edge Nodes Matter

Every request to TerraScale first hits an edge node. We have edge nodes in 40+ cities, including places that aren't full regions.

The edge node handles:

1. **TLS termination** - The expensive cryptographic handshake happens close to the user
2. **Request validation** - Malformed requests get rejected immediately
3. **Rate limiting** - Abusive traffic gets blocked at the edge
4. **Routing** - Determines which region should handle this request

This typically adds 1-3ms to a request, but it saves much more. A TLS handshake to a distant server can take 100ms+. Doing it at the edge makes everything else faster.

## The Query Path

Let's trace a simple read request:

```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage → Response
```

Total: ~8ms

Now let's trace a write:

```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage (write locally)
                                                            → Async replication to other regions
```

Total: ~12ms for the write, plus background replication

The key insight: we never make the user wait for cross-region operations. Writes are acknowledged as soon as they're durable in the primary region. Replication happens asynchronously.

## Consistency Trade-offs

This async replication means TerraScale offers eventual consistency for cross-region reads. If you write in Tokyo and immediately read in Frankfurt, you might get stale data.

For most applications, this is fine. User profiles, product catalogs, session data - a few hundred milliseconds of staleness doesn't matter.

But sometimes you need strong consistency:

```csharp
var result = await client.GetItemAsync("user#123", "profile", new ReadOptions
{
    ConsistentRead = true
});
```

With `ConsistentRead = true`, we route the read to the primary region, even if there's a closer replica. You pay the latency cost, but you get the freshest data.

## What Makes Storage Fast

Our storage layer is where most of the magic happens:

### SSDs Everywhere

All data lives on NVMe SSDs. The random read latency of an NVMe drive is about 0.1ms. For a spinning disk, it's 5-10ms. That difference compounds.

### Data Locality

Items with the same partition key are stored together on disk. When you query "all orders for user#123", we're doing sequential reads, not random seeks.

### In-Memory Indexes

Every storage node maintains an in-memory index of partition key → disk location. Looking up where data lives is a hash table lookup (~0.001ms), not a disk operation.

### Connection Pooling

We maintain persistent connections between all components. No TCP handshakes in the hot path. This saves about 2ms per request.

## The Numbers

Here's what we measure in production across all regions:

| Percentile | Read Latency | Write Latency |
|------------|--------------|---------------|
| p50 | 4ms | 7ms |
| p90 | 8ms | 15ms |
| p99 | 18ms | 35ms |
| p99.9 | 45ms | 80ms |

These are measured from the edge, so they include network time from the user to our edge node.

## Summary

There's no single trick to low latency. It's the compound effect of dozens of decisions:

- Edge nodes close to users
- Async replication so writes don't block on consensus
- NVMe storage with data locality
- In-memory indexes
- Connection pooling
- Efficient replication protocol

Each saves a few milliseconds. Together, they add up to a database that's fast everywhere.
