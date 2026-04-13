---
title: Boas práticas
description: Boas práticas para criar aplicações com TerraScale.
sidebar:
  order: 11
---

Boas práticas para criar aplicações performáticas e confiáveis com TerraScale. Use esta página como uma checklist prática enquanto define chaves, estrutura consultas e ajusta custos entre regiões.

---

## Design de chaves

### Use chaves de partição significativas

Projete chaves de partição que distribuam os dados de forma equilibrada e deem suporte aos seus padrões de acesso:
```csharp
// Good: Distributes data by user
{ "pk": "user#123", "sk": "profile" }
{ "pk": "user#123", "sk": "order#001" }

// Avoid: All data in one partition
{ "pk": "all_users", "sk": "user#123" }
```

Por que isso importa na TerraScale: as chaves de partição afetam diretamente a distribuição de gravações, a eficiência de leitura e o quanto sua carga escala entre regiões. Uma estratégia forte de chaves é uma das formas mais simples de evitar latência e custo desnecessários. Veja [Data Models](/reference/data-models/) para os principais tipos de requisição por trás desses padrões.

### Aproveite as sort keys para itens relacionados

Agrupe itens relacionados sob a mesma chave de partição:
```csharp
// User and their orders in same partition
{ "pk": "user#123", "sk": "profile" }
{ "pk": "user#123", "sk": "order#2024-001" }
{ "pk": "user#123", "sk": "order#2024-002" }

// Query all orders efficiently
var filter = new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
};
```

Por que isso importa na TerraScale: manter itens relacionados próximos deixa as consultas mais direcionadas. Normalmente isso significa menos leituras, menor custo por operação e paginação mais simples. Para mais padrões de consulta, veja [Querying Guide](/guides/querying/).

### Evite partições quentes

Distribua gravações entre chaves de partição:
```csharp
// Bad: All writes to one partition
{ "pk": "orders", "sk": "order#12345" }

// Good: Partition by date or user
{ "pk": "orders#2024-01-15", "sk": "order#12345" }
{ "pk": "user#456#orders", "sk": "order#12345" }
```

Por que isso importa na TerraScale: partições quentes podem aparecer rapidamente em cargas globais, quando o tráfego de várias regiões converge para a mesma chave. Se uma entidade lógica recebe um volume muito alto de gravações, considere bucket por tempo, bucket por tenant ou outro componente de shard na chave.

---

## Otimização de consultas

### Use Query em vez de Scan

Consultas são eficientes, scans leem tudo:
```csharp
// Good: Query by partition key
var result = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123"
});

// Avoid: Scan the entire database
var result = await client.ScanAsync(new PaginationOptions());
```

Por que isso importa na TerraScale: scans leem muito mais dados do que queries, então aumentam a latência e podem consumir o orçamento de requisições mais rápido. Se você espera que um caminho de produção rode com frequência, projete primeiro para `QueryAsync`. Os limites relacionados estão em [Rate Limits](/reference/rate-limits/).

### Limite o tamanho dos resultados

Sempre defina limites razoáveis:
```csharp
var result = await client.QueryAsync(filter, new QueryOptions
{
    Limit = 50  // Don't fetch more than needed
});
```

Por que isso importa na TerraScale: respostas de query e scan têm limite de 1 MB por resposta. Tamanhos menores de página também tornam novas tentativas mais baratas e ajudam a suavizar a latência entre regiões.

### Use expressões de projeção

Retorne apenas os atributos necessários:
```csharp
var options = new QueryOptions
{
    ProjectionAttributes = new[] { "name", "email" }  // Skip large attributes
};
```

Por que isso importa na TerraScale: retornar apenas os atributos de que você precisa reduz o tamanho do payload e mantém os custos de leitura mais previsíveis, especialmente quando os documentos contêm objetos aninhados grandes.

### Modele para os padrões de acesso

Estruture as chaves para dar suporte às suas consultas:
```csharp
// Access pattern: Get user's orders by date
{ "pk": "user#123", "sk": "order#2024-01-15#001" }

// Now you can query by date range
SortKeyCondition.Between("order#2024-01-01", "order#2024-01-31")
```

