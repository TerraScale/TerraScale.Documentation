---
title: Guía del patrón Repository
description: Almacena y consulta entidades tipadas con validación de schema usando el patrón repository.
sidebar:
  order: 3
---

El patrón repository te ofrece una forma limpia de trabajar con entidades tipadas en TerraScale, manteniendo la validación de schema, los timestamps y el versionado integrados.

Si ya conoces los conceptos básicos del SDK C#, esta guía te ayudará a pasar de elementos sin procesar a un modelo más estructurado y más fácil de mantener.

## Antes de empezar

Asegúrate de tener:

- El SDK C# de TerraScale instalado
- Autenticación y configuración del cliente funcionando
- Una base de datos seleccionada o configurada como predeterminada
- Conocimientos básicos de C#, especialmente records, async/await y colecciones

## Descripción general

Los repositorios ofrecen:

- **Seguridad de tipos**: Trabaja con entidades fuertemente tipadas
- **Validación de schema**: Garantiza consistencia de los datos
- **IDs autogenerados**: Identificadores únicos para cada entidad
- **Timestamps automáticos**: Campos `createdAt` y `updatedAt`
- **Versionado**: Concurrencia optimista integrada

## Cuándo usar repositorios

| Use Case | Repository | Raw Items |
|----------|------------|-----------|
| Domain entities with defined structure | Yes | - |
| Schema validation required | Yes | - |
| Dynamic/flexible data | - | Yes |
| Single-table design patterns | - | Yes |
| Type-safe SDKs | Yes | - |

## Definición de entidades

### Paso 1: Crea la clase de entidad

Extiende `EntityBase` para tus entidades:
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

### Paso 2: Propiedades base de la entidad

`EntityBase` proporciona estas propiedades automáticamente:
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

### Paso 3: Claves personalizadas (opcional)

Sobrescribe métodos de clave para un particionado personalizado:
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

## Operaciones de repositorio

### Obtén una referencia del repositorio
```csharp
var customers = client.GetRepository<Customer>("repo_customers");
```

### Crea una entidad
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

### Obtén una entidad
```csharp
var result = await customers.GetAsync(customerId);

if (result.IsSuccess)
{
    var customer = result.Value;
    Console.WriteLine($"Customer: {customer.Name}");
}
```

### Actualiza una entidad
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

### Elimina una entidad
```csharp
var result = await customers.DeleteAsync(customerId);

if (result.IsSuccess)
{
    Console.WriteLine("Customer deleted");
}
```

### Lista entidades
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

### Consulta entidades
```csharp
var filter = new QueryFilter
{
    PartitionKey = $"customer#{customerId}",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};

var result = await customers.QueryAsync(filter);
```

### Verifica existencia
```csharp
var result = await customers.ExistsAsync(customerId);

if (result.IsSuccess && result.Value)
{
    Console.WriteLine("Customer exists");
}
```

## Ejemplo completo
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

Este ejemplo muestra el flujo completo que normalmente necesitarás, crear, leer, actualizar y listar, verificando cada resultado antes de continuar.

## Validación de schema

Al crear un repositorio mediante Management API, define un schema:
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

Las entidades que no coincidan con el schema serán rechazadas.

## Buenas prácticas

### Usa records inmutables

Los records de C# con propiedades `init` garantizan inmutabilidad:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }  // Immutable after creation
}

// Update by creating new instance
var updated = customer with { Name = "New Name" };
```

### Maneja la concurrencia optimista

Usa la propiedad `Version` para detectar conflictos:
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

### Diseña para patrones de acceso

Sobrescribe métodos de clave para optimizar las consultas:
```csharp
// If you often query by customer
public override string GetPartitionKey() => $"customer#{CustomerId}";
```

## Errores comunes

- Llamar a `result.Value` antes de comprobar `result.IsSuccess`
- Olvidar establecer `Id` cuando tu entidad lo requiere
- Tratar los repositorios como almacenamiento de elementos sin procesar cuando tu patrón de acceso necesita claves personalizadas
- Actualizar entidades obsoletas sin tener en cuenta el campo `Version`
- Omitir la alineación del schema entre tu entidad C# y el schema del repositorio

## Próximos pasos

- [API de operaciones de repositorio](/reference/api/repositories/) - Referencia de la API
- [Gestión de repositorios](/reference/management/repositories/) - Crear repositorios
- [SDK C#](/guides/sdks/csharp/) - Documentación completa del SDK
