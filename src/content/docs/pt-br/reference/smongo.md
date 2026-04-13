---
title: Linguagem simples de consulta Mongo
description: Esta é uma linguagem semelhante à linguagem de consulta do mongodb
---

## Visão geral

SMongo é a interface de consulta compatível com MongoDB da TerraScale. Ela dá às equipes uma forma familiar, no estilo documento, de consultar e modificar dados sem mudar o modelo mental.

Se você já conhece a sintaxe de consultas do MongoDB, SMongo deve parecer acessível desde o início.

## Quando usar SMongo

SMongo é uma boa escolha quando:

- você vem do MongoDB
- prefere consultas no estilo documento em vez de sintaxe SQL
- sua equipe já está familiarizada com filtros e operadores do MongoDB

Se você preferir trabalhar com instruções parecidas com SQL, veja [SSSQL](/reference/sssql/).

## Operações suportadas

### find

Use `find` para consultar documentos que correspondem a um filtro.

```json
{
  "collection": "users",
  "operation": "find",
  "filter": {
    "plan": { "$eq": "pro" },
    "age": { "$gte": 18 }
  }
}
```

### findOne

Use `findOne` quando esperar um único documento correspondente.

```json
{
  "collection": "users",
  "operation": "findOne",
  "filter": {
    "email": { "$eq": "jane@example.com" }
  }
}
```

### insert / insertOne

Use `insertOne` para adicionar um único documento, ou `insert` quando estiver trabalhando com vários documentos em uma única requisição.

```json
{
  "collection": "orders",
  "operation": "insertOne",
  "document": {
    "id": "order_123",
    "status": "pending",
    "total": 42.5
  }
}
```

### update / updateOne

Use `updateOne` para uma mudança direcionada, ou `update` quando mais de um documento correspondente puder ser atualizado.

```json
{
  "collection": "profiles",
  "operation": "updateOne",
  "filter": {
    "id": { "$eq": "user_123" }
  },
  "update": {
    "displayName": "Jane",
    "visibility": "public"
  }
}
```

### delete / deleteOne

Use `deleteOne` para remover um único documento correspondente, ou `delete` para operações de limpeza mais amplas.

```json
{
  "collection": "sessions",
  "operation": "deleteOne",
  "filter": {
    "id": { "$eq": "session_abc" }
  }
}
```

## Operadores de consulta suportados

SMongo oferece um subconjunto prático dos operadores mais comuns no estilo MongoDB.

### Operadores de comparação

- `$eq`
- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$ne`

### Operadores lógicos

- `$and`
- `$or`
- `$not`

## Limitações

SMongo é intencionalmente focado. Tenha estas restrições em mente:

- sem suporte a aggregation pipeline
- sem `$lookup` ou consultas no estilo join
- máximo de 100 resultados por resposta de consulta
- use paginação quando precisar ler além da primeira página

Para fluxos analíticos ou relacionais mais complexos, [SSSQL](/reference/sssql/) pode ser uma escolha melhor.

## Exemplos

### Encontrar usuários ativos em plano pago

```json
{
  "collection": "users",
  "operation": "find",
  "filter": {
    "$and": [
      { "status": { "$eq": "active" } },
      { "plan": { "$ne": "free" } }
    ]
  }
}
```

### Encontrar pedidos recentes acima de um limite

```json
{
  "collection": "orders",
  "operation": "find",
  "filter": {
    "total": { "$gte": 100 },
    "createdAt": { "$gte": "2026-01-01T00:00:00Z" }
  }
}
```

### Atualizar o tier de assinatura de um usuário

```json
{
  "collection": "subscriptions",
  "operation": "updateOne",
  "filter": {
    "userId": { "$eq": "user_123" }
  },
  "update": {
    "tier": "team",
    "renewsAt": "2026-05-01T00:00:00Z"
  }
}
```

### Excluir sessões expiradas

```json
{
  "collection": "sessions",
  "operation": "delete",
  "filter": {
    "expiresAt": { "$lt": "2026-04-01T00:00:00Z" }
  }
}
```

## Veja também

- [SSSQL](/reference/sssql/)
- [Querying](/guides/querying/)
- [Best Practices](/reference/best-practices/)
- [Rate Limits](/reference/rate-limits/)

