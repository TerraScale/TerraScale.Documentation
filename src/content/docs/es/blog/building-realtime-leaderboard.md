---
title: Cómo construir un leaderboard de gaming en tiempo real con TerraScale
date: 2024-05-28
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - gaming
  - real-time
excerpt: Vamos a construir un leaderboard que soporte 10.000 actualizaciones de puntuación por segundo. Todo cabe en unas 200 líneas de código. Así se arma.
cover:
  wide: /images/blog/building-realtime-leaderboard/cover-wide.svg
  square: /images/blog/building-realtime-leaderboard/cover-square.svg
  alt: Altos pilares clasificados con trazos de movimiento disciplinados, sugiriendo un leaderboard de gaming rápido en tiempo real.
---

Me propuse construir un leaderboard de gaming en tiempo real. No una demo de juguete, sino algo que realmente pudiera soportar un juego móvil popular. El objetivo: 10.000 actualizaciones de puntuación por segundo y consultas al leaderboard en menos de 50ms.

Spoiler: lo hice en unas 200 líneas de código. Aquí va todo el recorrido.

## Lo que aprenderás

- Por qué el modelo de leaderboard más obvio se rompe a escala
- Cómo un diseño por buckets mantiene viables las actualizaciones y las búsquedas de ranking
- Qué partes conviene precalcular en lugar de recalcular bajo demanda

Si todavía eres nuevo en modelado con TerraScale, lee la [guía de partition key](/blog/understanding-partition-keys/) y la [referencia de buenas prácticas](/reference/best-practices/) junto con este recorrido.

## Los requisitos

Un leaderboard de gaming necesita soportar varios patrones de acceso al mismo tiempo:

1. **Actualizaciones de puntuación** - Los jugadores envían puntuaciones constantemente
2. **Top 100 global** - Mostrar a los mejores jugadores del mundo
3. **Ranking del jugador** - "Estás en el puesto #4.847 de 1,2 millones de jugadores"
4. **Leaderboard de amigos** - ¿Cómo me comparo con mis amigos?
5. **Tablas por tiempo** - Diario, semanal, histórico

La parte difícil es que estos requisitos chocan entre sí. Las actualizaciones de puntuación deben ser rápidas y optimizadas para escritura. Los leaderboards deben estar ordenados y optimizados para lectura. No puedes optimizar ambas cosas con un enfoque ingenuo.

## El enfoque ingenuo (no hagas esto)

Mi primer instinto fue este:
```
pk: "leaderboard#global"
sk: "{score}#{playerId}"
```

Esto mantiene las puntuaciones ordenadas. Fácil, ¿no?

No. Cada vez que cambia la puntuación de un jugador, tengo que borrar la entrada anterior e insertar una nueva. Con millones de jugadores y miles de actualizaciones por segundo, esto crea una enorme contención en una sola partición.

Además, obtener el ranking de un jugador requiere contar todas las entradas con una puntuación superior. Para el jugador #500.000, eso significa contar 500.000 ítems. Paso.

## El enfoque real

Después de investigar un poco, llegué a un enfoque por buckets.

### Modelo de datos
```
// Player's current score
pk: "player#{playerId}"
sk: "score"
data: { score: 15420, updated: "2024-05-28T..." }

// Bucket metadata, lets us query counts in score order
pk: "leaderboard#global"
sk: "bucket#15000"  // Bucket for scores 15000-15999
data: { count: 4827 }  // 4827 players have scores in this range

// Top 100 cache
pk: "leaderboard#global"
sk: "top100"
data: { players: [...] }  // Cached, updated every few seconds
```

### Actualizaciones de puntuación

