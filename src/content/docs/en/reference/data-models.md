---
title: Data Models
description: Data structures and types used in the TerraScale SDK.
sidebar:
  order: 10
---

Data structures and types used in the TerraScale C# SDK.

The snippets on this page are illustrative reference shapes based on the current SDK concepts and common usage patterns. They are meant to help you understand the model surface quickly, not to replace IntelliSense or the exact package source for your installed version.

Unless noted otherwise, these examples assume the current C# SDK documented in this site. If you are on an older prerelease or an earlier package version, property names, defaults, and helper methods may differ slightly.

---

## DatabaseItem

Represents a raw database item with dynamic attributes.
```csharp
public sealed record DatabaseItem
{
    public required string PartitionKey { get; init; }
    public string? SortKey { get; init; }
    public required IReadOnlyDictionary<string, object?> Attributes { get; init; }
    public DateTime? CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Helper methods
    public T? GetAttribute<T>(string name);
    public T GetAttribute<T>(string name, T defaultValue);
}
```

### Required vs optional fields

- Required: `PartitionKey`, `Attributes`
- Optional: `SortKey`, `CreatedAt`, `UpdatedAt`

Use `DatabaseItem` when you want maximum flexibility and you do not need a strongly typed entity class.

### Usage
```csharp
var item = new DatabaseItem
{
    PartitionKey = "user#123",
    SortKey = "profile",
    Attributes = new Dictionary<string, object?>
    {
        ["name"] = "John Doe",
        ["email"] = "john@example.com",
        ["age"] = 30
    }
};

// Get attributes with type safety
var name = item.GetAttribute<string>("name");
var age = item.GetAttribute<int>("age", defaultValue: 0);
```

---

## QueryFilter

Filter conditions for query operations.
```csharp
public sealed record QueryFilter
{
    public required string PartitionKey { get; init; }
    public SortKeyCondition? SortKeyCondition { get; init; }
    public string? FilterExpression { get; init; }
    public IReadOnlyDictionary<string, object>? ExpressionAttributeValues { get; init; }
}
```

### Required vs optional fields

- Required: `PartitionKey`
- Optional: `SortKeyCondition`, `FilterExpression`, `ExpressionAttributeValues`

`PartitionKey` is the only required input because every TerraScale query starts from a partition.

### Usage
```csharp
var filter = new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};
```

---

## SortKeyCondition

Sort key comparison operators.
```csharp
public sealed record SortKeyCondition
{
    public required SortKeyOperator Operator { get; init; }
    public required object Value { get; init; }
    public object? Value2 { get; init; }  // For BETWEEN operator
}

public enum SortKeyOperator
{
    Equals,
    LessThan,
    LessThanOrEquals,
    GreaterThan,
    GreaterThanOrEquals,
    BeginsWith,
    Between
}
```

### Required vs optional fields

- Required: `Operator`, `Value`
- Optional: `Value2`, used for `Between`

Helper methods such as `BeginsWith` and `Between` are the easiest way to build these conditions correctly.

### Factory Methods
```csharp
// Exact match
SortKeyCondition.Equal("profile")

// Prefix match
SortKeyCondition.BeginsWith("order#")

// Range (inclusive)
SortKeyCondition.Between("2024-01-01", "2024-12-31")

// Comparisons
SortKeyCondition.LessThan("2024-06-01")
SortKeyCondition.LessThanOrEquals("2024-06-01")
SortKeyCondition.GreaterThan("2024-01-01")
SortKeyCondition.GreaterThanOrEquals("2024-01-01")
```

---

## PaginationOptions

Options for paginated requests.
```csharp
public record PaginationOptions
{
    public int Limit { get; init; } = 50;
    public string? NextToken { get; init; }
    public bool IncludeTotalCount { get; init; } = false;
}
```

### Required vs optional fields

- Required: none
- Optional: `Limit`, `NextToken`, `IncludeTotalCount`

If you do not set `Limit`, the SDK uses its default page size. Keep page sizes modest when you want lower latency and cheaper retries.

---

## QueryOptions

Extended options for query operations.
```csharp
public sealed record QueryOptions : PaginationOptions
{
    public string? IndexName { get; init; }
    public bool ScanForward { get; init; } = true;
    public IReadOnlyList<string>? ProjectionAttributes { get; init; }
}
```

### Required vs optional fields

