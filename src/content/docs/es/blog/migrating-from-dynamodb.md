---
title: Guía completa para migrar de DynamoDB a TerraScale
date: 2024-05-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - migration
  - dynamodb
  - guide
excerpt: TerraScale ofrece una API compatible con DynamoDB que hace que la migración sea más sencilla. Aquí tienes la guía completa para mover tus datos.
cover:
  wide: /images/blog/migrating-from-dynamodb/cover-wide.svg
  square: /images/blog/migrating-from-dynamodb/cover-square.svg
  alt: Dos sistemas de datos estructurados conectados por un puente de transferencia sereno, representando la migración de una plataforma a otra.
---

Una de las preguntas que más me hacen es: "¿Cómo migro de DynamoDB a TerraScale?"

La buena noticia es que diseñamos TerraScale pensando en la migración. Nuestra API compatible con DynamoDB significa que a menudo puedes cambiar con modificaciones mínimas en el código. Aquí tienes la guía completa.

## Lo que aprenderás

- Qué estrategia de migración encaja mejor con tu sistema
- Cómo implementar un despliegue dual-write sin apresurar el cutover
- Qué verificar antes de mover finalmente el tráfico

Si estás planificando activamente una migración, ten a mano la [referencia de migrations](/reference/migrations/), la [página de comparaciones](/reference/comparisons/) y la [referencia de buenas prácticas](/reference/best-practices/).

## ¿Por qué migrar?

Antes de entrar en el cómo, hablemos de por qué quizá quieras migrar:

1. **Precios más simples** - El modelo pay-per-operation de TerraScale suele ser más predecible que las capacity units de DynamoDB
2. **Múltiples APIs** - Usa SQL, REST o APIs compatibles con DynamoDB sobre los mismos datos
3. **Mejor experiencia de desarrollo** - SDKs de primera clase con patrones modernos como tipos Result
4. **Costos transparentes** - Sin facturas sorpresa por políticas de auto-scaling olvidadas

Dicho eso, DynamoDB es excelente. Si te funciona, no hay una necesidad urgente de cambiar. Las migraciones valen la pena cuando los beneficios a largo plazo son claros, no porque cambiar de base de datos suene emocionante un viernes por la tarde.

## Estrategias de migración

Hay tres enfoques principales, cada uno con compensaciones. Elige el que se ajuste a tu tolerancia al downtime, la complejidad y el riesgo de rollback.

### Estrategia 1: Big bang

Exporta todo desde DynamoDB, impórtalo a TerraScale y actualiza tu aplicación para apuntar a TerraScale.

| Pros | Cons |
|------|------|
| Más simple conceptualmente | Requiere downtime |
| Cutover limpio | Riesgoso para datasets grandes |
| | Todo o nada |

**Ideal para:** Datasets pequeños, aplicaciones que pueden tolerar downtime planificado.

### Estrategia 2: Dual write

Actualiza tu aplicación para escribir en ambas bases de datos. Haz backfill de los datos históricos. Mueve gradualmente las lecturas a TerraScale. Al final, deja de escribir en DynamoDB.

| Pros | Cons |
|------|------|
| Cero downtime | Implementación más compleja |
| Transición gradual y segura | Costo temporal de ejecutar dos bases de datos |
| Rollback sencillo | Hay que manejar consistency con cuidado |

**Ideal para:** Sistemas de producción que no pueden tolerar downtime.

### Estrategia 3: Incremental por tabla

Migra una tabla a la vez. Cada tabla pasa por su propio ciclo dual-write.

| Pros | Cons |
|------|------|
| Menor riesgo por migración | Lleva más tiempo en total |
| Aprendes con cada iteración | Las queries entre tablas son complejas durante la migración |
| Más fácil de gestionar | |

**Ideal para:** Sistemas grandes con muchas tablas independientes.

## El patrón dual write

Como dual write es el enfoque más seguro para la mayoría de los sistemas en producción, así es como puedes implementarlo.

### Paso 1: configura TerraScale

Crea tu base de datos y genera una API key. Asegúrate de que la estructura de tus tablas coincida con la de DynamoDB. También es el momento adecuado para revisar tus decisiones sobre partition key y sort key en lugar de arrastrar todos los errores antiguos.

### Paso 2: implementa dual write
```csharp
public class DualWriteRepository
{
    private readonly IAmazonDynamoDB _dynamoDb;
    private readonly TerraScaleDatabase _terraScale;
    private readonly ILogger _logger;

    public async Task PutItemAsync(string pk, string sk, Dictionary<string, object> data)
    {
        // Write to DynamoDB first (primary)
        await _dynamoDb.PutItemAsync(/* ... */);

        // Write to TerraScale (secondary)
        try
        {
            await _terraScale.PutItemAsync(pk, sk, data);
        }
        catch (Exception ex)
        {
            // Log but don't fail - TerraScale is secondary during migration
            _logger.LogWarning(ex, "TerraScale write failed, will retry");
            await QueueForRetry(pk, sk, data);
        }
    }
}
```

