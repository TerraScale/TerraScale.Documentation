---
title: "Transacciones en TerraScale: cuándo y cómo usarlas"
date: 2024-08-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - transactions
  - deep-dive
  - tutorial
excerpt: Las transacciones te permiten actualizar varios ítems de forma atómica. Aquí verás cuándo las necesitas, cuándo no y cómo usarlas bien en TerraScale.
cover:
  wide: /images/blog/transactions-deep-dive/cover-wide.svg
  square: /images/blog/transactions-deep-dive/cover-square.svg
  alt: Dos formas atómicas brillantes fijadas en un marco equilibrado, expresando transacciones precisas de todo o nada.
---

Las transacciones son una de las funciones más potentes de TerraScale y una de las más mal entendidas. Voy a aclarar cuándo las necesitas, cuándo no y cómo usarlas de manera efectiva.

## Lo que aprenderás

- Cuándo una transacción es la herramienta correcta
- Cuándo basta con un batch write o una sola actualización condicional
- Cómo manejar fallos de transacción sin sorprender a tus usuarios

Si quieres tener la superficie de la API junto a este recorrido, mantén a mano la [referencia de transacciones](/reference/api/transactions/) y la [guía de manejo de errores](/reference/error-handling/).

## ¿Qué son las transacciones?

Una transacción te permite realizar varias operaciones que o bien tienen éxito todas o bien fallan todas. No hay punto medio.

Ese comportamiento de todo o nada es lo que hace tan útiles a las transacciones y también por lo que cuestan más que las operaciones simples.
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

Si alguna actualización falla, no ocurre ninguna. El dinero no desaparece en el vacío.

## Cuándo necesitas transacciones

### Operaciones financieras

Mover dinero entre cuentas es el ejemplo clásico. Necesitas que tanto el débito como el crédito ocurran, o que no ocurra ninguno.

### Gestión de inventario

Disminuir stock y crear un pedido debe ser atómico:
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

### Consistencia entre entidades

Cuando dos entidades deben mantenerse sincronizadas:
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

## Cuándo NO necesitas transacciones

### Operaciones independientes

Si las operaciones no dependen unas de otras, usa batch writes. Normalmente obtendrás menos latencia y menor costo.
```csharp
// These are independent - use BatchWrite, not Transaction
await client.BatchWriteAsync(new[]
{
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... },
    new BatchWriteItem { Operation = BatchOperation.Put, ... }
});
```

BatchWrite es más rápido y más barato que TransactWrite. La [referencia de operaciones batch](/reference/api/batch-operations/) profundiza en esas compensaciones.

### Actualizaciones de un solo ítem

Para un solo ítem, un PutItem o UpdateItem normal con condition expression suele ser suficiente:
```csharp
await client.UpdateItemAsync("account#123", "balance",
    "SET balance = balance - 100",
    conditionExpression: "balance >= 100"
);
```

### Operaciones de solo lectura

Para leer varios ítems, usa BatchGet o queries en paralelo:
```csharp
var items = await client.BatchGetAsync(keys);
```

TransactGet existe para casos en los que necesitas una instantánea consistente entre ítems, pero rara vez es necesario.

Por qué importa: las transacciones no son una medalla de madurez arquitectónica. Son una herramienta para proteger invariantes. Si no hay un invariante que proteger, mantenlo simple.

## Límites de transacción

Conoce los límites:

| Limit | Value |
|-------|-------|
| Items per transaction | 25 |
| Total size | 4MB |
| Items per partition | No limit |
| Cross-region | Not supported |

Si necesitas más de 25 ítems, tendrás que reestructurar la operación o aceptar eventual consistency en algunas partes.

## Condition expressions

El verdadero poder de las transacciones viene de las condition expressions:
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

Si la condición falla, toda la transacción se cancela. Esto evita race conditions.

## Manejo de fallos de transacción

Las transacciones pueden fallar por varias razones. Planifícalo desde el principio para que tu aplicación responda con limpieza.
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

## Tokens de idempotencia

Para transacciones críticas, usa tokens de idempotencia para evitar ejecuciones duplicadas:
```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: $"order-{orderId}-payment"
);
```

Si se usa el mismo token dentro de 10 minutos, TerraScale devuelve el resultado anterior sin volver a ejecutar.

## Consideraciones de rendimiento

Las transacciones son más caras que las operaciones normales:

- ~2x la latencia de una sola escritura
- ~2x el costo en write units
- Contención de locks en ítems calientes

Úsalas cuando necesites atomicidad, no como valor por defecto. Para la mayoría de los sistemas, eso significa mantener las transacciones enfocadas, pequeñas y fáciles de reintentar.

## Un ejemplo real

Aquí tienes un ejemplo completo de una transacción de compra:
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

Las tres operaciones tienen éxito juntas, o no ocurre ninguna.

## Resumen

- Usa transacciones cuando las operaciones deban ser atómicas
- Usa operaciones batch cuando las operaciones sean independientes
- Mantén las transacciones pequeñas (menos de 25 ítems)
- Usa condition expressions para evitar race conditions
- Maneja los fallos con elegancia usando retries

¿Preguntas? Escríbeme a mariogk@terrascale.tech. Si todavía estás dando forma a tu modelo de datos, lee [Partition Keys and Sort Keys: A Mental Model That Actually Makes Sense](/blog/understanding-partition-keys/) a continuación.
