---
title: "Transações no TerraScale: quando e como usá-las"
date: 2024-08-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - transactions
  - deep-dive
  - tutorial
excerpt: Transações permitem atualizar múltiplos itens atomicamente. Veja quando você precisa delas, quando não precisa e como usá-las bem no TerraScale.
cover:
  wide: /images/blog/transactions-deep-dive/cover-wide.svg
  square: /images/blog/transactions-deep-dive/cover-square.svg
  alt: Duas formas atômicas brilhantes presas em uma estrutura equilibrada, expressando transações precisas do tipo tudo ou nada.
---

Transações são um dos recursos mais poderosos do TerraScale e um dos mais mal compreendidos. Deixe-me esclarecer quando você precisa delas, quando não precisa e como usá-las de forma eficaz.

## O que você vai aprender

- Quando uma transação é a ferramenta certa
- Quando um batch write ou uma única atualização condicional é suficiente
- Como lidar com falhas de transação sem surpreender seus usuários

Se você quiser a superfície da API ao lado deste passo a passo, deixe à mão a [referência de transações](/reference/api/transactions/) e o [guia de tratamento de erros](/reference/error-handling/).

## O que são transações?

Uma transação permite executar múltiplas operações que ou todas têm sucesso ou todas falham. Não existe meio-termo.

Esse comportamento tudo ou nada é o que torna transações tão úteis e também o motivo de custarem mais do que operações mais simples.
```csharp
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "account#sender",
        SortKey = "balance",
        UpdateExpression = "SET balance = balance - 100"
    },
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "account#receiver",
        SortKey = "balance",
        UpdateExpression = "SET balance = balance + 100"
    }
});
```

Se qualquer atualização falhar, nenhuma acontece. O dinheiro não desaparece no vazio.

## Quando você precisa de transações

### Operações financeiras

Mover dinheiro entre contas é o exemplo clássico. Você precisa que tanto o débito quanto o crédito aconteçam, ou nenhum deles.

### Gestão de inventário

Reduzir estoque e criar um pedido deve ser atômico:
```csharp
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "product#123",
        SortKey = "inventory",
        UpdateExpression = "SET quantity = quantity - 1",
        ConditionExpression = "quantity > 0"
    },
    new TransactWriteItem
    {
        Action = TransactAction.Put,
        PartitionKey = "order#456",
        SortKey = "details",
        Data = orderData
    }
});
```

### Consistência entre entidades

Quando duas entidades precisam permanecer sincronizadas:
```csharp
// User joins a team - update both user and team
await client.TransactWriteAsync(new[]
{
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "user#123",
        SortKey = "profile",
        UpdateExpression = "SET teamId = :teamId",
        ExpressionAttributeValues = new { teamId = "team#456" }
    },
    new TransactWriteItem
    {
        Action = TransactAction.Update,
        PartitionKey = "team#456",
        SortKey = "metadata",
        UpdateExpression = "SET memberCount = memberCount + 1"
    }
});
```

## Quando você NÃO precisa de transações

### Operações independentes

Se as operações não dependem umas das outras, use batch writes. Normalmente você terá menor latência e menor custo.
```csharp
// These are independent - use BatchWrite, not Transaction
await client.BatchWriteAsync(new[]
{
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... }
});
```

BatchWrite é mais rápido e mais barato do que TransactWrite. A [referência de operações em batch](/reference/api/batch-operations/) aprofunda esses trade-offs.

### Atualizações de item único

Para um único item, um PutItem ou UpdateItem normal com condition expression geralmente é suficiente:
```csharp
await client.UpdateItemAsync("account#123", "balance",
    "SET balance = balance - 100",
    conditionExpression: "balance >= 100"
);
```

### Operações somente leitura

Para ler múltiplos itens, use BatchGet ou queries em paralelo:
```csharp
var items = await client.BatchGetAsync(keys);
```

TransactGet existe para casos em que você precisa de um snapshot consistente entre itens, mas isso raramente é necessário.

