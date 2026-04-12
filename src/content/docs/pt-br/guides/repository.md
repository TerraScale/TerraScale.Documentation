---
title: Guia do padrão Repository
description: Armazene e consulte entidades tipadas com validação de schema usando o padrão repository.
sidebar:
  order: 3
---

O padrão repository oferece uma forma limpa de trabalhar com entidades tipadas no TerraScale, mantendo validação de schema, timestamps e versionamento integrados.

Se você já conhece o básico do SDK C#, este guia vai ajudar você a sair de itens brutos para um modelo mais estruturado e mais fácil de manter.

## Antes de começar

Certifique-se de que você tem:

- O SDK C# do TerraScale instalado
- Autenticação e configuração do cliente funcionando
- Um banco de dados selecionado ou configurado como padrão
- Conhecimento básico de C#, especialmente records, async/await e coleções

## Visão geral

Os repositórios oferecem:

- **Segurança de tipos**: Trabalhe com entidades fortemente tipadas
- **Validação de schema**: Garanta consistência dos dados
- **IDs gerados automaticamente**: Identificadores únicos para cada entidade
- **Timestamps automáticos**: Campos `createdAt` e `updatedAt`
- **Versionamento**: Concorrência otimista integrada

## Quando usar repositórios

| Use Case | Repository | Raw Items |
|----------|------------|-----------|
| Domain entities with defined structure | Yes | - |
| Schema validation required | Yes | - |
| Dynamic/flexible data | - | Yes |
| Single-table design patterns | - | Yes |
| Type-safe SDKs | Yes | - |

## Definindo entidades

### Etapa 1: Crie a classe da entidade

Estenda `EntityBase` para suas entidades:
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

### Etapa 2: Propriedades base da entidade

`EntityBase` fornece estas propriedades automaticamente:
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

### Etapa 3: Chaves personalizadas (opcional)

Sobrescreva os métodos de chave para particionamento personalizado:
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

## Operações de repositório

### Obtenha uma referência do repositório
```csharp
var customers = client.GetRepository<Customer>("repo_customers");
```

### Crie uma entidade
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

### Obtenha uma entidade
```csharp
var result = await customers.GetAsync(customerId);

if (result.IsSuccess)
{
    var customer = result.Value;
    Console.WriteLine($"Customer: {customer.Name}");
}
```

### Atualize uma entidade
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

### Exclua uma entidade
```csharp
var result = await customers.DeleteAsync(customerId);

if (result.IsSuccess)
{
    Console.WriteLine("Customer deleted");
}
```

### Liste entidades
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

### Consulte entidades
```csharp
var filter = new QueryFilter
{
    PartitionKey = $"customer#{customerId}",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};

var result = await customers.QueryAsync(filter);
```

### Verifique existência
```csharp
var result = await customers.ExistsAsync(customerId);

if (result.IsSuccess && result.Value)
{
    Console.WriteLine("Customer exists");
}
```

## Exemplo completo
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

Este exemplo mostra o fluxo completo de que você normalmente precisa, criar, ler, atualizar e listar, verificando cada resultado antes de seguir adiante.

## Validação de schema

Ao criar um repositório pela Management API, defina um schema:
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

Entidades que não corresponderem ao schema serão rejeitadas.

## Boas práticas

### Use records imutáveis

Records C# com propriedades `init` garantem imutabilidade:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }  // Immutable after creation
}

// Update by creating new instance
var updated = customer with { Name = "New Name" };
```

### Lide com concorrência otimista

Use a propriedade `Version` para detectar conflitos:
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

### Projete para padrões de acesso

Sobrescreva métodos de chave para otimizar consultas:
```csharp
// If you often query by customer
public override string GetPartitionKey() => $"customer#{CustomerId}";
```

## Erros comuns

- Chamar `result.Value` antes de verificar `result.IsSuccess`
- Esquecer de definir `Id` quando sua entidade exige um
- Tratar repositórios como armazenamento bruto de itens quando seu padrão de acesso exige chaves personalizadas
- Atualizar entidades desatualizadas sem considerar o campo `Version`
- Ignorar o alinhamento do schema entre sua entidade C# e o schema do repositório

## Próximos passos

- [API de operações de repositório](/reference/api/repositories/) - Referência da API
- [Gerenciamento de repositórios](/reference/management/repositories/) - Criar repositórios
- [SDK C#](/guides/sdks/csharp/) - Documentação completa do SDK
