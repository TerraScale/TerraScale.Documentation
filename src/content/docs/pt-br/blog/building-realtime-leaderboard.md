---
title: Criando um leaderboard de jogos em tempo real com TerraScale
date: 2024-05-28
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - gaming
  - real-time
excerpt: Vamos criar um leaderboard que aguenta 10.000 atualizações de pontuação por segundo. Tudo fica em cerca de 200 linhas de código. Veja como isso se junta.
cover:
  wide: /images/blog/building-realtime-leaderboard/cover-wide.svg
  square: /images/blog/building-realtime-leaderboard/cover-square.svg
  alt: Pilares altos ranqueados com rastros de movimento disciplinados, sugerindo um leaderboard de jogos rápido em tempo real.
---

Eu me desafiei a criar um leaderboard de jogos em tempo real. Não uma demo de brinquedo, mas algo que realmente pudesse lidar com um jogo mobile popular. A meta: 10.000 atualizações de pontuação por segundo, com consultas ao leaderboard retornando em menos de 50ms.

Spoiler: eu fiz isso em cerca de 200 linhas de código. Aqui está a jornada completa.

## O que você vai aprender

- Por que o modelo óbvio de leaderboard desmorona em escala
- Como um design de pontuação por buckets mantém atualizações e buscas de ranking viáveis
- Quais partes você deve pré-computar em vez de recalcular sob demanda

Se você ainda é novo em modelagem no TerraScale, leia o [guia de partition key](/blog/understanding-partition-keys/) e a [referência de boas práticas](/reference/best-practices/) junto com este passo a passo.

## Os requisitos

Um leaderboard de jogos precisa suportar alguns padrões de acesso diferentes ao mesmo tempo:

1. **Atualizações de pontuação** - Jogadores enviam pontuações o tempo todo
2. **Top 100 global** - Mostrar os melhores jogadores do mundo
3. **Ranking do jogador** - "Você está em #4.847 entre 1,2 milhão de jogadores"
4. **Leaderboard de amigos** - Como eu me comparo aos meus amigos?
5. **Rankings por período** - Diário, semanal, histórico

A parte complicada é que esses requisitos entram em conflito. Atualizações de pontuação precisam ser rápidas e otimizadas para escrita. Leaderboards precisam ser ordenados e otimizados para leitura. Você não consegue otimizar os dois com uma abordagem ingênua.

## A abordagem ingênua (não faça isso)

Meu primeiro instinto foi este:
```
pk: "leaderboard#global"
sk: "{score}#{playerId}"
```

Isso mantém as pontuações ordenadas. Fácil, certo?

Errado. Toda vez que a pontuação de um jogador muda, eu preciso apagar a entrada antiga e inserir uma nova. Com milhões de jogadores e milhares de atualizações por segundo, isso cria contenção enorme em uma única partição.

Além disso, descobrir o ranking de um jogador exige contar todas as entradas com pontuações maiores. Para o jogador #500.000, isso significa contar 500.000 itens. Prefiro não.

## A abordagem real

Depois de alguma pesquisa, cheguei a uma abordagem com buckets.

### Modelo de dados
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

### Atualizações de pontuação

Quando a pontuação de um jogador muda, atualizamos primeiro o registro do jogador e depois ajustamos as contagens dos buckets se a pontuação foi para uma nova faixa:
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

### Obtendo o ranking do jogador

Para encontrar o ranking de um jogador, some todas as contagens de buckets com pontuações maiores:
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

Isso exige no máximo cerca de 100 leituras de bucket em vez de milhões de leituras de jogadores.

### Leaderboard Top 100

Para o top 100 global, execute um job em background a cada 5 segundos:
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

Ler o top 100 agora é uma única leitura rápida.

Por que isso importa: um bom design de leaderboard faz mais trabalho no momento da escrita para que as leituras permaneçam previsíveis. Essa troca geralmente vale a pena, porque os jogadores leem rankings com muito mais frequência do que investigam a mecânica exata por trás deles.

## Os resultados

Eu fiz teste de carga com [k6](https://k6.io/) simulando 10.000 atualizações de pontuação por segundo:

| Metric | Target | Actual |
|--------|--------|--------|
| Score update latency (p99) | &lt;100ms | 23ms |
| Top 100 query latency | &lt;50ms | 8ms |
| Rank query latency | &lt;100ms | 45ms |
| Throughput | 10,000/s | 12,400/s |

Nada mal para um projeto paralelo.

## Insight principal

Leaderboards não são só sobre armazenar pontuações. Eles são sobre pré-computar as consultas que você vai precisar responder. As transações rápidas do TerraScale tornam essas pré-computações práticas.

Se você criar sua própria versão, eu também recomendaria ler o [guia de transações](/blog/transactions-deep-dive/) e o [guia de consultas](/guides/querying/).

Bom jogo!
