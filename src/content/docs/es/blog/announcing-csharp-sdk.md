---
title: "Anunciamos el SDK de C# para TerraScale: soporte .NET de primera clase"
date: 2024-07-03
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - announcement
  - sdk
  - dotnet
excerpt: Hoy lanzamos el SDK oficial de C# para TerraScale. Esto es lo que incluye, por qué lo construimos y cómo empezar.
cover:
  wide: /images/blog/announcing-csharp-sdk/cover-wide.svg
  square: /images/blog/announcing-csharp-sdk/cover-square.svg
  alt: Formas de ingeniería precisas con corchetes y nodos modulares, evocando el lanzamiento pulido de un nuevo SDK.
---

Hoy lanzamos el SDK oficial de C# para TerraScale. Lleva tres meses en Public Alpha y estoy genuinamente orgulloso de cómo quedó.

## Lo que aprenderás

- Por qué empezamos con C# antes que con otros SDKs
- Qué te da el SDK desde el primer momento
- A dónde ir después si quieres construir una app real con él

Para la documentación completa del producto, ten cerca la [guía del SDK de C#](/guides/sdks/csharp/), la [guía de repository](/guides/repository/) y la [referencia de manejo de errores](/reference/error-handling/).

## ¿Por qué C# primero?

Cuando empezamos a construir SDKs, tuvimos que elegir un lenguaje para arrancar. JavaScript habría sido la opción obvia, está en todas partes. Pero vimos a nuestros primeros usuarios y notamos algo interesante: un número desproporcionado eran equipos .NET.

El diagrama de Venn entre "desarrolladores que quieren una experiencia similar a DynamoDB" y "desarrolladores que construyen con C#" tiene mucha superposición. Muchos están migrando desde Azure Cosmos DB o creando backends de alto rendimiento, donde C# brilla.

Así que fue C#.

## Qué incluye

### Instalación
```bash
dotnet add package TerraScale.Client
```

Eso es todo. Sin dependencias nativas, sin configuración compleja. Funciona en .NET 6, 7 y 8.

### Uso básico
```csharp
using TerraScale;

var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY"),
    DatabaseId = "my-database"
});

// Write an item
await client.PutItemAsync("user#123", "profile", new Dictionary<string, object>
{
    ["name"] = "Mario",
    ["email"] = "mariogk@terrascale.tech",
    ["createdAt"] = DateTime.UtcNow
});

// Read it back
var result = await client.GetItemAsync("user#123", "profile");
if (result.IsSuccess)
{
    var name = result.Value.GetAttribute<string>("name");
    Console.WriteLine($"Hello, {name}!");
}
```

### El patrón Repository

Los diccionarios sin procesar sirven para prototipos, pero el código de producción merece algo mejor:
```csharp
public record User : EntityBase
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public DateTime? LastLoginAt { get; init; }
}

var users = client.GetRepository<User>("users");

var user = new User
{
    Id = "user-123",
    Name = "Mario",
    Email = "mariogk@terrascale.tech"
};

await users.CreateAsync(user);
var retrieved = await users.GetByIdAsync("user-123");
Console.WriteLine(retrieved.Value.Name); // Mario
```

### Tipos Result

Cada operación del SDK devuelve un tipo `Result<T>`. Nada de excepciones para fallos esperados:
```csharp
var result = await client.GetItemAsync("user#123", "profile");

var message = result switch
{
    { IsSuccess: true } => $"Found: {result.Value.PartitionKey}",
    { IsFailed: true } => $"Error: {result.Errors.First().Message}",
    _ => "Unknown state"
};
```

### Políticas de retry

Los fallos transitorios se gestionan automáticamente:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "...",
    Retry = new RetryPolicyOptions
    {
        MaxRetries = 3,
        BaseDelay = TimeSpan.FromMilliseconds(100),
        MaxDelay = TimeSpan.FromSeconds(5),
        UseJitter = true
    }
});
```

## Rendimiento

Estos números vienen de nuestros benchmarks internos. Lo mejor es usarlos como orientación, no como una promesa de que cada carga de trabajo se comportará exactamente igual.

| Operation | Throughput | Memory |
|-----------|------------|--------|
| PutItem (1KB) | 15,000/sec | ~2KB/op |
| GetItem | 25,000/sec | ~1KB/op |
| Query (100 items) | 800/sec | ~50KB/op |
| Batch (25 items) | 2,000/sec | ~20KB/op |

## Lo que viene

- **LINQ provider** - Consultas con `Where`, `Select`, `Take`
- **Change tracking** - Detección automática de cambios
- **Interceptors** - Integración con el pipeline de solicitudes
- **AOT support** - Compatibilidad total con Native AOT

## Primeros pasos

La [documentación del SDK](/guides/sdks/csharp/) tiene todo lo que necesitas. Pero, honestamente, solo instala el paquete y empieza a programar.
```bash
dotnet add package TerraScale.Client
```

Si tienes problemas, escríbeme a mariogk@terrascale.tech. Si aún eres nuevo en TerraScale, combina la documentación del SDK con la [guía de inicio](/guides/getting-started/).

¡Feliz código!
