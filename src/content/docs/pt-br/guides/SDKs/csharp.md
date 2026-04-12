---
title: Cliente de banco de dados C#
description: Guia completo para usar o SDK TerraScale Database Client para C# e .NET.
sidebar:
  order: 1
  badge:
    text: Novo
    variant: tip
---

O TerraScale Database Client oferece uma forma tipada e prática de ler e gravar dados a partir de aplicações C# e .NET.

Este guia começa com um caminho rápido até sua primeira requisição bem-sucedida, depois apresenta as principais operações que você vai usar em produção.

## Início rápido

Se você quer ir da instalação até sua primeira leitura rapidamente, comece aqui.

### 1. Instale o pacote
```bash
dotnet add package TerraScale.Database.Client
```

### 2. Configure o cliente
```csharp
using TerraScale.Database.Client;
using TerraScale.Database.Client.Configuration;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "ts_live_your_api_key",
    Endpoint = "https://api.terrascale.io",
    Region = "us-east-1",
    DefaultDatabase = "my-database"
});
```

### 3. Crie seu primeiro item
```csharp
var writeResult = await client.PutItemAsync(new DatabaseItem
{
    PartitionKey = "user#123",
    SortKey = "profile",
    Attributes = new Dictionary<string, object?>
    {
        ["name"] = "John Doe",
        ["email"] = "john@example.com",
        ["age"] = 30
    }
});
```

### 4. Leia o item de volta
```csharp
var readResult = await client.GetItemAsync("user#123", "profile");

if (readResult.IsSuccess)
{
    var item = readResult.Value;
    Console.WriteLine($"Loaded {item.GetAttribute<string>("name")}");
}
```

### 5. Descarte o cliente
```csharp
await client.DisposeAsync();
```

## Instalação
```bash
dotnet add package TerraScale.Database.Client
```

## Configuração

### Configuração básica
```csharp
using TerraScale.Database.Client;
using TerraScale.Database.Client.Configuration;

var options = new TerraScaleDatabaseOptions
{
    ApiKey = "ts_live_your_api_key",
    Endpoint = "https://api.terrascale.io",
    Region = "us-east-1",
    DefaultDatabase = "my-database",
    Timeout = TimeSpan.FromSeconds(30),
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(500),
        MaxDelay = TimeSpan.FromSeconds(10),
        UseJitter = true
    }
};

var client = new TerraScaleDatabase(options);
```

### Opções de configuração

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ApiKey` | string | Required | Your API key |
| `Endpoint` | string | Required | API endpoint URL |
| `Region` | string | `"us-east-1"` | Default region |
| `DefaultDatabase` | string | null | Default database ID |
| `Timeout` | TimeSpan | 30 seconds | HTTP request timeout |
| `Retry.MaxRetries` | int | 3 | Max retry attempts |
| `Retry.BaseDelay` | TimeSpan | 500ms | Initial retry delay |
| `Retry.MaxDelay` | TimeSpan | 10 seconds | Maximum retry delay |
| `Retry.UseJitter` | bool | true | Add randomness to delays |

### Builder pattern
```csharp
var client = TerraScaleDatabase.Create(options => options
    .WithApiKey("ts_live_your_api_key")
    .WithEndpoint("https://api.terrascale.io")
    .WithDefaultDatabase("my-database")
    .WithTimeout(TimeSpan.FromSeconds(60))
    .WithRetry(retry => retry
        .MaxRetries(5)
        .BaseDelay(TimeSpan.FromSeconds(1))
    )
);
```

## Operações com itens

### Put Item
```csharp
var item = new DatabaseItem
{
    PartitionKey = "user#123",
    SortKey = "profile",
    Attributes = new Dictionary<string, object?>
    {
        ["name"] = "John Doe",
        ["email"] = "john@example.com",
        ["age"] = 30,
        ["tags"] = new[] { "premium", "verified" }
    }
};

var result = await client.PutItemAsync(item);

if (result.IsSuccess)
{
    Console.WriteLine("Item saved!");
}
else
{
    Console.WriteLine($"Error: {result.Errors.First().Message}");
}
```

### Get Item
```csharp
// Get by partition key only
var result = await client.GetItemAsync("user#123");

// Get by partition key and sort key
var result = await client.GetItemAsync("user#123", "profile");

if (result.IsSuccess)
{
    var item = result.Value;
    var name = item.GetAttribute<string>("name");
    var age = item.GetAttribute<int>("age", defaultValue: 0);
    Console.WriteLine($"User: {name}, Age: {age}");
}
```

### Delete Item
```csharp
var result = await client.DeleteItemAsync("user#123", "profile");

if (result.IsSuccess)
{
    Console.WriteLine("Item deleted!");
}
```

## Operações de consulta

### Consultar com filtro
```csharp
var filter = new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};

var options = new QueryOptions
{
    Limit = 50,
    ScanForward = false // Descending order
};

var result = await client.QueryAsync(filter, options);

if (result.IsSuccess)
{
    foreach (var item in result.Value.Items)
    {
        Console.WriteLine($"Order: {item.SortKey}");
    }

    // Handle pagination
    if (result.Value.HasMore)
    {
        var nextPage = await client.QueryAsync(filter, new QueryOptions
        {
            NextToken = result.Value.NextToken
        });
    }
}
```

### Condições de sort key
```csharp
// Exact match
SortKeyCondition.Equal("profile")

// Prefix match
SortKeyCondition.BeginsWith("order#")

