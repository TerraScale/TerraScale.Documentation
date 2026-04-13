---
title: Modelos de datos
description: Estructuras y tipos de datos usados en el SDK de TerraScale.
sidebar:
  order: 10
---

Estructuras y tipos de datos usados en el SDK de C# de TerraScale.

Los fragmentos de esta página son formas de referencia ilustrativas basadas en los conceptos actuales del SDK y en patrones comunes de uso. Están pensados para ayudarte a entender rápidamente la superficie del modelo, no para sustituir IntelliSense ni el código fuente exacto del paquete instalado en tu versión.

Salvo que se indique lo contrario, estos ejemplos asumen el SDK actual de C# documentado en este sitio. Si estás usando una prerelease antigua o una versión anterior del paquete, los nombres de propiedades, los valores predeterminados y los métodos auxiliares pueden variar un poco.

---

## DatabaseItem

Representa un elemento bruto de base de datos con atributos dinámicos.
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

### Campos obligatorios y opcionales

- Obligatorios: `PartitionKey`, `Attributes`
- Opcionales: `SortKey`, `CreatedAt`, `UpdatedAt`

Usa `DatabaseItem` cuando quieras máxima flexibilidad y no necesites una clase de entidad fuertemente tipada.

### Uso
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

Condiciones de filtro para operaciones de consulta.
```csharp
public sealed record QueryFilter
{
    public required string PartitionKey { get; init; }
    public SortKeyCondition? SortKeyCondition { get; init; }
    public string? FilterExpression { get; init; }
    public IReadOnlyDictionary<string, object>? ExpressionAttributeValues { get; init; }
}
```

### Campos obligatorios y opcionales

- Obligatorio: `PartitionKey`
- Opcionales: `SortKeyCondition`, `FilterExpression`, `ExpressionAttributeValues`

`PartitionKey` es la única entrada obligatoria porque cada query en TerraScale comienza en una partición.

### Uso
```csharp
var filter = new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};
```

---

## SortKeyCondition

Operadores de comparación de sort key.
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

### Campos obligatorios y opcionales

- Obligatorios: `Operator`, `Value`
- Opcional: `Value2`, usado para `Between`

Los métodos auxiliares como `BeginsWith` y `Between` son la forma más sencilla de construir estas condiciones correctamente.

### Métodos de fábrica
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

Opciones para solicitudes paginadas.
```csharp
public record PaginationOptions
{
    public int Limit { get; init; } = 50;
    public string? NextToken { get; init; }
    public bool IncludeTotalCount { get; init; } = false;
}
```

### Campos obligatorios y opcionales

- Obligatorios: ninguno
- Opcionales: `Limit`, `NextToken`, `IncludeTotalCount`

Si no estableces `Limit`, el SDK usa su tamaño de página por defecto. Mantén tamaños de página moderados si quieres menor latencia y reintentos más baratos.

---

## QueryOptions

Opciones extendidas para operaciones de consulta.
```csharp
public sealed record QueryOptions : PaginationOptions
{
    public string? IndexName { get; init; }
    public bool ScanForward { get; init; } = true;
    public IReadOnlyList<string>? ProjectionAttributes { get; init; }
}
```

### Campos obligatorios y opcionales

- Obligatorios: ninguno
- Opcionales: `IndexName`, `ScanForward`, `ProjectionAttributes`, además de los campos de paginación heredados

`QueryOptions` amplía `PaginationOptions`, así que puedes combinar dirección de ordenación, proyección y paginación en una sola solicitud.

### Uso
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

Wrapper de respuesta paginada.
```csharp
public sealed record PaginatedResult<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public string? NextToken { get; init; }
    public bool HasMore => NextToken is not null;
    public long? TotalCount { get; init; }
}
```

### Campos obligatorios y opcionales

- Obligatorios: `Items`
- Opcionales: `NextToken`, `TotalCount`

`HasMore` es una propiedad derivada de conveniencia, así que puedes comprobar si hay otra página sin inspeccionar `NextToken` directamente.

### Ejemplo de paginación
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

Interfaz base y clase base para entidades tipadas.
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

### Campos obligatorios y opcionales

- `IEntity` requiere una implementación de `GetPartitionKey()`
- `EntityBase` requiere `Id`
- `UpdatedAt` es opcional, `CreatedAt` y `Version` tienen valores predeterminados

Usa `EntityBase` cuando quieras un modelo de dominio tipado con valores sensatos para timestamps y control optimista de versión.

### Ejemplo de entidad personalizada
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

Elemento para operaciones de escritura por lotes.
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

### Campos obligatorios y opcionales

- Obligatorios: `Operation`, `PartitionKey`
- Opcionales: `SortKey`, `Data`

Proporciona `Data` para operaciones `Put`. Para `Delete`, normalmente bastan las claves.

---

## TransactWriteItem

Elemento para operaciones de escritura transaccional.
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

### Campos obligatorios y opcionales

- Obligatorios: `Action`, `PartitionKey`
- Opcionales: `SortKey`, `Data`, `ConditionExpression`

Las transacciones se reservan mejor para cambios que deben tener éxito o fallar en conjunto.

---

## ItemKey

Referencia simple de clave para operaciones batch get.
```csharp
public record ItemKey(string PartitionKey, string? SortKey = null);
```

### Campos obligatorios y opcionales

- Obligatorio: `PartitionKey`
- Opcional: `SortKey`

Este tipo ligero es útil cuando necesitas recuperar en lote registros conocidos sin enviar payloads completos de elementos.

### Uso
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

## Próximos pasos

- [C# SDK](/guides/sdks/csharp/) - Documentación completa del SDK
- [Repository Pattern](/guides/repository/) - Almacenamiento de entidades tipadas
- [Best Practices](/reference/best-practices/) - Aplica estos modelos en cargas de producción

