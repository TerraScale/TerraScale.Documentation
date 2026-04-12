---
title: Replication
description: Information about TerraScale's data replication strategies.
---

## What Is Replication

Replication is the process of copying your data across multiple regions so it stays close to users and remains available when a region has issues.

In TerraScale, replication is a core part of the product. You choose the regions that matter to your application, and TerraScale keeps data flowing between them.

## How TerraScale Replication Works

When your application writes data, TerraScale accepts the write in the primary region and then replicates that change to the other regions configured for the database.

For reads, TerraScale routes requests to the nearest available region whenever possible. This helps keep latency low for globally distributed users.

## Read Behavior

Reads are served from the nearest available region by default. That means users in different parts of the world can often read from a nearby replica instead of crossing an ocean for every request.

From a usage perspective, a read counts as a single operation regardless of how many replica regions your database has configured.

## Write Behavior

Writes are applied in the primary region and then propagated to every configured replica region.

Because the system must process the write in each configured region, write cost scales with the number of regions. As a simple rule, one write is counted as one operation per region.

## Consistency Model

TerraScale provides strong consistency within a region and eventual consistency across regions.

That means a write is immediately durable in the region that accepted it, while other regions may observe that change shortly after replication completes.

For most globally distributed applications, this gives a good balance between low read latency and practical replication behavior.

## Configuring Replication

You can choose regions when you create a database, then add or remove regions as your traffic pattern changes.

Common reasons to add regions include:

- lowering read latency for a new geography
- improving regional resilience
- meeting data residency requirements

If you are just getting started, begin with the regions closest to your users today, then expand deliberately.

## Failover Behavior

If a region becomes unavailable, TerraScale can continue serving reads from other available regions.

This automatic failover behavior helps reduce downtime for distributed applications. Your users may see higher latency during a regional disruption, but reads can continue from healthy replicas when data is available there.

## Performance Considerations

Replication improves global read latency, but it also changes the write path and cost profile.

- More regions usually mean lower read latency for a broader audience
- More regions also mean more replication work for each write
- Write-heavy workloads should be deliberate about which regions they enable

For pricing details, see [Pricing](/reference/pricing/).

## See Also

- [Pricing](/reference/pricing/)
- [Getting Started](/guides/getting-started/)
- [Regions](/reference/regions/)
- [Going Global: Setting Up Multi-Region Replication](/blog/multi-region-setup/)
