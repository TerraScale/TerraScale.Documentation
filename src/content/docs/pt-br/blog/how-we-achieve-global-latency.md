---
title: Como o TerraScale alcança latência abaixo de 10ms em 19 regiões
date: 2024-06-15
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - architecture
  - deep-dive
  - performance
excerpt: Um olhar honesto sobre a arquitetura do TerraScale, o que funciona, o que é difícil e como alcançamos baixa latência globalmente.
cover:
  wide: /images/blog/how-we-achieve-global-latency/cover-wide.svg
  square: /images/blog/how-we-achieve-global-latency/cover-square.svg
  alt: Um globo abstrato e esparso com algumas rotas brilhantes de baixa latência conectando regiões distantes.
---

"Como o TerraScale é rápido em todo lugar?"

Recebo muito essa pergunta. A resposta honesta é simples: não é mágica, mas é deliberado. Cada decisão de arquitetura que tomamos otimiza latência. Veja como funciona.

## O que você vai aprender

- Como as requisições atravessam o TerraScale, do edge ao storage
- Por que escolhas de replication e consistency afetam tanto a latência
- Quais pequenas decisões de engenharia se somam aos maiores ganhos

Se você quiser combinar isso com a documentação do produto, a [referência de replication](/reference/replication/), a [referência de regiões](/reference/regions/) e a [visão geral da API](/reference/api/) são ótimos complementos.

## A arquitetura básica

O TerraScale roda em 19 regiões globais. Cada região tem:

- **Nós de edge** - Fazem terminação TLS e roteamento de requisições
- **Coordenadores de query** - Interpretam queries e planejam a execução
- **Nós de storage** - De fato armazenam e recuperam dados
- **Camada de replication** - Sincroniza dados entre regiões

Quando você cria um banco de dados, escolhe uma região primária. É lá que seus dados vivem de forma autoritativa. Mas aqui está o ponto principal: leituras podem ser atendidas de qualquer região onde você tiver habilitado replication.

## Por que nós de edge importam

Toda requisição ao TerraScale atinge primeiro um nó de edge. Temos nós de edge em mais de 40 cidades, incluindo lugares que não são regiões completas.

O nó de edge cuida de:

1. **Terminação TLS** - O handshake criptográfico caro acontece perto do usuário
2. **Validação da requisição** - Requisições malformadas são rejeitadas imediatamente
3. **Rate limiting** - Tráfego abusivo é bloqueado no edge
4. **Roteamento** - Determina qual região deve lidar com esta requisição

Isso normalmente adiciona de 1 a 3ms a uma requisição, mas economiza muito mais. Um handshake TLS com um servidor distante pode levar 100ms ou mais. Fazê-lo no edge acelera todo o resto.

## O caminho da query

Vamos seguir uma requisição simples de leitura:
```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage → Response
```

Total: ~8ms

Agora vamos seguir uma escrita:
```
User in Tokyo → Edge (Tokyo) → Coordinator (ap-northeast-1) → Storage (write locally)
                                                            → Async replication to other regions
```

Total: ~12ms para a escrita, mais replication em background

O insight principal é que nunca fazemos o usuário esperar por operações entre regiões. Escritas são confirmadas assim que ficam duráveis na região primária. A replication acontece de forma assíncrona.

## Trade-offs de consistency

Essa replication assíncrona significa que o TerraScale oferece eventual consistency para leituras entre regiões. Se você escrever em Tokyo e ler imediatamente em Frankfurt, talvez obtenha dados defasados.

Para a maioria das aplicações, isso é aceitável. Perfis de usuário, catálogos de produtos, dados de sessão, algumas centenas de milissegundos de atraso não fazem diferença.

Mas às vezes você precisa de strong consistency:
```csharp
var result = await client.GetItemAsync("user#123", "profile", new ReadOptions
{
    ConsistentRead = true
});
```

Com `ConsistentRead = true`, roteamos a leitura para a região primária, mesmo que exista uma réplica mais próxima. Você paga o custo de latência, mas recebe os dados mais frescos.

Por que isso importa: baixa latência nunca é grátis. Toda vez que você aperta consistency ou aumenta coordenação, normalmente devolve um pouco de latência. Bons sistemas deixam você escolher a troca, em vez de impor uma única resposta para toda requisição.

## O que torna o storage rápido

Nossa camada de storage é onde a maior parte dos ganhos reais acontece:

### SSDs em todo lugar

Todos os dados vivem em SSDs NVMe. A latência de leitura aleatória de um NVMe é de cerca de 0,1ms. Para um disco giratório, é de 5 a 10ms. Essa diferença se acumula.

### Localidade dos dados

Itens com a mesma partition key são armazenados juntos em disco. Quando você consulta "todos os pedidos de user#123", estamos fazendo leituras sequenciais, não buscas aleatórias.

### Índices em memória

Cada nó de storage mantém um índice em memória de partition key → localização em disco. Descobrir onde os dados vivem é uma busca em tabela hash (~0,001ms), não uma operação de disco.

### Connection pooling

Mantemos conexões persistentes entre todos os componentes. Nada de handshakes TCP no hot path. Isso economiza cerca de 2ms por requisição.

## Os números

Aqui está o que medimos em produção em todas as regiões:

| Percentile | Read Latency | Write Latency |
|------------|--------------|---------------|
| p50 | 4ms | 7ms |
| p90 | 8ms | 15ms |
| p99 | 18ms | 35ms |
| p99.9 | 45ms | 80ms |

Esses números são medidos a partir do edge, então incluem o tempo de rede do usuário até nosso nó de edge.

## Resumo

Não existe um único truque para baixa latência. É o efeito composto de dezenas de decisões:

- Nós de edge próximos dos usuários
- Replication assíncrona para que escritas não bloqueiem em consenso
- Storage NVMe com localidade de dados
- Índices em memória
- Connection pooling
- Protocolo de replication eficiente

Cada uma economiza alguns milissegundos. Juntas, elas se somam a um banco de dados rápido nos lugares onde seus usuários realmente percebem.
