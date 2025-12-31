---
title: Partition Keys and Sort Keys - A Mental Model That Actually Makes Sense
date: 2024-04-18
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - data-modeling
  - deep-dive
excerpt: I've explained partition keys to many developers. Here's the explanation that finally clicks for most people.
---

I've explained partition keys to many developers over the years. Some get it immediately. Most don't, and that's not their fault - most explanations are terrible.

Here's the mental model that finally clicks for most people.

## Forget Databases for a Second

Imagine you're organizing a library. Not a database, an actual library with physical books.

You have thousands of books and you need to organize them so people can find what they want quickly. Here's one approach:

**Partition = Bookshelf**

You put all books by the same author on the same bookshelf. "Stephen King" bookshelf, "Agatha Christie" bookshelf, etc.

**Sort Key = Position on shelf**

Within each bookshelf, books are sorted by publication date. "Carrie" comes before "The Shining" because it was published earlier.

Now when someone asks for "Stephen King books from the 1980s," you:

1. Go directly to the Stephen King bookshelf (partition key)
2. Scan only the 1980s section (sort key range)

You don't have to search the whole library. That's the magic.

## Back to Databases

In TerraScale, a partition key determines *where* your data lives. Items with the same partition key are stored together, on the same physical servers.

A sort key determines *how* items are organized within that partition. Items are sorted by their sort key, so range queries are fast.

Here's a concrete example:

```
Partition Key: "user#123"
├── Sort Key: "order#2024-001"  →  { total: 59.99, status: "shipped" }
├── Sort Key: "order#2024-002"  →  { total: 124.50, status: "pending" }
├── Sort Key: "order#2024-003"  →  { total: 89.00, status: "delivered" }
└── Sort Key: "profile"         →  { name: "Alice", email: "..." }
```

Getting all orders for user#123? One query, one network round trip:

```csharp
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
});
```

This returns all three orders. It's fast because TerraScale knows exactly which servers to ask - the ones holding the "user#123" partition.

## The Most Common Mistake

Here's where people go wrong: they make their partition key too broad or too narrow.

**Too broad:**
```
Partition Key: "all_orders"
Sort Key: "order#12345"
```

Now every order in your system is in one partition. One set of servers handles everything. That's a bottleneck waiting to happen.

**Too narrow:**
```
Partition Key: "order#12345"
Sort Key: null
```

Now every order is its own partition. Want to get all orders for a user? You need to query each order individually. That's slow and expensive.

**Just right:**
```
Partition Key: "user#123"
Sort Key: "order#2024-001"
```

Orders are grouped by user. You can efficiently get all orders for a user, but the load is distributed across many partitions.

## A Rule of Thumb

Your partition key should answer the question: "What do I usually query together?"

- Social app? Partition by user ID
- E-commerce? Partition by customer ID or product ID
- IoT? Partition by device ID
- Multi-tenant SaaS? Partition by tenant ID

Your sort key should answer: "Within that group, how do I want to filter or sort?"

- Time-series data? Sort by timestamp
- Hierarchical data? Sort by path
- Ordered items? Sort by sequence number

## When This Model Breaks Down

This mental model covers 90% of use cases. But sometimes you need to query across partitions.

Example: "Show me all orders over $100 across all users."

With the partition-by-user design, this query is expensive. You'd need to scan every user's orders.

Solutions:

1. **Secondary indexes** - Create an index with a different partition key (like order amount)
2. **Denormalization** - Store data in multiple formats
3. **Accept the cost** - Sometimes a full scan is fine if it's infrequent

We'll cover these patterns in a future post. For now, just know that partition key design has trade-offs, and that's okay.

## One More Thing

You can always change your data model later. I know that sounds scary with a database, but TerraScale makes it manageable:

1. Create items with the new key structure
2. Migrate existing data in batches
3. Update your application to use new keys
4. Delete old items when ready

It's not zero-cost, but it's not catastrophic either. So don't overthink your initial design. Start with something reasonable, measure how it performs, and iterate.

That's how real systems get built.
