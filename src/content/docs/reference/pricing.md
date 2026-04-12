---
title: Pricing
description: How TerraScale counts operations, replication, queries, and storage for billing.
---

TerraScale pricing is built around simple, understandable usage. We try to keep the billing model close to the work the database is actually doing, while avoiding hard to explain billing units.

The billing and usage APIs expose customer facing metrics such as requests and storage. The examples on this page explain the relative amount of database work behind those metrics, especially for globally replicated workloads.

## Database Operations

In TerraScale, writes are more expensive for the system to process than reads because writes must be replicated and coordinated across regions. Even so, TerraScale keeps customer facing usage reporting simpler than the internal work model so plans are easier to understand.

That means you can reason about usage without learning a custom billing language, while still understanding that some operations place more work on the platform than others.

## Global Replication Costs

Global replication is one of TerraScale's core features. Replication affects pricing because a write must be applied in every configured region.

### How writes are counted

If your database replicates to 10 regions, a single write can be thought of as work performed 10 times, once per region.

For example:

- 1 document write in 10 regions: roughly 10 write operations of work
- 1 document update in 10 regions: roughly 10 write operations of work

### How reads are counted

Reads are different. A read is typically served from the closest region, so a single document read usually counts as one operation of work.

This is why globally distributed write heavy workloads cost more to operate than read heavy workloads.

## Query Costs

Queries are harder to predict than simple reads and writes because cost and latency depend on whether TerraScale can use an index efficiently.

For customers, the important guidance is that indexed queries are cheaper for the platform to serve and usually faster in practice than scan heavy queries.

### Indexed queries

Queries that use index friendly operators, such as equality and range comparisons, are generally fast and scale well.

Examples of index friendly operators include:

- `$eq`
- `$gt`
- `$gte`
- `$lt`
- `$lte`

### Scan heavy queries

Queries that cannot use an index efficiently, such as broad regex searches, may require the database to inspect many documents before returning a result. These queries are slower and place more load on the system.

### Query example

This query can often use an index efficiently:

```json
{
  "_id": {
    "$gt": 1
  }
}
```

By contrast, a condition that forces broad scanning or per document evaluation may cost more in latency and system work, even when it returns only a small result set.

## Storage

Storage pricing reflects the fact that TerraScale keeps multiple copies of your data in each region for availability and operational safety.

For each region, TerraScale maintains redundant copies so upgrades and maintenance can be rolled out without taking the database offline. That redundancy is part of the service you are paying for, and it is one reason storage is not priced the same way as a single disk on a single server.

## Optimizing Costs

You can usually lower cost and improve performance with a few straightforward habits.

### Prefer indexed filters

Use filters based on indexed fields whenever possible. Equality and range queries are usually much more efficient than regex or broad negative conditions.

### Keep result sets small

Avoid fetching more data than you need. TerraScale limits query responses to 100 items per request, and pagination is strongly recommended.

### Be deliberate with replication

Replicate to the regions your application actually needs. More regions improve geographic coverage, but they also multiply write work.

### Review expensive query patterns

If a query must scan large portions of a collection, consider:

- adding or adjusting indexes
- changing the access pattern
- precomputing common views
- narrowing the filter before applying expensive operators

## Related

- [Compensation Policy](/reference/compesation/)
- [Plans](/reference/plans/)
- [Replication](/reference/replication/)
- [Best Practices](/reference/best-practices/)
