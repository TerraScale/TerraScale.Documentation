---
title: Buenas prácticas
description: Buenas prácticas para crear aplicaciones con TerraScale.
sidebar:
  order: 11
---

Buenas prácticas para crear aplicaciones de alto rendimiento y confiables con TerraScale. Usa esta página como una lista práctica mientras diseñas claves, estructuras consultas y ajustas costos entre regiones.

---

## Diseño de claves

### Usa claves de partición significativas

Diseña claves de partición que distribuyan los datos de forma uniforme y den soporte a tus patrones de acceso:
```csharp
// Good: Distributes data by user
{ "pk": "user#123", "sk": "profile" }
{ "pk": "user#123", "sk": "order#001" }

// Avoid: All data in one partition
{ "pk": "all_users", "sk": "user#123" }
```

Por qué importa en TerraScale: las claves de partición afectan directamente la distribución de escrituras, la eficiencia de lectura y qué tan bien escala tu carga entre regiones. Una estrategia sólida de claves es una de las formas más simples de evitar latencia y costo innecesarios. Consulta [Data Models](/reference/data-models/) para ver los tipos principales de solicitudes detrás de estos patrones.

### Aprovecha las sort keys para elementos relacionados

Agrupa elementos relacionados bajo la misma clave de partición:
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

Por qué importa en TerraScale: colocar elementos relacionados juntos mantiene las consultas más dirigidas. Normalmente eso significa menos lecturas, menor costo por operación y paginación más simple. Para más patrones de consulta, consulta [Querying Guide](/guides/querying/).

### Evita particiones calientes

Distribuye las escrituras entre claves de partición:
```csharp
// Bad: All writes to one partition
{ "pk": "orders", "sk": "order#12345" }

// Good: Partition by date or user
{ "pk": "orders#2024-01-15", "sk": "order#12345" }
{ "pk": "user#456#orders", "sk": "order#12345" }
```

Por qué importa en TerraScale: las particiones calientes pueden aparecer rápido en cargas globales, cuando el tráfico de varias regiones converge en la misma clave. Si una entidad lógica recibe mucho volumen de escritura, considera buckets por tiempo, buckets por tenant u otro componente de shard en la clave.

---

## Optimización de consultas

### Usa Query en lugar de Scan

Las consultas son eficientes, los scans leen todo:
```csharp
// Good: Query by partition key
var result = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123"
});

// Avoid: Scan the entire database
var result = await client.ScanAsync(new PaginationOptions());
```

Por qué importa en TerraScale: los scans leen muchos más datos que las queries, así que aumentan la latencia y pueden consumir el presupuesto de solicitudes más rápido. Si esperas que una ruta de producción se ejecute con frecuencia, diseña primero para `QueryAsync`. Los límites relacionados están documentados en [Rate Limits](/reference/rate-limits/).

### Limita el tamaño de los resultados

Especifica siempre límites razonables:
```csharp
var result = await client.QueryAsync(filter, new QueryOptions
{
    Limit = 50  // Don't fetch more than needed
});
```

Por qué importa en TerraScale: las respuestas de query y scan tienen un límite de 1 MB por respuesta. Los tamaños de página más pequeños también hacen que los reintentos sean más baratos y ayudan a suavizar la latencia entre regiones.

### Usa expresiones de proyección

Devuelve solo los atributos necesarios:
```csharp
var options = new QueryOptions
{
    ProjectionAttributes = new[] { "name", "email" }  // Skip large attributes
};
```

Por qué importa en TerraScale: devolver solo los atributos que necesitas reduce el tamaño del payload y mantiene los costos de lectura más predecibles, sobre todo cuando los documentos contienen objetos anidados grandes.

### Diseña para los patrones de acceso

Estructura las claves para dar soporte a tus consultas:
```csharp
// Access pattern: Get user's orders by date
{ "pk": "user#123", "sk": "order#2024-01-15#001" }

// Now you can query by date range
SortKeyCondition.Between("order#2024-01-01", "order#2024-01-31")
```

