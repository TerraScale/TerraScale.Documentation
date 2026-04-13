---
title: Modelos de dados
description: Estruturas e tipos de dados usados no SDK da TerraScale.
sidebar:
  order: 10
---

Estruturas e tipos de dados usados no SDK C# da TerraScale.

Os snippets desta página são formatos de referência ilustrativos, baseados nos conceitos atuais do SDK e em padrões comuns de uso. Eles servem para ajudar você a entender rapidamente a superfície do modelo, não para substituir o IntelliSense ou o código-fonte exato do pacote instalado na sua versão.

Salvo indicação em contrário, estes exemplos assumem o SDK C# atual documentado neste site. Se você estiver em uma prerelease mais antiga ou em uma versão anterior do pacote, nomes de propriedades, valores padrão e métodos auxiliares podem variar um pouco.

---

## DatabaseItem

Representa um item bruto do banco com atributos dinâmicos.
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

### Campos obrigatórios e opcionais

- Obrigatórios: `PartitionKey`, `Attributes`
- Opcionais: `SortKey`, `CreatedAt`, `UpdatedAt`

Use `DatabaseItem` quando você quiser máxima flexibilidade e não precisar de uma classe de entidade fortemente tipada.

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

Condições de filtro para operações de consulta.
```csharp
public sealed record QueryFilter
{
    public required string PartitionKey { get; init; }
    public SortKeyCondition? SortKeyCondition { get; init; }
    public string? FilterExpression { get; init; }
    public IReadOnlyDictionary<string, object>? ExpressionAttributeValues { get; init; }
}
```

### Campos obrigatórios e opcionais

- Obrigatório: `PartitionKey`
- Opcionais: `SortKeyCondition`, `FilterExpression`, `ExpressionAttributeValues`

`PartitionKey` é a única entrada obrigatória porque toda query na TerraScale começa por uma partição.

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

Operadores de comparação de sort key.
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

### Campos obrigatórios e opcionais

- Obrigatórios: `Operator`, `Value`
- Opcional: `Value2`, usado para `Between`

Métodos auxiliares como `BeginsWith` e `Between` são a forma mais fácil de construir essas condições corretamente.

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

Opções para requisições paginadas.
```csharp
public record PaginationOptions
{
    public int Limit { get; init; } = 50;
    public string? NextToken { get; init; }
    public bool IncludeTotalCount { get; init; } = false;
}
```

### Campos obrigatórios e opcionais

- Obrigatórios: nenhum
- Opcionais: `Limit`, `NextToken`, `IncludeTotalCount`

Se você não definir `Limit`, o SDK usa o tamanho padrão de página. Mantenha páginas moderadas quando quiser menor latência e retries mais baratos.

---

## QueryOptions

Opções estendidas para operações de consulta.
```csharp
public sealed record QueryOptions : PaginationOptions
{
    public string? IndexName { get; init; }
    public bool ScanForward { get; init; } = true;
    public IReadOnlyList<string>? ProjectionAttributes { get; init; }
}
```

### Campos obrigatórios e opcionais

- Obrigatórios: nenhum
- Opcionais: `IndexName`, `ScanForward`, `ProjectionAttributes`, além dos campos herdados de paginação

`QueryOptions` estende `PaginationOptions`, então você pode combinar direção de ordenação, projeção e paginação em uma única requisição.

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

Wrapper de resposta paginada.
```csharp
public sealed record PaginatedResult<T>
{
    public required IReadOnlyList<T> Items { get; init; }
    public string? NextToken { get; init; }
    public bool HasMore => NextToken is not null;
    public long? TotalCount { get; init; }
}
```

### Campos obrigatórios e opcionais

- Obrigatórios: `Items`
- Opcionais: `NextToken`, `TotalCount`

`HasMore` é uma propriedade derivada de conveniência, então você pode verificar se há outra página sem inspecionar `NextToken` diretamente.

### Exemplo de paginação
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

Interface base e classe base para entidades tipadas.
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

### Campos obrigatórios e opcionais

- `IEntity` exige uma implementação de `GetPartitionKey()`
- `EntityBase` exige `Id`
- `UpdatedAt` é opcional, `CreatedAt` e `Version` têm valores padrão

Use `EntityBase` quando quiser um modelo de domínio tipado com padrões sensatos para timestamps e controle otimista de versão.

### Exemplo de entidade personalizada
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

Item para operações de escrita em lote.
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

### Campos obrigatórios e opcionais

- Obrigatórios: `Operation`, `PartitionKey`
- Opcionais: `SortKey`, `Data`

Forneça `Data` para operações `Put`. Para `Delete`, normalmente as chaves bastam.

---

## TransactWriteItem

Item para operações de escrita transacional.
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

### Campos obrigatórios e opcionais

- Obrigatórios: `Action`, `PartitionKey`
- Opcionais: `SortKey`, `Data`, `ConditionExpression`

Transações devem ficar reservadas para mudanças que precisam ter sucesso ou falhar juntas.

---

## ItemKey

Referência simples de chave para operações batch get.
```csharp
public record ItemKey(string PartitionKey, string? SortKey = null);
```

### Campos obrigatórios e opcionais

- Obrigatório: `PartitionKey`
- Opcional: `SortKey`

Esse tipo leve é útil quando você precisa buscar em lote registros conhecidos sem enviar payloads completos de item.

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

## Próximos passos

- [C# SDK](/guides/sdks/csharp/) - Documentação completa do SDK
- [Repository Pattern](/guides/repository/) - Armazenamento de entidades tipadas
- [Best Practices](/reference/best-practices/) - Aplique esses modelos em cargas de produção

