---
title: "10 consejos para optimizar tus costos en TerraScale"
date: 2024-08-05
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - optimization
  - cost
  - tips
excerpt: El precio de TerraScale es simple, pero eso no significa que no puedas optimizar. Aquí tienes 10 consejos prácticos para obtener más valor de tu base de datos.
cover:
  wide: /images/blog/cost-optimization-tips/cover-wide.svg
  square: /images/blog/cost-optimization-tips/cover-square.svg
  alt: Capas comprimidas y bandas recortadas equilibradas alrededor de un núcleo, representando la optimización de costos de base de datos.
---

El precio de TerraScale es directo: pagas por almacenamiento y operaciones. Pero eso no significa que no puedas optimizar. Aquí tienes 10 consejos que comparto con desarrolladores para ayudarles a sacar el máximo valor.

## Lo que aprenderás

- Qué patrones comunes de consulta cuestan más de lo necesario
- Cómo las decisiones de modelado de datos afectan tanto el rendimiento como el gasto
- Dónde mirar en el dashboard cuando los costos empiezan a subir poco a poco

Si quieres comparar este consejo con la documentación del producto, deja abiertas la [referencia de precios](/reference/pricing/), la [referencia de billing](/reference/billing/) y la [guía de buenas prácticas](/reference/best-practices/).

## 1. Usa queries, no scans

Este es el más importante. Una query usa la partition key para encontrar datos directamente. Un scan lee todos los ítems de tu base de datos.
```csharp
// Good: Query by partition key
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "customer#123"
});

// Expensive: Scan everything
var allOrders = await client.ScanAsync(new ScanOptions());
```

Si haces scans con frecuencia, rediseña tu modelo de datos. La mayoría de los problemas de costo empiezan como problemas de modelado.

## 2. Usa projection

Recupera solo los atributos que necesitas:
```csharp
// Fetches entire item (maybe 5KB)
var user = await client.GetItemAsync("user#123", "profile");

// Fetches only name and email (maybe 100 bytes)
var user = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ProjectionAttributes = new[] { "name", "email" }
});
```

Menos datos transferidos significan menores costos y, por lo general, respuestas más rápidas también.

## 3. Agrupa operaciones en batch

Las solicitudes individuales tienen overhead. Las operaciones en batch son más eficientes:
```csharp
// Slow and expensive: 100 individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Fast and cheap: 1 batch request
var items = await client.BatchGetAsync(keys);
```

BatchGet admite hasta 100 ítems. BatchWrite admite hasta 25. La [referencia de operaciones batch](/reference/api/batch-operations/) tiene los límites exactos y el comportamiento.

## 4. No guardes logs en TerraScale

TerraScale está optimizado para datos operativos, cosas que consultas con frecuencia y con requisitos de baja latencia. Los logs son append-only, se consultan poco y normalmente no necesitan tiempos de respuesta por debajo de 10ms.

Usa un servicio de logging dedicado. Ahorrarás dinero y tendrás mejores funciones específicas para logs.

## 5. Comprime atributos grandes

Si guardas blobs grandes de JSON o texto, considera compresión:
```csharp
var compressed = Compress(largeJsonString);
await client.PutItemAsync("doc#123", "content", new Dictionary<string, object>
{
    ["data"] = Convert.ToBase64String(compressed),
    ["compressed"] = true
});
```

Ratios típicos de compresión de 3x a 4x pueden traducirse en ahorros relevantes de almacenamiento.

## 6. Configura TTL para datos temporales

Si los datos tienen una expiración natural, usa TTL en lugar de limpieza manual:
```csharp
await client.PutItemAsync("session#abc", "data", new Dictionary<string, object>
{
    ["userId"] = "user#123",
    ["ttl"] = DateTimeOffset.UtcNow.AddHours(24).ToUnixTimeSeconds()
});
```

Los ítems expirados se eliminan automáticamente sin costo. TTL es una de las ganancias más fáciles para datos de sesión, tokens temporales y cachés de corta vida.

## 7. Usa el tamaño de ítem correcto

TerraScale cobra por operación, no por byte (en lecturas y escrituras). Pero hay un límite de 400KB por ítem, y los ítems grandes son más lentos.

Si tienes ítems de más de 100KB, considera:
- Dividirlos en varios ítems
- Guardar contenido grande en blob storage con una referencia en TerraScale
- Comprimir los datos

## 8. Consolida ítems pequeños

La otra cara es que, si tienes muchos ítems diminutos que siempre lees juntos, considera combinarlos:
```csharp
// 10 individual items = 10 read operations
await client.GetItemAsync("user#123", "setting#theme");
await client.GetItemAsync("user#123", "setting#language");
// ... 8 more

// 1 combined item = 1 read operation
await client.GetItemAsync("user#123", "settings");
```

## 9. Usa staging con criterio

Tu entorno de staging no necesita una copia completa de los datos de producción. Un subconjunto representativo funciona bien para pruebas y ahorra costos de almacenamiento.

## 10. Supervisa tu uso

El dashboard muestra exactamente de dónde vienen tus costos:

- Almacenamiento por tabla
- Operaciones de lectura y escritura por tabla
- Consultas más costosas

Revísalo cada mes. A menudo encontrarás mejoras rápidas.

Por qué importa: la configuración de base de datos más barata no siempre es la mejor. El objetivo real es gastar en las lecturas y escrituras que impulsan tu producto y evitar pagar por trabajo accidental.

## La filosofía

El precio de TerraScale está diseñado para ser predecible. Pagas por lo que usas y siempre puedes ver lo que estás usando.

El objetivo no es minimizar tu factura a toda costa. El objetivo es asegurarte de que estás obteniendo valor por lo que gastas. Una factura de base de datos que respalda un negocio sano es una buena compensación.

Concéntrate en construir gran software. Optimiza costos cuando realmente importen. Y si alguna vez dudas sobre el mejor enfoque, escríbeme a mariogk@terrascale.tech.
