---
title: "Transactions in TerraScale: When and How to Use Them"
date: 2024-08-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - transactions
  - deep-dive
  - tutorial
excerpt: Transactions let you update multiple items atomically. Here's when you need them, when you don't, and how to use them effectively.
---

Transactions are one of TerraScale's most powerful features - and one of the most misunderstood. Let me clear up when you need them, when you don't, and how to use them effectively.

## What Are Transactions?

A transaction lets you perform multiple operations that either all succeed or all fail. There's no middle ground.

```csharp
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "account#sender",
        SortKey = "balance",
        UpdateExpression = "SET balance = balance - 100"
    },
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "account#receiver",
        SortKey = "balance",
        UpdateExpression = "SET balance = balance + 100"
    }
});
```

If either update fails, neither happens. The money doesn't disappear into the void.

## When You Need Transactions

### Financial Operations

Moving money between accounts is the classic example. You need both the debit and credit to happen, or neither.

### Inventory Management

Decrementing stock and creating an order should be atomic:

```csharp
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "product#123",
        SortKey = "inventory",
        UpdateExpression = "SET quantity = quantity - 1",
        ConditionExpression = "quantity > 0"
    },
    new TransactWriteItem
    {
        Action = TransactAction.Put,
        PartitionKey = "order#456",
        SortKey = "details",
        Data = orderData
    }
});
```

### Cross-Entity Consistency

When two entities must stay in sync:

```csharp
// User joins a team - update both user and team
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "user#123",
        SortKey = "profile",
        UpdateExpression = "SET teamId = :teamId",
        ExpressionAttributeValues = new { teamId = "team#456" }
    },
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "team#456",
        SortKey = "metadata",
        UpdateExpression = "SET memberCount = memberCount + 1"
    }
});
```

## When You DON'T Need Transactions

### Independent Operations

If operations don't depend on each other, use batch writes instead:

```csharp
// These are independent - use BatchWrite, not Transaction
await client.BatchWriteAsync(new[]
{
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... }
});
```

BatchWrite is faster and cheaper than TransactWrite.

### Single Item Updates

For a single item, a regular PutItem or UpdateItem with a condition expression is sufficient:

```csharp
await client.UpdateItemAsync("account#123", "balance",
    "SET balance = balance - 100",
    conditionExpression: "balance >= 100"
);
```

### Read-Only Operations

For reading multiple items, use BatchGet or parallel queries:

```csharp
var items = await client.BatchGetAsync(keys);
```

TransactGet exists for cases where you need a consistent snapshot across items, but it's rarely necessary.

## Transaction Limits

Know the limits:

| Limit | Value |
|-------|-------|
| Items per transaction | 25 |
| Total size | 4MB |
| Items per partition | No limit |
| Cross-region | Not supported |

If you need more than 25 items, you'll need to restructure your operation or accept eventual consistency for some parts.

## Condition Expressions

The real power of transactions comes from condition expressions:

```csharp
new TransactWriteItem
{
    Action = TransactAction.Update,
    PartitionKey = "product#123",
    SortKey = "inventory",
    UpdateExpression = "SET quantity = quantity - :amount",
    ConditionExpression = "quantity >= :amount",
    ExpressionAttributeValues = new { amount = 5 }
}
```

If the condition fails, the entire transaction is cancelled. This prevents race conditions.

## Handling Transaction Failures

Transactions can fail for several reasons:

```csharp
var result = await client.TransactWriteAsync(items);

if (result.IsFailed)
{
    var error = result.Errors.First();

    if (error.Message.Contains("ConditionalCheckFailed"))
    {
        // A condition wasn't met - maybe retry with fresh data
    }
    else if (error.Message.Contains("TransactionCanceled"))
    {
        // Conflict with another transaction - retry
    }
    else
    {
        // Something else went wrong
    }
}
```

## Idempotency Tokens

For critical transactions, use idempotency tokens to prevent duplicate execution:

```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: $"order-{orderId}-payment"
);
```

If the same token is used within 10 minutes, TerraScale returns the previous result without re-executing.

## Performance Considerations

Transactions are more expensive than regular operations:

- ~2x the latency of a single write
- ~2x the cost in write units
- Lock contention on hot items

Use them when you need atomicity, not as a default.

## A Real Example

Here's a complete example of a purchase transaction:

```csharp
public async Task<Result> ProcessPurchase(string userId, string productId, int quantity)
{
    var result = await _db.TransactWriteAsync(new[]
    {
        // Decrement inventory
        new TransactWriteItem
        {
            Action = TransactAction.Update,
            PartitionKey = $"product#{productId}",
            SortKey = "inventory",
            UpdateExpression = "SET quantity = quantity - :qty",
            ConditionExpression = "quantity >= :qty",
            ExpressionAttributeValues = new { qty = quantity }
        },
        // Create order
        new TransactWriteItem
        {
            Action = TransactAction.Put,
            PartitionKey = $"user#{userId}",
            SortKey = $"order#{DateTime.UtcNow:O}",
            Data = new Dictionary<string, object>
            {
                ["productId"] = productId,
                ["quantity"] = quantity,
                ["status"] = "pending"
            }
        },
        // Update user's order count
        new TransactWriteItem
        {
            Action = TransactAction.Update,
            PartitionKey = $"user#{userId}",
            SortKey = "stats",
            UpdateExpression = "SET orderCount = if_not_exists(orderCount, 0) + 1"
        }
    });

    return result;
}
```

All three operations succeed together, or none of them do.

## Summary

- Use transactions when operations must be atomic
- Use batch operations when operations are independent
- Keep transactions small (under 25 items)
- Use condition expressions to prevent race conditions
- Handle failures gracefully with retries

Questions? Reach out at mariogk@terrascale.tech.
