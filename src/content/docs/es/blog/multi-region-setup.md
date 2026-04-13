---
title: "Expansión global: cómo configurar replication multi-region"
date: 2024-09-10
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - multi-region
  - replication
  - tutorial
excerpt: Tus usuarios están en todas partes. Tu base de datos también debería estarlo. Así puedes configurar replication multi-region en TerraScale con las expectativas correctas.
cover:
  wide: /images/blog/multi-region-setup/cover-wide.svg
  square: /images/blog/multi-region-setup/cover-square.svg
  alt: Clústeres de regiones espejados conectados por líneas de replication medidas, ilustrando una configuración multi-region.
---

Tus usuarios están en todas partes. Tu base de datos también debería estarlo.

TerraScale admite 19 regiones en todo el mundo. Con replication multi-region, tus datos se copian automáticamente a las regiones que elijas, dando a los usuarios acceso de baja latencia sin importar dónde estén.

Así es como se configura.

## Lo que aprenderás

- Cuándo vale la pena la complejidad adicional de replication multi-region
- Cómo añadir regiones desde el dashboard, el SDK o la API
- Qué cambia para lecturas, escrituras, consistency y costo

Si quieres la documentación del producto junto con este recorrido, abre la [referencia de replication](/reference/replication/) y la [referencia de regiones](/reference/regions/).

## ¿Por qué multi-region?

Hay tres motivos principales por los que los equipos adoptan multi-region:

1. **Latencia** - Un usuario en Tokyo accediendo a datos en us-east-1 añade 150-200ms de tiempo de ida y vuelta. Con una réplica en ap-northeast-1, baja de 10ms.

2. **Disponibilidad** - Si una región tiene un problema, las lecturas pueden servirse desde otra región.

3. **Compliance** - Algunas normativas exigen que los datos se almacenen en ubicaciones geográficas concretas.

## Configurar replication

### Vía dashboard

1. Ve a la configuración de tu base de datos
2. Haz clic en "Add Region"
3. Selecciona la(s) región(es) que quieres
4. Haz clic en "Enable Replication"

Eso es todo. Los datos existentes empiezan a sincronizarse de inmediato. Para una base de datos nueva, esto suele sentirse casi instantáneo. Para una más grande, espera que la primera sincronización tarde más mientras la copia inicial se pone al día.

### Vía SDK
```csharp
await client.Management.Databases.AddRegionAsync("my-database", new AddRegionRequest
{
    Region = "eu-west-1"
});
```

### Vía API
```bash
POST /api/v1/management/databases/my-database/regions
{
    "region": "eu-west-1"
}
```

## Cómo funciona la replication

Cuando escribes en TerraScale, este es el flujo:

1. La escritura va a tu región primaria
2. Se confirma en cuanto es durable allí
3. De forma asíncrona, los datos se replican a otras regiones
4. La replication suele completarse en 100-500ms
```
Write in us-east-1 → Durable in us-east-1 (12ms) → Response to client
                   → Async replicate to eu-west-1 (~200ms)
                   → Async replicate to ap-northeast-1 (~300ms)
```

## Leer desde réplicas

Por defecto, las lecturas van a la región más cercana:
```csharp
var result = await client.GetItemAsync("user#123", "profile");
// Automatically routes to nearest region
```

Si necesitas el dato más reciente posible, usa una lectura consistente:
```csharp
var result = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ConsistentRead = true  // Routes to primary region
});
```

## Elegir regiones

Este es mi modelo mental para elegir regiones. Empieza por donde están tus usuarios hoy, no por donde esperas que quizá estén el año que viene.

| User Location | Primary Region | Replica Regions |
|---------------|----------------|-----------------|
| Mostly US | us-east-1 | us-west-2 |
| US + Europe | us-east-1 | eu-west-1 |
| Global | us-east-1 | eu-west-1, ap-northeast-1 |
| Europe-focused | eu-west-1 | eu-central-1 |
| Asia-focused | ap-southeast-1 | ap-northeast-1 |

Empieza con tu base principal de usuarios y añade regiones a medida que crezcas. Una segunda región bien elegida suele darte más valor que dispersarte demasiado pronto en muchas.

## Regiones disponibles

TerraScale funciona en 19 regiones:

**Americas:**
- us-east-1 (N. Virginia)
- us-east-2 (Ohio)
- us-west-1 (N. California)
- us-west-2 (Oregon)
- ca-central-1 (Montreal)
- sa-east-1 (São Paulo)

**Europe:**
- eu-west-1 (Ireland)
- eu-west-2 (London)
- eu-west-3 (Paris)
- eu-central-1 (Frankfurt)
- eu-north-1 (Stockholm)

**Asia Pacific:**
- ap-northeast-1 (Tokyo)
- ap-northeast-2 (Seoul)
- ap-southeast-1 (Singapore)
- ap-southeast-2 (Sydney)
- ap-south-1 (Mumbai)

**Middle East & Africa:**
- me-south-1 (Bahrain)
- af-south-1 (Cape Town)

## Resolución de conflictos

¿Qué ocurre si el mismo ítem se escribe en dos regiones al mismo tiempo?

TerraScale usa last-writer-wins en función del timestamp. La escritura con el timestamp más reciente se convierte en la versión autoritativa.

Para la mayoría de los casos de uso, esto está bien. Los usuarios rara vez actualizan el mismo ítem desde continentes distintos exactamente al mismo tiempo.

Por qué importa: multi-region te da mejor experiencia de usuario y mejor resiliencia, pero también significa que debes ser intencional sobre dónde se originan las escrituras y qué consistency necesita realmente tu aplicación.

Si necesitas consistency más fuerte, designa que las escrituras vayan a tu región primaria:
```csharp
var client = new TerraScaleDatabase(new TerraScaleDatabaseOptions
{
    ApiKey = "...",
    DatabaseId = "my-database",
    PreferredWriteRegion = "us-east-1"  // All writes go here
});
```

## Costos

La replication multi-region tiene costos:

- **Storage**: Cada región almacena una copia completa de tus datos
- **Replication**: Transferencia de datos entre regiones

Para una base de datos de 10GB con 3 regiones:
- Storage: 10GB × 3 = 30GB total
- Replication: Depende del volumen de escritura

La mejora de latencia suele valer la pena para aplicaciones orientadas al usuario. Si eres sensible al costo, compáralo con la [referencia de billing](/reference/billing/) antes de activar más regiones de las que necesitas.

## Eliminar una región

Si ya no necesitas una región:
```csharp
await client.Management.Databases.RemoveRegionAsync("my-database", new RemoveRegionRequest
{
    Region = "eu-west-1"
});
```

Los datos de esa región se eliminan. La región primaria y las demás réplicas no se ven afectadas.

## Monitorizar replication

El dashboard muestra el estado de replication:

- **Replication Lag**: Tiempo de retraso frente a la primaria
- **Sync Status**: Syncing, Synced o Error
- **Last Sync**: Cuándo se completó la replication por última vez

Un replication lag saludable está por debajo de 1 segundo. Si ves un retraso sostenido de más de 5 segundos, revisa tu volumen de escritura o contacta con soporte.

## Resumen

1. Añade regiones donde estén tus usuarios
2. Las lecturas van automáticamente a la región más cercana
3. Usa lecturas consistentes cuando necesites los datos más recientes
4. Last-writer-wins para la resolución de conflictos
5. Monitoriza replication lag en el dashboard

¿Preguntas sobre configuración multi-region? Escribe a mariogk@terrascale.tech. Si estás planificando lecturas y escrituras globales a la vez, la [referencia de buenas prácticas](/reference/best-practices/) puede ayudarte a evitar errores comunes de modelado.