- Required: none
- Optional: `IndexName`, `ScanForward`, `ProjectionAttributes`, plus inherited pagination fields

`QueryOptions` extends `PaginationOptions`, so you can combine sort direction, projection, and paging in one request.

### Usage
```csharp
var options = new QueryOptions
{
    Limit = 50,
    ScanForward = false,  // Descending order
    ProjectionAttributes = new[] { "name", "email" }
};
```

---

## PaginatedResult

Paginated response wrapper.
```csharp
public sealed record PaginatedResult<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public string? NextToken { get; init; }
    public bool HasMore => NextToken is not null;
    public long? TotalCount { get; init; }
}
```

### Required vs optional fields

- Required: `Items`
- Optional: `NextToken`, `TotalCount`

`HasMore` is a derived convenience property, so you can check for another page without inspecting `NextToken` directly.

### Pagination Example
```csharp
var result = await client.QueryAsync(filter, new QueryOptions { Limit = 50 });

// Process current page
foreach (var item in result.Value.Items)
{
    Console.WriteLine(item.PartitionKey);
}

// Get next page if available
if (result.Value.HasMore)
{
    var nextResult = await client.QueryAsync(filter, new QueryOptions
    {
        Limit = 50,
        NextToken = result.Value.NextToken
    });
}
```

---

## IEntity / EntityBase

Base interface and class for typed entities.
```csharp
public interface IEntity
{
    string GetPartitionKey();
    string? GetSortKey() => null;
}

public abstract record EntityBase : IEntity
{
    public required string Id { get; init; }
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; init; }
    public long Version { get; init; } = 1;

    public virtual string GetPartitionKey() => Id;
    public virtual string? GetSortKey() => null;
}
```

### Required vs optional fields

- `IEntity` requires an implementation of `GetPartitionKey()`
- `EntityBase` requires `Id`
- `UpdatedAt` is optional, `CreatedAt` and `Version` have defaults

Use `EntityBase` when you want a typed domain model with sensible defaults for timestamps and optimistic version tracking.

### Custom Entity Example
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public CustomerTier Tier { get; init; } = CustomerTier.Standard;
}

public record Order : EntityBase
{
    public required string CustomerId { get; init; }
    public required string OrderNumber { get; init; }
    public decimal Total { get; init; }

    // Custom key strategy
    public override string GetPartitionKey() => $"customer#{CustomerId}";
    public override string? GetSortKey() => $"order#{OrderNumber}";
}
```

---

## BatchWriteItem

Item for batch write operations.
```csharp
public record BatchWriteItem
{
    public required BatchOperation Operation { get; init; }
    public required string PartitionKey { get; init; }
    public string? SortKey { get; init; }
    public Dictionary<string, object?>? Data { get; init; }
}

public enum BatchOperation
{
    Put,
    Delete
}
```

### Required vs optional fields

- Required: `Operation`, `PartitionKey`
- Optional: `SortKey`, `Data`

Provide `Data` for `Put` operations. For `Delete`, keys are usually enough.

---

## TransactWriteItem

Item for transactional write operations.
```csharp
public record TransactWriteItem
{
    public required TransactAction Action { get; init; }
    public required string PartitionKey { get; init; }
    public string? SortKey { get; init; }
    public Dictionary<string, object?>? Data { get; init; }
    public string? ConditionExpression { get; init; }
}

public enum TransactAction
{
    Put,
    Update,
    Delete,
    ConditionCheck
}
```

### Required vs optional fields

- Required: `Action`, `PartitionKey`
- Optional: `SortKey`, `Data`, `ConditionExpression`

Transactions are best reserved for changes that must succeed or fail together.

---

## ItemKey

Simple key reference for batch get operations.
```csharp
public record ItemKey(string PartitionKey, string? SortKey = null);
```

### Required vs optional fields

- Required: `PartitionKey`
- Optional: `SortKey`

This lightweight type is handy when you need to batch fetch known records without sending full item payloads.

### Usage
```csharp
var keys = new List<ItemKey>
{
    new("user#123", "profile"),
    new("user#456", "profile"),
    new("user#789")  // No sort key
};

var result = await client.BatchGetAsync(keys);
```

---

## Next Steps

- [C# SDK](/guides/sdks/csharp/) - Full SDK documentation
- [Repository Pattern](/guides/repository/) - Typed entity storage
- [Best Practices](/reference/best-practices/) - Apply these models in production workloads