Por qué importa en TerraScale: los patrones de acceso deben guiar las decisiones de esquema. Si sabes que necesitas rangos por fecha, vistas por tenant o agrupaciones por estado, incorpóralo en las claves desde el principio para no depender después de filtros costosos.

---

## Manejo de errores

### Verifica siempre los resultados

Nunca supongas que las operaciones tuvieron éxito:
```csharp
var result = await client.GetItemAsync("user#123");

if (result.IsFailed)
{
    logger.LogError("Get failed: {Error}", result.Errors.First().Message);
    return null;
}

return result.Value;
```

Por qué importa en TerraScale: muchos problemas operativos aparecen primero como fallos parciales, problemas de validación o throttling. Las comprobaciones explícitas hacen visibles esos fallos mientras aún es fácil recuperarse. Consulta [API Reference](/reference/api/) para el comportamiento por endpoint.

### Implementa lógica de reintento

Gestiona los fallos transitorios con cuidado:
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

Por qué importa en TerraScale: pequeños fallos de red, transiciones breves de réplica y rate limiting son mucho más fáciles de absorber cuando los reintentos están incorporados desde el inicio. Siempre que puedas, combina reintentos con patrones de escritura idempotentes.

### Registra errores con contexto

Incluye detalles de la operación para depurar:
```csharp
if (result.IsFailed)
{
    logger.LogError(
        "Failed to get item PK={Pk} SK={Sk}: {Error}",
        pk, sk, result.Errors.First().Message
    );
}
```

Por qué importa en TerraScale: las claves de solicitud, el contexto de región y el tipo de operación hacen que los incidentes sean mucho más rápidos de depurar. Un buen logging también ayuda a detectar si los fallos se agrupan alrededor de un patrón de acceso o una partición caliente.

---

## Transacciones

### Usa transacciones solo cuando sea necesario

Las transacciones tienen mayor latencia que las operaciones por lotes:
```csharp
// Use batch for independent writes
await client.BatchWriteAsync(items);

// Use transactions only for atomic operations
await client.TransactWriteAsync(items);
```

Por qué importa en TerraScale: las transacciones te dan atomicidad, pero normalmente cuestan más que las operaciones por lotes independientes y añaden sobrecarga de coordinación. Úsalas para límites de corrección, no como la ruta de escritura predeterminada.

### Mantén las transacciones pequeñas

Menos elementos significa ejecución más rápida:
```csharp
// Good: Small, focused transaction
var items = new List<TransactWriteItem>
{
    new() { Action = TransactAction.Put, ... },
    new() { Action = TransactAction.Update, ... }
};

// Avoid: Large transactions with many items
```

Por qué importa en TerraScale: las transacciones más pequeñas terminan antes, fallan de manera más clara y son más fáciles de reintentar con seguridad. También facilitan mantenerse dentro de los límites de tamaño de solicitud.

### Usa tokens de idempotencia

Evita operaciones duplicadas al reintentar:
```csharp
var result = await client.TransactWriteAsync(
    items,
    clientRequestToken: "order-12345-payment"
);
```

Por qué importa en TerraScale: si un cliente reintenta tras un timeout, los tokens de idempotencia te ayudan a evitar escrituras duplicadas o eventos de negocio duplicados.

---

## Rendimiento

### Usa operaciones por lotes

Reduce los viajes de red:
```csharp
// Bad: Many individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Good: Single batch request
await client.BatchGetAsync(keys);
```

Por qué importa en TerraScale: las operaciones por lotes reducen round trips y te ayudan a mantener la eficiencia bajo límites de solicitudes por segundo. Ten presentes los límites por solicitud documentados, como 25 elementos para batch write y 100 claves para batch get. Consulta [Rate Limits](/reference/rate-limits/).

### Procesamiento en paralelo

Procesa operaciones independientes de forma concurrente:
```csharp
var tasks = partitions.Select(pk =>
    client.QueryAsync(new QueryFilter { PartitionKey = pk })
);

var results = await Task.WhenAll(tasks);
```

Por qué importa en TerraScale: las lecturas en paralelo pueden mejorar el throughput para particiones independientes, pero demasiada concurrencia puede llevarte al throttling. Aumenta la concurrencia poco a poco y vigila la latencia de cola.