Por que isso importa na TerraScale: os padrões de acesso devem orientar as decisões de esquema. Se você já sabe que precisa de intervalos de data, visões por tenant ou agrupamentos por status, coloque isso nas chaves cedo para não acabar dependendo de filtros caros mais tarde.

---

## Tratamento de erros

### Sempre verifique os resultados

Nunca suponha que as operações foram bem-sucedidas:
```csharp
var result = await client.GetItemAsync("user#123");

if (result.IsFailed)
{
    logger.LogError("Get failed: {Error}", result.Errors.First().Message);
    return null;
}

return result.Value;
```

Por que isso importa na TerraScale: muitos problemas operacionais aparecem primeiro como falhas parciais, problemas de validação ou throttling. Verificações explícitas tornam essas falhas visíveis enquanto ainda são fáceis de recuperar. Veja [API Reference](/reference/api/) para o comportamento por endpoint.

### Implemente lógica de retry

Trate falhas transitórias com cuidado:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(500),
        UseJitter = true
    }
});
```

Por que isso importa na TerraScale: pequenas falhas de rede, transições curtas de réplica e rate limiting são muito mais fáceis de absorver quando retries fazem parte do projeto desde o começo. Sempre que possível, combine retries com padrões de escrita idempotentes.

### Registre erros com contexto

Inclua detalhes da operação para depuração:
```csharp
if (result.IsFailed)
{
    logger.LogError(
        "Failed to get item PK={Pk} SK={Sk}: {Error}",
        pk, sk, result.Errors.First().Message
    );
}
```

Por que isso importa na TerraScale: chaves de requisição, contexto de região e tipo de operação tornam incidentes muito mais rápidos de depurar. Bons logs também ajudam a perceber se as falhas se concentram em um padrão de acesso ou em uma partição quente.

---

## Transações

### Use transações só quando necessário

Transações têm latência maior do que operações em lote:
```csharp
// Use batch for independent writes
await client.BatchWriteAsync(items);

// Use transactions only for atomic operations
await client.TransactWriteAsync(items);
```

Por que isso importa na TerraScale: transações dão atomicidade, mas normalmente custam mais do que operações em lote independentes e adicionam sobrecarga de coordenação. Use-as para limites de correção, não como caminho padrão de escrita.

### Mantenha transações pequenas

Menos itens significa execução mais rápida:
```csharp
// Good: Small, focused transaction
var items = new List<TransactWriteItem>
{
    new() { Action = TransactAction.Put, ... },
    new() { Action = TransactAction.Update, ... }
};

// Avoid: Large transactions with many items
```

Por que isso importa na TerraScale: transações menores terminam mais rápido, falham de forma mais clara e são mais fáceis de repetir com segurança. Elas também ajudam a permanecer dentro dos limites de tamanho de requisição.

### Use tokens de idempotência

Evite operações duplicadas em caso de retry:
```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: "order-12345-payment"
);
```

Por que isso importa na TerraScale: se um cliente repetir após um timeout, tokens de idempotência ajudam a evitar gravações duplicadas ou eventos de negócio duplicados.

---

## Performance

### Use operações em lote

Reduza viagens de rede:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

Por que isso importa na TerraScale: operações em lote reduzem round trips e ajudam você a permanecer eficiente sob limites de requisições por segundo. Lembre dos limites por requisição documentados, como 25 itens para batch write e 100 chaves para batch get. Veja [Rate Limits](/reference/rate-limits/).

### Processamento em paralelo

Processe operações independentes de forma concorrente:
```csharp
var tasks = partitions.Select(pk =>
    client.QueryAsync(new QueryFilter { PartitionKey = pk })
);

var results = await Task.WhenAll(tasks);
```

Por que isso importa na TerraScale: leituras em paralelo podem melhorar o throughput para partições independentes, mas concorrência demais pode levar a throttling. Aumente a concorrência aos poucos e observe a latência de cauda.

### Pooling de conexões

Reutilize instâncias do cliente:
```csharp
// Good: Create once, reuse
public class MyService
{
    private readonly TerraScaleDatabase _client;

    public MyService(TerraScaleDatabase client)
    {
        _client = client;
    }
}

