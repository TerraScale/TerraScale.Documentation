---
title: Use cases for TerraScale
description: Common use cases and recommended patterns for TerraScale.
---

## Common Use Cases

### Real-Time Gaming

TerraScale works well for gaming workloads that need fast reads, frequent writes, and global availability.

Common patterns include:

- leaderboards
- player state and inventory
- live session data

See [Building a Real-Time Gaming Leaderboard with TerraScale](/blog/building-realtime-leaderboard/).

### IoT and Sensor Data

IoT systems often generate steady streams of writes from devices spread across regions. TerraScale is a strong fit for:

- time-series style readings
- current device state
- high write throughput ingestion pipelines

This works best when you model data around device identifiers, time windows, or other predictable access patterns.

### E-Commerce

E-commerce applications usually need low-latency access to user-facing data and durable storage for frequently updated records.

Typical workloads include:

- product catalogs
- shopping carts
- user sessions

TerraScale can help keep these reads fast for customers in different regions while preserving a straightforward operational model.

### SaaS Applications

TerraScale is a natural fit for multi-tenant SaaS products that need predictable access patterns and low operational overhead.

Common examples include:

- tenant-scoped application data
- user preferences
- feature flags and configuration stores

This is especially useful when your customers are spread across multiple geographies and expect responsive reads close to their location.

### Financial Transaction Logs

Financial platforms and internal ledger systems often need append-heavy storage patterns and reliable audit history.

TerraScale is a good fit for:

- audit trails
- event sourcing records
- compliance-oriented activity logs

These workloads usually benefit from carefully designed keys, small result sets, and explicit pagination.

## When TerraScale Is a Great Fit

TerraScale is especially compelling when:

- your users are distributed globally
- low read latency matters to the product experience
- you want simpler usage-based pricing
- you are migrating from DynamoDB and want a familiar path

It also works well when your access patterns are known upfront and your application benefits from multi-region reads.

## When to Consider Alternatives

You may want to consider another system if your workload depends on:

- complex relational queries and many joins
- heavy aggregation or analytical pipelines
- very large blob or media storage inside the database itself

In those cases, TerraScale may still fit part of the architecture, but it should not be the only persistence layer by default.

## Getting Started

If one of these patterns matches your application, start with the [Getting Started guide](/guides/getting-started/).

## See Also

- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)
- [Comparisons](/reference/comparisons/)
- [Replication](/reference/replication/)