### Pooling de conexiones

Reutiliza instancias del cliente:
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

Por qué importa en TerraScale: reutilizar clientes evita repetir la configuración de conexiones y mantiene tu aplicación más estable bajo carga.

---

## Seguridad

### Usa alcances específicos

Concede el mínimo de permisos necesarios:
```csharp
// Good: Specific permissions
{ "scopes": ["database:read", "repository:read"] }

// Avoid: Overly broad permissions
{ "scopes": ["*"] }
```

Por qué importa en TerraScale: los alcances estrechos reducen el impacto si una clave se filtra y hacen mucho más simples las revisiones de permisos.

### Rota las API keys

Define expiración y rótalas con regularidad:
```csharp
await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Production Key",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddMonths(3)
));
```

Por qué importa en TerraScale: las credenciales de vida corta son más fáciles de contener durante incidentes y más seguras para automatizaciones que abarcan varios equipos o regiones.

### Activa MFA

Protege las cuentas con autenticación de dos factores.

Por qué importa en TerraScale: el acceso administrativo suele incluir billing, gestión de claves y configuración de producción. MFA añade una capa importante de protección.

### Guarda los secretos de forma segura

Nunca hagas commit de API keys en el control de versiones:
```csharp
// Good: Environment variable
var apiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY");

// Good: Secret manager
var apiKey = await secretManager.GetSecretAsync("terrascale-api-key");

// Bad: Hardcoded
var apiKey = "ts_live_abc123...";
```

Por qué importa en TerraScale: las API keys suelen llevar acceso amplio a datos. Guárdalas en un gestor de secretos o en una variable de entorno, nunca en el control de versiones.

---

## Modelado de datos

### Usa repositorios para entidades de dominio

Entidades tipadas con validación de esquema:
```csharp
public record Customer : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
}

var customers = client.GetRepository<Customer>("customers");
```

Por qué importa en TerraScale: los repositorios son una buena opción cuando quieres entidades tipadas, validación compartida y código de aplicación más limpio. Consulta [Repository Pattern](/guides/repository/) para una guía más completa.

### Usa raw items para datos flexibles

Atributos dinámicos sin esquema:
```csharp
var item = new DatabaseItem
{
    PartitionKey = "config#app",
    Attributes = configData
};
```

Por qué importa en TerraScale: los raw items funcionan bien para configuraciones, metadatos dinámicos o fases de migración donde la estructura aún está cambiando.

### Desnormaliza para mejorar el rendimiento de lectura

Guarda los datos con la forma en que los lees:
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

Por qué importa en TerraScale: los joins no son el camino ideal en cargas de trabajo documentales y clave-valor. Guardar los datos en la forma en que más los lees suele darte una latencia más predecible.

---

## Monitorización

### Haz seguimiento del uso

Controla tu uso frente a los límites del plan:
```csharp
var usage = await client.Payment.GetUsageAsync();

if (usage.Value.TotalRequests > warningThreshold)
{
    logger.LogWarning("Approaching request limit");
}
```

Por qué importa en TerraScale: seguir el uso te ayuda a detectar aumentos de solicitudes, crecimiento de storage y cambios de costo por región antes de que se vuelvan una sorpresa. Si estás planificando una mejora de plan, consulta [How to Choose a Plan](/guides/how-to-choose-a-plan/).

### Usa endpoints de health

Monitoriza la disponibilidad de la API:
```bash
curl https://api.terrascale.io/health
```

Por qué importa en TerraScale: los endpoints de health te dan una señal clara para comprobaciones de preparación y uptime durante despliegues y respuesta a incidentes. Consulta [Health Endpoints](/reference/api/health/).

---

## Próximos pasos

- [Data Models](/reference/data-models/) - Revisa los tipos principales de solicitudes y entidades
- [Rate Limits](/reference/rate-limits/) - Mantente dentro de los límites
- [Querying Guide](/guides/querying/) - Diseña patrones de acceso más eficientes
- [API Reference](/reference/api/) - Revisa los detalles de los endpoints

