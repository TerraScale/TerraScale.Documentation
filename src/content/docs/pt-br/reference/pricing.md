---
title: Pricing
description: Como a TerraScale contabiliza operações, replicação, consultas e storage para cobrança.
---

O pricing da TerraScale foi construído em torno de uso simples e fácil de entender. Tentamos manter o modelo de cobrança próximo do trabalho que o banco realmente está executando, evitando unidades de cobrança difíceis de explicar.

As APIs de billing e uso expõem métricas voltadas ao cliente, como requisições e storage. Os exemplos desta página explicam a quantidade relativa de trabalho do banco por trás dessas métricas, especialmente em cargas replicadas globalmente.

## Operações de banco de dados

Na TerraScale, gravações são mais caras para o sistema processar do que leituras, porque precisam ser replicadas e coordenadas entre regiões. Mesmo assim, a TerraScale mantém o relatório de uso voltado ao cliente mais simples do que o modelo interno de trabalho, para que os planos sejam mais fáceis de entender.

Isso significa que você pode raciocinar sobre o uso sem aprender uma linguagem de cobrança própria, enquanto ainda entende que algumas operações exigem mais da plataforma do que outras.

## Custos de replicação global

Replicação global é um dos recursos centrais da TerraScale. A replicação afeta o pricing porque uma gravação precisa ser aplicada em cada região configurada.

### Como as gravações são contabilizadas

Se o seu banco replica para 10 regiões, uma única gravação pode ser entendida como trabalho executado 10 vezes, uma por região.

Por exemplo:

- 1 escrita de documento em 10 regiões: cerca de 10 operações de escrita de trabalho
- 1 atualização de documento em 10 regiões: cerca de 10 operações de escrita de trabalho

### Como as leituras são contabilizadas

Leituras são diferentes. Uma leitura normalmente é atendida pela região mais próxima, então uma única leitura de documento costuma contar como uma operação de trabalho.

É por isso que cargas globais com muitas gravações custam mais para operar do que cargas com muitas leituras.

## Custos de consulta

Consultas são mais difíceis de prever do que leituras e gravações simples, porque custo e latência dependem de a TerraScale conseguir usar um índice com eficiência.

Para clientes, a orientação importante é que consultas indexadas são mais baratas para a plataforma servir e geralmente mais rápidas na prática do que consultas pesadas em scan.

### Consultas indexadas

Consultas que usam operadores amigáveis a índices, como igualdade e comparações por intervalo, geralmente são rápidas e escalam bem.

Exemplos de operadores amigáveis a índices incluem:

- `$eq`
- `$gt`
- `$gte`
- `$lt`
- `$lte`

### Consultas pesadas em scan

Consultas que não conseguem usar um índice com eficiência, como buscas amplas com regex, podem exigir que o banco inspecione muitos documentos antes de retornar um resultado. Essas consultas são mais lentas e colocam mais carga no sistema.

### Exemplo de consulta

Esta consulta muitas vezes consegue usar um índice com eficiência:

```json
{
  "_id": {
    "$gt": 1
  }
}
```

Em contraste, uma condição que força scan amplo ou avaliação por documento pode custar mais em latência e trabalho do sistema, mesmo quando retorna um conjunto pequeno de resultados.

## Storage

O pricing de storage reflete o fato de que a TerraScale mantém múltiplas cópias dos seus dados em cada região para disponibilidade e segurança operacional.

Para cada região, a TerraScale mantém cópias redundantes para que upgrades e manutenção possam ser feitos sem tirar o banco do ar. Essa redundância faz parte do serviço que você está pagando e é uma das razões pelas quais storage não é cobrado da mesma forma que um único disco em um único servidor.

## Otimizando custos

Geralmente você consegue reduzir custo e melhorar performance com alguns hábitos simples.

### Prefira filtros indexados

Use filtros baseados em campos indexados sempre que possível. Consultas por igualdade e intervalo costumam ser muito mais eficientes do que regex ou condições negativas amplas.

### Mantenha conjuntos de resultado pequenos

Evite buscar mais dados do que precisa. A TerraScale limita respostas de consulta a 100 itens por requisição, e paginação é fortemente recomendada.

### Seja intencional com replicação

Replique para as regiões que sua aplicação realmente precisa. Mais regiões melhoram a cobertura geográfica, mas também multiplicam o trabalho de escrita.

### Revise padrões de consulta caros

Se uma consulta precisar varrer grandes partes de uma coleção, considere:

- adicionar ou ajustar índices
- mudar o padrão de acesso
- pré-computar views comuns
- estreitar o filtro antes de aplicar operadores caros

## Relacionado

- [Compensation Policy](/reference/compesation/)
- [Plans](/reference/plans/)
- [Replication](/reference/replication/)
- [Best Practices](/reference/best-practices/)

