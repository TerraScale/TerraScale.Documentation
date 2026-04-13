---
title: "10 dicas para otimizar seus custos no TerraScale"
date: 2024-08-05
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - optimization
  - cost
  - tips
excerpt: O preço do TerraScale é simples, mas isso não significa que você não possa otimizar. Aqui estão 10 dicas práticas para tirar mais valor do seu banco de dados.
cover:
  wide: /images/blog/cost-optimization-tips/cover-wide.svg
  square: /images/blog/cost-optimization-tips/cover-square.svg
  alt: Camadas comprimidas e faixas reduzidas equilibradas ao redor de um núcleo, representando otimização de custos do banco de dados.
---

O preço do TerraScale é direto: você paga por armazenamento e operações. Mas isso não significa que você não possa otimizar. Aqui estão 10 dicas que compartilho com desenvolvedores para ajudá-los a extrair o máximo valor.

## O que você vai aprender

- Quais padrões comuns de consulta custam mais do que deveriam
- Como decisões de modelagem de dados afetam tanto performance quanto gasto
- Onde olhar no dashboard quando os custos começam a subir aos poucos

Se você quiser comparar este conselho com a documentação do produto, deixe abertas a [referência de preços](/reference/pricing/), a [referência de billing](/reference/billing/) e o [guia de boas práticas](/reference/best-practices/).

## 1. Use queries, não scans

Esta é a principal. Uma query usa a partition key para encontrar dados diretamente. Um scan lê todos os itens do seu banco de dados.
```csharp
// Good: Query by partition key
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "customer#123"
});

// Expensive: Scan everything
var allOrders = await client.ScanAsync(new ScanOptions());
```

Se você faz scan regularmente, reprojete seu modelo de dados. A maioria dos problemas de custo começa como problema de modelagem.

## 2. Use projection

Busque apenas os atributos de que você precisa:
```csharp
// Fetches entire item (maybe 5KB)
var user = await client.GetItemAsync("user#123", "profile");

// Fetches only name and email (maybe 100 bytes)
var user = await client.GetItemAsync("user#123", "profile", new GetOptions
{
    ProjectionAttributes = new[] { "name", "email" }
});
```

Menos dados transferidos significam custos menores e, normalmente, respostas mais rápidas também.

## 3. Faça operações em batch

Requisições individuais têm overhead. Operações em batch são mais eficientes:
```csharp
// Slow and expensive: 100 individual requests
foreach (var key in keys)
{
    await client.GetItemAsync(key.Pk, key.Sk);
}

// Fast and cheap: 1 batch request
var items = await client.BatchGetAsync(keys);
```

BatchGet suporta até 100 itens. BatchWrite suporta até 25. A [referência de operações em batch](/reference/api/batch-operations/) tem os limites exatos e o comportamento.

## 4. Não armazene logs no TerraScale

O TerraScale é otimizado para dados operacionais, coisas que você consulta com frequência e com exigência de baixa latência. Logs são append-only, raramente consultados e normalmente não precisam de tempos de resposta abaixo de 10ms.

Use um serviço dedicado de logs no lugar. Você vai economizar dinheiro e ainda ganhar recursos melhores para logs.

## 5. Comprima atributos grandes

Se você estiver armazenando grandes blobs JSON ou texto, considere compressão:
```csharp
var compressed = Compress(largeJsonString);
await client.PutItemAsync("doc#123", "content", new Dictionary<string, object>
{
    ["data"] = Convert.ToBase64String(compressed),
    ["compressed"] = true
});
```

Taxas típicas de compressão de 3x a 4x podem significar uma economia relevante de armazenamento.

## 6. Defina TTL para dados temporários

Se os dados têm uma expiração natural, use TTL em vez de limpeza manual:
```csharp
await client.PutItemAsync("session#abc", "data", new Dictionary<string, object>
{
    ["userId"] = "user#123",
    ["ttl"] = DateTimeOffset.UtcNow.AddHours(24).ToUnixTimeSeconds()
});
```

Itens expirados são apagados automaticamente sem custo. TTL é uma das vitórias mais fáceis para dados de sessão, tokens temporários e caches de curta duração.

## 7. Use o tamanho certo de item

O TerraScale cobra por operação, não por byte (para leituras e escritas). Mas existe um limite de 400KB por item, e itens maiores são mais lentos.

Se você tem itens acima de 100KB, considere:
- Dividir em múltiplos itens
- Armazenar conteúdo grande em blob storage com uma referência no TerraScale
- Comprimir os dados

## 8. Consolide itens pequenos

O outro lado da moeda é que, se você tem muitos itens minúsculos que sempre lê juntos, considere combiná-los:
```csharp
// 10 individual items = 10 read operations
await client.GetItemAsync("user#123", "setting#theme");
await client.GetItemAsync("user#123", "setting#language");
// ... 8 more

// 1 combined item = 1 read operation
await client.GetItemAsync("user#123", "settings");
```

## 9. Use staging com inteligência

Seu ambiente de staging não precisa de uma cópia completa dos dados de produção. Um subconjunto representativo funciona bem para testes e economiza custos de armazenamento.

## 10. Monitore seu uso

O dashboard mostra exatamente de onde vêm seus custos:

- Armazenamento por tabela
- Operações de leitura e escrita por tabela
- Consultas mais caras

Verifique isso mensalmente. Muitas vezes você vai encontrar ganhos rápidos.

Por que isso importa: a configuração de banco de dados mais barata nem sempre é a melhor. O objetivo real é gastar com as leituras e escritas que fazem seu produto avançar, e evitar pagar por trabalho acidental.

## A filosofia

O preço do TerraScale foi pensado para ser previsível. Você paga pelo que usa, e sempre consegue ver o que está usando.

O objetivo não é minimizar sua fatura a qualquer custo. É garantir que você esteja recebendo valor pelo que gasta. Uma fatura de banco de dados que sustenta um negócio saudável é uma boa troca.

Concentre-se em construir ótimo software. Otimize custos quando eles se tornarem relevantes. E se você ficar em dúvida sobre a melhor abordagem, fale comigo em mariogk@terrascale.tech.
