---
title: Repository Pattern Guide
description: Store and query typed entities with schema validation using the repository pattern.
sidebar:
  order: 3
---

The repository pattern gives you a clean way to work with typed entities in TerraScale, while keeping schema validation, timestamps, and versioning built in.

If you already know the C# SDK basics, this guide will help you move from raw items to a more structured model that is easier to maintain.

## Before You Start

Make sure you have:

- The TerraScale C# SDK installed
- Authentication and client configuration working
- A database selected or configured as the default
- Basic C# knowledge, especially records, async/await, and collections

## Overview

Repositories offer:

- **Type Safety**: Work with strongly-typed entities
- **Schema Validation**: Ensure data consistency
- **Auto-Generated IDs**: Unique identifiers for each entity
- **Automatic Timestamps**: `createdAt` and `updatedAt` fields
- **Versioning**: Built-in optimistic concurrency

## When to Use Repositories

| Use Case | Repository | Raw Items |
|----------|------------|-----------|
| Domain entities with defined structure | Yes | - |
| Schema validation required | Yes | - |
| Dynamic/flexible data | - | Yes |
| Single-table design patterns | - | Yes |
| Type-safe SDKs | Yes | - |

## Defining Entities

### Step 1: Create Entity Class

Extend `EntityBase` for your entities:
```csharp
using TerraScale.Database.Client.Abstractions;

public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public string? Phone { get; init; }
    public CustomerTier Tier { get; init; } = CustomerTier.Standard;
    public List<string> Tags { get; init; } = new();
}

public enum CustomerTier
{
    Standard,
    Premium,
    Enterprise
}
```

### Step 2: Entity Base Properties

`EntityBase` provides these properties automatically:
```csharp
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

### Step 3: Custom Keys (Optional)

Override key methods for custom partitioning:
```csharp
public record Order : EntityBase
{
    public required string CustomerId { get; init; }
    public required string OrderNumber { get; init; }
    public decimal Total { get; init; }

    // Use customer as partition key
    public override string GetPartitionKey() => $"customer#{CustomerId}";

    // Use order number as sort key
    public override string? GetSortKey() => $"order#{OrderNumber}";
}
```

## Repository Operations

### Get Repository Reference
```csharp
var customers = client.GetRepository<Customer>("repo_customers");
```

### Create Entity
```csharp
var customer = new Customer
{
    Id = Guid.NewGuid().ToString(),
    Name = "Acme Corp",
    Email = "contact@acme.com",
    Tier = CustomerTier.Premium
};

var result = await customers.CreateAsync(customer);

if (result.IsSuccess)
{
    Console.WriteLine($"Created customer with ID: {result.Value.Id}");
}
```

### Get Entity
```csharp
var result = await customers.GetAsync(customerId);

if (result.IsSuccess)
{
    var customer = result.Value;
    Console.WriteLine($"Customer: {customer.Name}");
}
```

### Update Entity
```csharp
// Get existing entity
var getResult = await customers.GetAsync(customerId);
var customer = getResult.Value;

// Create updated version
var updated = customer with
{
    Tier = CustomerTier.Enterprise,
    Tags = customer.Tags.Append("upgraded").ToList()
};

// Save changes
var updateResult = await customers.UpdateAsync(updated);
```

### Delete Entity
```csharp
var result = await customers.DeleteAsync(customerId);

if (result.IsSuccess)
{
    Console.WriteLine("Customer deleted");
}
```

### List Entities
```csharp
var result = await customers.ListAsync(new PaginationOptions
{
    Limit = 50
});

if (result.IsSuccess)
{
    foreach (var customer in result.Value.Items)
    {
        Console.WriteLine($"{customer.Name} ({customer.Tier})");
    }

    // Handle pagination
    if (result.Value.HasMore)
    {
        var nextPage = await customers.ListAsync(new PaginationOptions
        {
            Limit = 50,
            NextToken = result.Value.NextToken
        });
    }
}
```

### Query Entities
```csharp
var filter = new QueryFilter
{
    PartitionKey = $"customer#{customerId}",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};

