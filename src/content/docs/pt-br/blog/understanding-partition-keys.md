---
title: "Partition keys e sort keys: um modelo mental que realmente faz sentido"
date: 2024-04-18
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - data-modeling
  - deep-dive
excerpt: Expliquei partition keys para muitos desenvolvedores. Aqui está a explicação que finalmente faz sentido para a maioria das pessoas.
cover:
  wide: /images/blog/understanding-partition-keys/cover-wide.svg
  square: /images/blog/understanding-partition-keys/cover-square.svg
  alt: Prateleiras e compartimentos organizados com um caminho de recuperação destacado, visualizando a lógica de partition e sort key.
---

Expliquei partition keys para muitos desenvolvedores ao longo dos anos. Alguns entendem imediatamente. A maioria não, e isso não é culpa deles, a maioria das explicações é terrível.

Aqui está o modelo mental que finalmente faz sentido para a maioria das pessoas.

## O que você vai aprender

- O que partition keys e sort keys realmente fazem
- Como identificar um design de chave que vai causar dor depois
- Quando recorrer a indexes ou denormalization em vez disso

Se você quiser uma referência mais curta junto com este post, deixe aberta em outra aba a [referência de modelos de dados](/reference/data-models/) e o [guia de boas práticas](/reference/best-practices/).

## Esqueça bancos de dados por um segundo

Imagine que você está organizando uma biblioteca. Não um banco de dados, uma biblioteca real com livros físicos.

Você tem milhares de livros e precisa organizá-los para que as pessoas encontrem o que querem rapidamente. Aqui vai uma abordagem:

**Partition = Estante**

Você coloca todos os livros do mesmo autor na mesma estante. Estante "Stephen King", estante "Agatha Christie" e assim por diante.

**Sort key = Posição na estante**

Dentro de cada estante, os livros são ordenados por data de publicação. "Carrie" vem antes de "The Shining" porque foi publicado antes.

Agora, quando alguém pede por "livros do Stephen King dos anos 1980", você:

1. Vai direto para a estante de Stephen King (partition key)
2. Examina apenas a seção dos anos 1980 (intervalo de sort key)

Você não precisa procurar na biblioteca inteira. Essa é a mágica.

## De volta aos bancos de dados

No TerraScale, uma partition key determina *onde* seus dados vivem. Itens com a mesma partition key são armazenados juntos, nos mesmos servidores físicos.

Uma sort key determina *como* os itens são organizados dentro dessa partição. Os itens são ordenados pela sort key, então consultas por intervalo são rápidas.

Aqui está um exemplo concreto:
```
Partition Key: "user#123"
├── Sort Key: "order#2024-001"  →  { total: 59.99, status: "shipped" }
├── Sort Key: "order#2024-002"  →  { total: 124.50, status: "pending" }
├── Sort Key: "order#2024-003"  →  { total: 89.00, status: "delivered" }
└── Sort Key: "profile"         →  { name: "Alice", email: "..." }
```

Quer pegar todos os pedidos de user#123? Uma query, uma ida e volta de rede:
```csharp
var orders = await client.QueryAsync(new QueryFilter
{
    PartitionKey = "user#123",
    SortKeyCondition = SortKeyCondition.BeginsWith("order#")
});
```

Isso retorna os três pedidos. É rápido porque o TerraScale sabe exatamente quais servidores consultar, aqueles que guardam a partição `user#123`.

Essa é a ideia central. Boas chaves reduzem a quantidade de trabalho que o banco de dados precisa fazer em cada requisição.

## O erro mais comum

É aqui que as pessoas erram: fazem sua partition key ampla demais ou estreita demais. Você quer um agrupamento que combine com a forma como seu app naturalmente lê e escreve dados.

**Ampla demais:**
```
Partition Key: "all_orders"
Sort Key: "order#12345"
```

Agora todo pedido do seu sistema está em uma única partição. Um conjunto de servidores lida com tudo. É um gargalo esperando para acontecer.

**Estreita demais:**
```
Partition Key: "order#12345"
Sort Key: null
```

Agora cada pedido é sua própria partição. Quer obter todos os pedidos de um usuário? Você precisa consultar cada pedido individualmente. Isso é lento e caro.

**Na medida certa:**
```
Partition Key: "user#123"
Sort Key: "order#2024-001"
```

Os pedidos são agrupados por usuário. Você consegue buscar todos os pedidos de um usuário de forma eficiente, e a carga fica distribuída entre muitas partições.

Por que isso importa: partition keys não são só uma preocupação de consulta. Elas também moldam como o tráfego se espalha pelo sistema. Um design saudável de chaves normalmente ajuda tanto a performance quanto o custo.

## Uma regra prática

Sua partition key deve responder à pergunta: "O que eu geralmente consulto junto?"

- App social? Particione por ID do usuário
- E-commerce? Particione por ID do cliente ou do produto
- IoT? Particione por ID do dispositivo
- SaaS multi-tenant? Particione por ID do tenant

Sua sort key deve responder: "Dentro desse grupo, como eu quero filtrar ou ordenar?"

- Dados de série temporal? Ordene por timestamp
- Dados hierárquicos? Ordene por caminho
- Itens ordenados? Ordene por número de sequência

## Quando esse modelo deixa de funcionar

Esse modelo mental cobre a maioria dos casos de uso. Mas às vezes você precisa consultar dados entre partições.

Exemplo: "Mostre todos os pedidos acima de $100 entre todos os usuários."

Com o design de particionar por usuário, essa query é cara. Você teria que fazer scan em todos os pedidos de todos os usuários.

Soluções:

1. **Secondary indexes** - Crie um índice com uma partition key diferente, como valor do pedido. A [referência de operações de query](/reference/api/query-operations/) cobre a mecânica.
2. **Denormalization** - Armazene dados em múltiplos formatos para que suas leituras comuns continuem baratas.
3. **Aceite o custo** - Às vezes um full scan é aceitável se for raro.

Vamos cobrir esses padrões em um post futuro. Por enquanto, saiba apenas que o design de partition key tem trade-offs, e tudo bem.

## Mais uma coisa

Você sempre pode mudar seu modelo de dados depois. Eu sei que isso parece assustador quando falamos de banco de dados, mas o TerraScale torna isso administrável:

1. Crie itens com a nova estrutura de chaves
2. Migre os dados existentes em batches
3. Atualize sua aplicação para usar as novas chaves
4. Apague os itens antigos quando estiver pronto

Não é grátis, mas também não precisa ser catastrófico. Então não pense demais no design inicial. Comece com algo razoável, meça como isso se comporta e itere.

É assim que sistemas reais são construídos.