Cuando cambia la puntuación de un jugador, actualizamos primero el registro del jugador y luego ajustamos los conteos de buckets si la puntuación pasó a un nuevo rango:
```csharp
public async Task UpdateScore(string playerId, int newScore)
{
    // Get current score
    var current = await _db.GetItemAsync($"player#{playerId}", "score");
    var oldScore = current.Value?.GetAttribute<int>("score") ?? 0;

    // Update player's score
    await _db.PutItemAsync($"player#{playerId}", "score", new Dictionary<string, object>
    {
        ["score"] = newScore,
        ["updated"] = DateTime.UtcNow
    });

    // Update bucket counts (decrement old, increment new)
    var oldBucket = GetBucket(oldScore);
    var newBucket = GetBucket(newScore);

    if (oldBucket != newBucket)
    {
        await _db.TransactWriteAsync(new[]
        {
            new TransactWriteItem
            {
                Action = TransactAction.Update,
                PartitionKey = "leaderboard#global",
                SortKey = $"bucket#{oldBucket}",
                UpdateExpression = "SET #count = #count - 1"
            },
            new TransactWriteItem
            {
                Action = TransactAction.Update,
                PartitionKey = "leaderboard#global",
                SortKey = $"bucket#{newBucket}",
                UpdateExpression = "SET #count = if_not_exists(#count, 0) + 1"
            }
        });
    }
}

private int GetBucket(int score) => (score / 1000) * 1000;
```

### Obtener el ranking del jugador

Para encontrar el ranking de un jugador, suma todos los buckets con puntuaciones más altas:
```csharp
public async Task<int> GetPlayerRank(string playerId)
{
    var scoreResult = await _db.GetItemAsync($"player#{playerId}", "score");
    var playerScore = scoreResult.Value.GetAttribute<int>("score");
    var playerBucket = GetBucket(playerScore);

    var buckets = await _db.QueryAsync(new QueryFilter
    {
        PartitionKey = "leaderboard#global",
        SortKeyCondition = SortKeyCondition.GreaterThan($"bucket#{playerBucket}")
    });

    var higherPlayers = buckets.Value.Items.Sum(b => b.GetAttribute<int>("count"));
    return higherPlayers + 1;
}
```

Esto requiere como mucho unas 100 lecturas de buckets en lugar de millones de lecturas de jugadores.

### Top 100 global

Para el top 100 global, ejecuta un job en segundo plano cada 5 segundos:
```csharp
public async Task RefreshTop100()
{
    var topPlayers = new List<PlayerScore>();
    var bucket = await GetHighestBucket();

    while (topPlayers.Count < 100 && bucket >= 0)
    {
        var players = await GetPlayersInBucket(bucket, 100 - topPlayers.Count);
        topPlayers.AddRange(players);
        bucket -= 1000;
    }

    await _db.PutItemAsync("leaderboard#global", "top100", new Dictionary<string, object>
    {
        ["players"] = topPlayers,
        ["updated"] = DateTime.UtcNow
    });
}
```

Leer el top 100 ahora es una sola lectura rápida.

Por qué importa: un buen diseño de leaderboard hace más trabajo en el momento de escritura para que las lecturas se mantengan predecibles. Ese intercambio suele valer la pena, porque los jugadores leen rankings mucho más de lo que inspeccionan la mecánica exacta detrás de ellos.

## Los resultados

Probé esto con [k6](https://k6.io/) simulando 10.000 actualizaciones de puntuación por segundo:

| Metric | Target | Actual |
|--------|--------|--------|
| Score update latency (p99) | &lt;100ms | 23ms |
| Top 100 query latency | &lt;50ms | 8ms |
| Rank query latency | &lt;100ms | 45ms |
| Throughput | 10,000/s | 12,400/s |

Nada mal para un proyecto paralelo.

## Idea clave

Los leaderboards no consisten solo en almacenar puntuaciones. Consisten en precalcular las consultas que vas a necesitar responder. Las transacciones rápidas de TerraScale hacen que esos precálculos sean viables.

Si construyes tu propia versión, también te recomiendo leer la [guía de transacciones](/blog/transactions-deep-dive/) y la [guía de consultas](/guides/querying/).

¡Feliz gaming!