var result = await customers.QueryAsync(filter);
```

### Check Existence
```csharp
var result = await customers.ExistsAsync(customerId);

if (result.IsSuccess && result.Value)
{
    Console.WriteLine("Customer exists");
}
```

## Complete Example
```csharp
using TerraScale.Database.Client;
using TerraScale.Database.Client.Abstractions;
using TerraScale.Database.Client.Configuration;

public record Product : EntityBase
{
    public required string Name { get; init; }
    public required string Category { get; init; }
    public decimal Price { get; init; }
    public bool InStock { get; init; } = true;
    public List<string> Tags { get; init; } = new();
}

await using var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "ts_live_your_api_key",
    Endpoint = "https://api.terrascale.io",
    DefaultDatabase = "my-database"
});

var products = client.GetRepository<Product>("repo_products");
var product = new Product
{
    Id = "prod_001",
    Name = "Wireless Mouse",
    Category = "Electronics",
    Price = 29.99m,
    Tags = new() { "computer", "accessories" }
};

var createResult = await products.CreateAsync(product);
if (!createResult.IsSuccess)
{
    foreach (var error in createResult.Errors)
    {
        Console.WriteLine($"Create failed: {error.Message}");
    }

    return;
}

var getResult = await products.GetAsync(product.Id);
if (!getResult.IsSuccess)
{
    foreach (var error in getResult.Errors)
    {
        Console.WriteLine($"Load failed: {error.Message}");
    }

    return;
}

var loadedProduct = getResult.Value;
var updatedProduct = loadedProduct with { Price = 24.99m, InStock = false };

var updateResult = await products.UpdateAsync(updatedProduct);
if (!updateResult.IsSuccess)
{
    foreach (var error in updateResult.Errors)
    {
        Console.WriteLine($"Update failed: {error.Message}");
    }

    return;
}

var listResult = await products.ListAsync(new PaginationOptions { Limit = 100 });
if (listResult.IsSuccess)
{
    foreach (var item in listResult.Value.Items)
    {
        Console.WriteLine($"{item.Name}: ${item.Price}");
    }
}
else
{
    foreach (var error in listResult.Errors)
    {
        Console.WriteLine($"List failed: {error.Message}");
    }
}
```

This example shows the full flow you will usually need, create, read, update, and list, while checking each result before moving on.

## Schema Validation

When creating a repository via the Management API, define a schema:
```json
{
  "name": "products",
  "entityName": "Product",
  "schema": {
    "name": { "type": "string", "required": true, "minLength": 1 },
    "category": { "type": "string", "required": true },
    "price": { "type": "number", "required": true, "min": 0 },
    "inStock": { "type": "boolean", "required": false },
    "tags": { "type": "array", "required": false, "items": { "type": "string" } }
  }
}
```

Entities that don't match the schema will be rejected.

## Best Practices

### Use Immutable Records

C# records with `init` properties ensure immutability:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }  // Immutable after creation
}

// Update by creating new instance
var updated = customer with { Name = "New Name" };
```

### Handle Optimistic Concurrency

Use the `Version` property to detect conflicts:
```csharp
try
{
    await products.UpdateAsync(product);
}
catch (ConcurrencyException)
{
    // Another process updated the entity
    var fresh = await products.GetAsync(product.Id);
    // Merge changes and retry
}
```

### Design for Access Patterns

Override key methods to optimize queries:
```csharp
// If you often query by customer
public override string GetPartitionKey() => $"customer#{CustomerId}";
```

## Common Mistakes

- Calling `result.Value` before checking `result.IsSuccess`
- Forgetting to set `Id` when your entity requires one
- Treating repositories like raw item storage when your access pattern needs custom keys
- Updating stale entities without accounting for the `Version` field
- Skipping schema alignment between your C# entity and the repository schema

## Next Steps

- [Repository Operations API](/reference/api/repositories/) - API reference
- [Repository Management](/reference/management/repositories/) - Create repositories
- [C# SDK](/guides/sdks/csharp/) - Full SDK documentation
