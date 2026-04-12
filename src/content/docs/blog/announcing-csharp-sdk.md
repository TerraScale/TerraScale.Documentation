---
title: "Announcing the TerraScale C# SDK: First-Class .NET Support"
date: 2024-07-03
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - announcement
  - sdk
  - dotnet
excerpt: Today we're releasing the official TerraScale C# SDK. Here's what's in the box, why we built it, and how to get started.
cover:
  wide: /images/blog/announcing-csharp-sdk/cover-wide.svg
  square: /images/blog/announcing-csharp-sdk/cover-square.svg
  alt: Precise bracketed engineering forms and modular nodes, evoking a polished new SDK release.
---

Today we're releasing the official TerraScale C# SDK. It's been in Public Alpha for three months and I'm genuinely proud of how it turned out.

## What you'll learn

- Why we started with C# before other SDKs
- What the SDK gives you out of the box
- Where to go next if you want to build a real app with it

For the full product docs, keep the [C# SDK guide](/guides/sdks/csharp/), [repository guide](/guides/repository/), and [error handling reference](/reference/error-handling/) nearby.

## Why C# First?

When we started building SDKs, we had to pick a language to start with. JavaScript would have been the obvious choice, it's everywhere. But we looked at our early users and noticed something interesting: a disproportionate number were .NET shops.

The Venn diagram of "developers who want a DynamoDB-like experience" and "developers building with C#" has a lot of overlap. Many developers are migrating from Azure Cosmos DB or building high-performance backends where C# shines.

So C# it was.

## What's In the Box

### Installation
```bash
dotnet add package TerraScale.Client
```

That's it. No native dependencies, no complex setup. It works on .NET 6, 7, and 8.

### Basic Usage
```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "my-database"
});

// Write an item
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech",
    ["createdAt"] = DateTime.UtcNow
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
if (result.IsSuccess)
{
    var name = result.Value.GetAttribute<string>("name");
    Console.WriteLine($"Hello, {name}!");
}
```

### The Repository Pattern

Raw dictionaries are fine for prototyping, but production code deserves better:
```csharp
public record User : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

var users = client.GetRepository<User>("users");

var user = new User
{
    Id = "user-123",
    Name = "Mario",
    Email = "mariogk@terrascale.tech"
};

await users.CreateAsync(user);
var retrieved = await users.GetByIdAsync("user-123");
Console.WriteLine(retrieved.Value.Name); // Mario
```

### Result Types

Every SDK operation returns a `Result<T>` type. No exceptions for expected failures:
```csharp
var result = await client.GetItemAsync("user#123", "profile");

var message = result switch
{
    { IsSuccess: true } => $"Found: {result.Value.PartitionKey}",
    { IsFailed: true } => $"Error: {result.Errors.First().Message}",
    _ => "Unknown state"
};
```

### Retry Policies

Transient failures are handled automatically:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "...",
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(100),
        MaxDelay = TimeSpan.FromSeconds(5),
        UseJitter = true
    }
});
```

## Performance

These numbers come from our internal benchmarking. They are best used as directional guidance, not a promise that every workload will behave exactly the same.

| Operation | Throughput | Memory |
|-----------|------------|--------|
| PutItem (1KB) | 15,000/sec | ~2KB/op |
| GetItem | 25,000/sec | ~1KB/op |
| Query (100 items) | 800/sec | ~50KB/op |
| Batch (25 items) | 2,000/sec | ~20KB/op |

## What's Coming

- **LINQ provider** - Query with `Where`, `Select`, `Take`
- **Change tracking** - Automatic dirty detection
- **Interceptors** - Hook into the request pipeline
- **AOT support** - Full Native AOT compatibility

## Getting Started

The [SDK documentation](/guides/sdks/csharp/) has everything you need. But honestly, just install the package and start coding.
```bash
dotnet add package TerraScale.Client
```

If you run into issues, reach out at mariogk@terrascale.tech. If you're new to TerraScale itself, pair the SDK docs with the [Getting Started guide](/guides/getting-started/).

Happy coding!
