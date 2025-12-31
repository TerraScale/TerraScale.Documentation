---
title: Building a Real-Time Gaming Leaderboard with TerraScale
date: 2024-05-28
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - tutorial
  - gaming
  - real-time
excerpt: Let's build a leaderboard that handles 10,000 score updates per second. The whole thing is about 200 lines of code. Here's how.
---

I challenged myself to build a real-time gaming leaderboard. Not a toy demo - something that could actually handle a popular mobile game. The goal: 10,000 score updates per second with leaderboard queries returning in under 50ms.

Spoiler: I did it in about 200 lines of code. Here's the whole journey.

## The Requirements

A gaming leaderboard needs to support:

1. **Score updates** - Players submit scores constantly
2. **Global top 100** - Show the best players worldwide
3. **Player rank** - "You are #4,847 out of 1.2 million players"
4. **Friend leaderboard** - How do I compare to my friends?
5. **Time-based boards** - Daily, weekly, all-time

The tricky part is that these requirements conflict. Score updates need to be fast (write-optimized). Leaderboards need to be sorted (read-optimized). You can't optimize for both with a naive approach.

## The Naive Approach (Don't Do This)

My first instinct was:

```
pk: "leaderboard#global"
sk: "{score}#{player_id}"
```

This keeps scores sorted! Easy, right?

Wrong. Every time a player's score changes, I need to delete the old entry and insert a new one. With millions of players and thousands of updates per second, this creates massive contention on a single partition.

Also, getting a player's rank requires counting all entries with higher scores. For player #500,000, that's 500,000 items to count. No thanks.

## The Actual Approach

After some research, I landed on a bucketed approach:

### Data Model

```
// Player's current score
pk: "player#{player_id}"
sk: "score"
data: { score: 15420, updated: "2024-05-28T..." }

// Score buckets (for ranking)
pk: "bucket#15000"  // Bucket for scores 15000-15999
sk: "count"
data: { count: 4827 }  // 4827 players have scores in this range

// Top 100 cache
pk: "leaderboard#global"
sk: "top100"
data: { players: [...] }  // Cached, updated every few seconds
```

### Score Updates

When a player's score changes:

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
                PartitionKey = $"bucket#{oldBucket}",
                SortKey = "count",
                UpdateExpression = "SET #count = #count - 1"
            },
            new TransactWriteItem
            {
                Action = TransactAction.Update,
                PartitionKey = $"bucket#{newBucket}",
                SortKey = "count",
                UpdateExpression = "SET #count = if_not_exists(#count, 0) + 1"
            }
        });
    }
}

private int GetBucket(int score) => (score / 1000) * 1000;
```

### Getting Player Rank

To find a player's rank, sum up all bucket counts for higher scores:

```csharp
public async Task<int> GetPlayerRank(string playerId)
{
    var scoreResult = await _db.GetItemAsync($"player#{playerId}", "score");
    var playerScore = scoreResult.Value.GetAttribute<int>("score");
    var playerBucket = GetBucket(playerScore);

    var buckets = await _db.QueryAsync(new QueryFilter
    {
        PartitionKey = "buckets",
        SortKeyCondition = SortKeyCondition.GreaterThan($"{playerBucket}")
    });

    var higherPlayers = buckets.Value.Items.Sum(b => b.GetAttribute<int>("count"));
    return higherPlayers + 1;
}
```

This requires at most ~100 bucket reads instead of millions of player reads.

### Top 100 Leaderboard

For the global top 100, run a background job every 5 seconds:

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

Reading the top 100 is now a single fast read.

## The Results

I load tested this with [k6](https://k6.io/) simulating 10,000 score updates per second:

| Metric | Target | Actual |
|--------|--------|--------|
| Score update latency (p99) | <100ms | 23ms |
| Top 100 query latency | <50ms | 8ms |
| Rank query latency | <100ms | 45ms |
| Throughput | 10,000/s | 12,400/s |

Not bad for a side project.

## Key Insight

Leaderboards aren't just about storing scores. They're about pre-computing the queries you'll need to answer. TerraScale's fast transactions make those pre-computations practical.

Happy gaming!
