---
title: Cliente de base de datos C#
description: Guía completa para usar el SDK TerraScale Database Client para C# y .NET.
sidebar:
  order: 1
  badge:
    text: Nuevo
    variant: tip
---

El TerraScale Database Client te ofrece una forma tipada y práctica de leer y escribir datos desde aplicaciones C# y .NET.

Esta guía comienza con un camino rápido hacia tu primera solicitud exitosa y luego recorre las operaciones principales que usarás en producción.

## Inicio rápido

Si quieres pasar de la instalación a tu primera lectura rápidamente, empieza aquí.

### 1. Instala el paquete
```bash
dotnet add package TerraScale.Database.Client
```

### 2. Configura el cliente
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

### 3. Crea tu primer elemento
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

### 4. Lee el elemento de vuelta
```csharp
var readResult = await client.GetItemAsync("user#123", "profile");

if (readResult.IsSuccess)
{
    var item = readResult.Value;
    Console.WriteLine($"Loaded {item.GetAttribute<string>("name")}");
}
```

### 5. Libera el cliente
```csharp
await client.DisposeAsync();
```

## Instalación
```bash
dotnet add package TerraScale.Database.Client
```

## Configuración

### Configuración básica
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

### Opciones de configuración

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

## Operaciones con elementos

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

## Operaciones de consulta

### Consultar con filtro
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

### Condiciones de sort key
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

## Operaciones por lotes

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

## Transacciones

### Escritura transaccional
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

### Lectura transaccional
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

## Patrón repository

Para entidades tipadas, usa el patrón repository:
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

Consulta la [Guía del patrón Repository](/guides/repository/) para obtener más detalles.

## Manejo de errores

Todas las operaciones devuelven objetos `Result<T>`:
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

### Patrones comunes
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

## Errores comunes

- Usar una partition key para escrituras y una distinta para lecturas. Tus claves de lectura deben coincidir con lo que escribiste.
- Olvidar la sort key cuando tu elemento usa una. `GetItemAsync("user#123")` y `GetItemAsync("user#123", "profile")` son búsquedas diferentes.
- Asumir que `result.Value` es seguro antes de comprobar `result.IsSuccess`.
- Almacenar tipos de atributos inconsistentes, como escribir `age` como string en un lugar y como entero en otro.
- Omitir la liberación en herramientas o pruebas de larga duración. Prefiere `await using` cuando puedas.

## Limpieza

Libera siempre el cliente cuando termines:
```csharp
await client.DisposeAsync();

// Or use 'using' statement
await using var client = new TerraScaleDatabase(options);
```

## Próximos pasos

- [Patrón Repository](/guides/repository/) - Almacenamiento de entidades tipadas
- [Cliente de gestión C#](/guides/sdks/csharp-management/) - Gestión de usuarios y organizaciones
- [Referencia de la API](/reference/api/) - Documentación completa de la API