// Avoid: Creating new clients per request
```

Por que isso importa na TerraScale: reutilizar clientes evita a configuração repetida de conexão e mantém sua aplicação mais estável sob carga.

---

## Segurança

### Use escopos específicos

Conceda o mínimo de permissões necessário:
```csharp
// Good: Specific permissions
{ "scopes": ["database:read", "repository:read"] }

// Avoid: Overly broad permissions
{ "scopes": ["*"] }
```

Por que isso importa na TerraScale: escopos restritos reduzem o impacto caso uma chave vaze e tornam revisões de permissões muito mais simples.

### Faça rotação de API keys

Defina expiração e faça rotação com regularidade:
```csharp
await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Production Key",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddMonths(3)
));
```

Por que isso importa na TerraScale: credenciais com vida mais curta são mais fáceis de conter durante incidentes e mais seguras para automações que atravessam várias equipes ou regiões.

### Ative MFA

Proteja contas com autenticação em dois fatores.

Por que isso importa na TerraScale: o acesso administrativo geralmente inclui billing, gerenciamento de chaves e configuração de produção. MFA adiciona uma camada importante de proteção.

### Armazene segredos com segurança

Nunca faça commit de API keys no controle de versão:
```csharp
// Good: Environment variable
var apiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY");

// Good: Secret manager
var apiKey = await secretManager.GetSecretAsync("terrascale-api-key");

// Bad: Hardcoded
var apiKey = "ts_live_abc123...";
```

Por que isso importa na TerraScale: API keys geralmente carregam amplo acesso a dados. Guarde-as em um gerenciador de segredos ou variável de ambiente, nunca no controle de versão.

---

## Modelagem de dados

### Use repositórios para entidades de domínio

Entidades tipadas com validação de esquema:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

var customers = client.GetRepository<Customer>("customers");
```

Por que isso importa na TerraScale: repositórios são uma boa escolha quando você quer entidades tipadas, validação compartilhada e código de aplicação mais limpo. Veja [Repository Pattern](/guides/repository/) para um guia mais completo.

### Use raw items para dados flexíveis

Atributos dinâmicos sem esquema:
```csharp
var item = new DatabaseItem
{
    PartitionKey = "config#app",
    Attributes = configData
};
```

Por que isso importa na TerraScale: raw items funcionam bem para configurações, metadados dinâmicos ou fases de migração em que a estrutura ainda está mudando.

### Desnormalize para performance de leitura

Armazene os dados no formato em que você os lê:
```csharp
// Instead of joining user and address
{ "pk": "user#123", "sk": "profile", "data": {
    "name": "John",
    "address": {  // Embedded, not referenced
        "street": "123 Main St",
        "city": "NYC"
    }
}}
```

Por que isso importa na TerraScale: joins não são o caminho ideal em cargas documentais e chave-valor. Armazenar os dados no formato em que você mais os lê geralmente traz latência mais previsível.

---

## Monitoramento

### Acompanhe o uso

Monitore seu uso em relação aos limites do plano:
```csharp
var usage = await client.Payment.GetUsageAsync();

if (usage.Value.TotalRequests > warningThreshold)
{
    logger.LogWarning("Approaching request limit");
}
```

Por que isso importa na TerraScale: acompanhar o uso ajuda a perceber crescimento de requisições, expansão de storage e mudanças de custo por região antes que virem surpresa. Se você está planejando um upgrade, veja [How to Choose a Plan](/guides/how-to-choose-a-plan/).

### Use endpoints de health

Monitore a disponibilidade da API:
```bash
curl https://api.terrascale.io/health
```

Por que isso importa na TerraScale: endpoints de health oferecem um sinal claro para verificações de prontidão e uptime durante deploys e resposta a incidentes. Veja [Health Endpoints](/reference/api/health/).

---

## Próximos passos

- [Data Models](/reference/data-models/) - Revise os principais tipos de requisição e entidades
- [Rate Limits](/reference/rate-limits/) - Fique dentro dos limites
- [Querying Guide](/guides/querying/) - Projete padrões de acesso mais eficientes
- [API Reference](/reference/api/) - Revise os detalhes dos endpoints