Por que isso importa: transações não são um selo de maturidade arquitetural. Elas são uma ferramenta para proteger invariantes. Se não existe um invariante a proteger, mantenha as coisas mais simples.

## Limites de transação

Conheça os limites:

| Limit | Value |
|-------|-------|
| Items per transaction | 25 |
| Total size | 4MB |
| Items per partition | No limit |
| Cross-region | Not supported |

Se você precisa de mais de 25 itens, terá que reestruturar sua operação ou aceitar eventual consistency em algumas partes.

## Condition expressions

O verdadeiro poder das transações vem das condition expressions:
```csharp
new TransactWriteItem
{
    Action = TransactAction.Update,
    PartitionKey = "product#123",
    SortKey = "inventory",
    UpdateExpression = "SET quantity = quantity - :amount",
    ConditionExpression = "quantity >= :amount",
    ExpressionAttributeValues = new { amount = 5 }
}
```

Se a condição falhar, a transação inteira é cancelada. Isso evita race conditions.

## Lidando com falhas de transação

Transações podem falhar por vários motivos. Planeje isso desde o começo para que sua aplicação responda de forma limpa.
```csharp
var result = await client.TransactWriteAsync(items);

if (result.IsFailed)
{
    var error = result.Errors.First();

    if (error.Message.Contains("ConditionalCheckFailed"))
    {
        // A condition wasn't met - maybe retry with fresh data
    }
    else if (error.Message.Contains("TransactionCanceled"))
    {
        // Conflict with another transaction - retry
    }
    else
    {
        // Something else went wrong
    }
}
```

## Tokens de idempotência

Para transações críticas, use tokens de idempotência para evitar execução duplicada:
```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: $"order-{orderId}-payment"
);
```

Se o mesmo token for usado dentro de 10 minutos, o TerraScale retorna o resultado anterior sem executar novamente.

## Considerações de performance

Transações são mais caras do que operações normais:

- ~2x a latência de uma única escrita
- ~2x o custo em write units
- Contenção de lock em itens quentes

Use-as quando precisar de atomicidade, não como padrão. Para a maioria dos sistemas, isso significa manter transações focadas, pequenas e fáceis de tentar novamente.

## Um exemplo real

Aqui está um exemplo completo de uma transação de compra:
```csharp
public async Task<Result> ProcessPurchase(string userId, string productId, int quantity)
{
    var result = await _db.TransactWriteAsync(new[]
    {
        // Decrement inventory
        new TransactWriteItem
        {
            Action = TransactAction.Update,
            PartitionKey = $"product#{productId}",
            SortKey = "inventory",
            UpdateExpression = "SET quantity = quantity - :qty",
            ConditionExpression = "quantity >= :qty",
            ExpressionAttributeValues = new { qty = quantity }
        },
        // Create order
        new TransactWriteItem
        {
            Action = TransactAction.Put,
            PartitionKey = $"user#{userId}",
            SortKey = $"order#{DateTime.UtcNow:O}",
            Data = new Dictionary<string, object>
            {
                ["productId"] = productId,
                ["quantity"] = quantity,
                ["status"] = "pending"
            }
        },
        // Update user's order count
        new TransactWriteItem
        {
            Action = TransactAction.Update,
            PartitionKey = $"user#{userId}",
            SortKey = "stats",
            UpdateExpression = "SET orderCount = if_not_exists(orderCount, 0) + 1"
        }
    });

    return result;
}
```

As três operações têm sucesso juntas, ou nenhuma delas acontece.

## Resumo

- Use transações quando operações precisam ser atômicas
- Use operações em batch quando as operações são independentes
- Mantenha transações pequenas (menos de 25 itens)
- Use condition expressions para evitar race conditions
- Trate falhas com elegância usando retries

Dúvidas? Fale comigo em mariogk@terrascale.tech. Se você ainda está moldando seu modelo de dados, leia [Partition Keys and Sort Keys: A Mental Model That Actually Makes Sense](/blog/understanding-partition-keys/) em seguida.