// Range (inclusive)
SortKeyCondition.Between("2024-01-01", "2024-12-31")

// Comparison
SortKeyCondition.LessThan("2024-06-01")
SortKeyCondition.GreaterThan("2024-01-01")
SortKeyCondition.LessThanOrEquals("2024-06-01")
SortKeyCondition.GreaterThanOrEquals("2024-01-01")
```

### Scan
```csharp
var options = new PaginationOptions
{
    Limit = 100
};

var result = await client.ScanAsync(options);

if (result.IsSuccess)
{
    Console.WriteLine($"Found {result.Value.Items.Count} items");
}
```

## Operações em lote

### Batch Write
```csharp
var writeItems = new List<BatchWriteItem>
{
    new()
    {
        Operation = BatchOperation.Put,
        PartitionKey = "user#123",
        SortKey = "profile",
        Data = new Dictionary<string, object?> { ["name"] = "John" }
    },
    new()
    {
        Operation = BatchOperation.Delete,
        PartitionKey = "user#789",
        SortKey = "profile"
    }
};

var result = await client.BatchWriteAsync(writeItems);
Console.WriteLine($"Success: {result.Value.SuccessCount}");
```

### Batch Get
```csharp
var keys = new List<ItemKey>
{
    new("user#123", "profile"),
    new("user#456", "profile")
};

var result = await client.BatchGetAsync(keys);

foreach (var item in result.Value.Items)
{
    Console.WriteLine($"{item.PartitionKey}: {item.GetAttribute<string>("name")}");
}
```

## Transações

### Gravação transacional
```csharp
var writeItems = new List<TransactWriteItem>
{
    new()
    {
        Action = TransactAction.Put,
        PartitionKey = "account#A",
        SortKey = "balance",
        Data = new Dictionary<string, object?> { ["amount"] = 900 }
    },
    new()
    {
        Action = TransactAction.Put,
        PartitionKey = "account#B",
        SortKey = "balance",
        Data = new Dictionary<string, object?> { ["amount"] = 1100 }
    }
};

var result = await client.TransactWriteAsync(writeItems, "transfer-12345");

if (result.IsSuccess)
{
    Console.WriteLine("Transaction completed!");
}
else
{
    Console.WriteLine("Transaction failed - rolled back");
}
```

### Leitura transacional
```csharp
var getItems = new List<TransactGetItem>
{
    new() { PartitionKey = "user#123", SortKey = "profile" },
    new() { PartitionKey = "user#123", SortKey = "settings" }
};

var result = await client.TransactGetAsync(getItems);

foreach (var item in result.Value.Items)
{
    if (item.ItemExists)
    {
        Console.WriteLine($"{item.PartitionKey}: found");
    }
}
```

## Padrão repository

Para entidades tipadas, use o padrão repository:
```csharp
// Define your entity
public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public CustomerTier Tier { get; init; } = CustomerTier.Standard;
}

// Get repository
var customers = client.GetRepository<Customer>("repo_customers");

// Create
var customer = new Customer
{
    Id = Guid.NewGuid().ToString(),
    Name = "Acme Corp",
    Email = "contact@acme.com"
};
await customers.CreateAsync(customer);

// Read
var result = await customers.GetAsync(customer.Id);

// Update
var updated = customer with { Tier = CustomerTier.Premium };
await customers.UpdateAsync(updated);

// Delete
await customers.DeleteAsync(customer.Id);

// List
var list = await customers.ListAsync(new PaginationOptions { Limit = 50 });

// Check exists
var exists = await customers.ExistsAsync(customer.Id);
```

Consulte o [Guia do padrão Repository](/guides/repository/) para mais detalhes.

## Tratamento de erros

Todas as operações retornam objetos `Result<T>`:
```csharp
var result = await client.GetItemAsync("user#123");

if (result.IsSuccess)
{
    var item = result.Value;
    // Process item
}
else if (result.IsFailed)
{
    foreach (var error in result.Errors)
    {
        Console.WriteLine($"Error: {error.Message}");
    }
}
```

### Padrões comuns
```csharp
// Throw on failure
var item = result.ValueOrThrow();

// Provide default
var item = result.ValueOr(defaultItem);

// Match pattern
result.Match(
    onSuccess: item => Console.WriteLine($"Found: {item.PartitionKey}"),
    onFailure: errors => Console.WriteLine($"Failed: {errors.First().Message}")
);
```

## Erros comuns

- Usar uma partition key para gravações e outra diferente para leituras. As chaves de leitura precisam corresponder ao que foi gravado.
- Esquecer a sort key quando seu item usa uma. `GetItemAsync("user#123")` e `GetItemAsync("user#123", "profile")` são consultas diferentes.
- Presumir que `result.Value` é seguro antes de verificar `result.IsSuccess`.
- Armazenar tipos de atributos inconsistentes, como gravar `age` como string em um lugar e inteiro em outro.
- Ignorar o descarte em ferramentas ou testes de longa duração. Prefira `await using` quando puder.

## Encerramento

Sempre descarte o cliente ao terminar:
```csharp
await client.DisposeAsync();

// Or use 'using' statement
await using var client = new TerraScaleDatabase(options);
```

## Próximos passos

- [Padrão Repository](/guides/repository/) - Armazenamento de entidades tipadas
- [Cliente de gerenciamento C#](/guides/sdks/csharp-management/) - Gerenciamento de usuários e organizações
- [Referência da API](/reference/api/) - Documentação completa da API