### Paso 3: haz backfill de los datos históricos

Usa DynamoDB Streams o una exportación batch para sincronizar los datos existentes:
```csharp
public async Task BackfillFromDynamoDB()
{
    string? lastKey = null;

    do
    {
        var scanResult = await _dynamoDb.ScanAsync(new ScanRequest
        {
            TableName = "my-table",
            ExclusiveStartKey = lastKey != null ? ParseKey(lastKey) : null
        });

        foreach (var item in scanResult.Items)
        {
            await _terraScale.PutItemAsync(
                item["pk"].S,
                item["sk"].S,
                ConvertAttributes(item)
            );
        }

        lastKey = scanResult.LastEvaluatedKey?.ToString();

        // Respect rate limits
        await Task.Delay(100);

    } while (lastKey != null);
}
```

### Paso 4: mueve el tráfico de lectura

Usa una feature flag para mover lecturas gradualmente:
```csharp
public async Task<Item?> GetItemAsync(string pk, string sk)
{
    if (_featureFlags.TerraScaleReadEnabled)
    {
        try
        {
            var result = await _terraScale.GetItemAsync(pk, sk);
            if (result.IsSuccess)
                return result.Value;
        }
        catch
        {
            // Fall back to DynamoDB
        }
    }

    return await _dynamoDb.GetItemAsync(/* ... */);
}
```

Empieza con el 1% del tráfico, monitoriza y luego aumenta al 10%, 50% y 100%. Date tiempo entre pasos para comparar corrección y latencia, no solo throughput.

### Paso 5: verifica y haz el cutover

Cuando el 100% de las lecturas ya esté en TerraScale y tengas confianza en los datos:

1. Deja de escribir en DynamoDB
2. Actualiza tu aplicación para usar solo TerraScale
3. Mantén DynamoDB como backup de solo lectura durante 30 días
4. Desmantela DynamoDB

## Usar la API compatible con DynamoDB

TerraScale ofrece un endpoint compatible con DynamoDB. Esto significa que puedes usar tu código actual del AWS SDK con cambios mínimos:
```csharp
// Before: DynamoDB
var dynamoClient = new AmazonDynamoDBClient();

// After: TerraScale (DynamoDB-compatible endpoint)
var config = new AmazonDynamoDBConfig
{
    ServiceURL = "https://dynamodb.terrascale.io"
};
var terraScaleClient = new AmazonDynamoDBClient(
    new BasicAWSCredentials("your-api-key", "ignored"),
    config
);

// Your existing code works unchanged
await terraScaleClient.PutItemAsync(/* same code as before */);
```

Esta capa de compatibilidad admite:
- GetItem, PutItem, DeleteItem, UpdateItem
- Query and Scan
- BatchGetItem, BatchWriteItem
- TransactGetItems, TransactWriteItems

## Errores comunes

### Timestamps

DynamoDB suele almacenar timestamps como números (Unix epoch). El SDK de TerraScale prefiere cadenas ISO 8601. Sé explícito con tu formato:
```csharp
// Works in both
["createdAt"] = DateTime.UtcNow.ToString("O")
```

### Reserved words

TerraScale tiene menos reserved words que DynamoDB, pero comprueba los nombres de tus atributos por si acaso.

### Condition expressions

La sintaxis es casi idéntica, pero prueba tus condiciones complejas durante la migración. Los pequeños casos límite son exactamente el tipo de problema que conviene detectar antes del cutover completo.

Por qué importa: la mayoría de los fallos de migración no vienen del paso de exportación o importación. Vienen de suposiciones ocultas en el código de la aplicación, rutas de datos obsoletas o un cutover hecho antes de verificar lo suficiente.

## Checklist de verificación

Antes de completar la migración:

- [ ] Todos los datos rellenados y verificados
- [ ] El 100% de las lecturas se sirven desde TerraScale
- [ ] El 100% de las escrituras van a TerraScale
- [ ] Monitorización y alertas configuradas
- [ ] Procedimiento de rollback documentado
- [ ] Equipo entrenado en el dashboard de TerraScale

## ¿Necesitas ayuda?

Migrar puede ser estresante. Si estás planificando una migración grande, escríbeme a mariogk@terrascale.tech. Estaré encantado de revisar tu plan y darte sugerencias.
