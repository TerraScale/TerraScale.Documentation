---
title: API
description: Informações sobre a api da TerraScale
order: 1000
---

## Visão geral

A TerraScale expõe uma API baseada em REST para operações de banco de dados, consultas e fluxos de gerenciamento. Requisições e respostas usam JSON, o que torna a API fácil de chamar a partir de serviços backend, scripts e ferramentas de migração.

Para a maior parte do acesso programático, você se autentica com uma API key e envia requisições HTTPS padrão.

## Base URL

Use o endpoint de API da TerraScale para todas as requisições programáticas. Na prática, esta é a API por trás do dashboard e dos SDKs.

- Dashboard: [https://dashboard.terrascale.io](https://dashboard.terrascale.io)
- API endpoint: `https://dashboard.terrascale.io/api`

Algumas áreas do produto e exemplos também podem referenciar `api.terrascale.io`. Use o endpoint documentado pelo SDK ou pela página de referência específica com a qual você estiver trabalhando.

## Autenticação

A maior parte das requisições da API exige uma API key.

Envie-a no cabeçalho `Authorization`:

```http
Authorization: Bearer ts_live_your_api_key
```

Crie e gerencie chaves nas configurações da sua conta e do dashboard. Para mais detalhes, veja:

- [Authentication](/reference/authentication/)
- [Account Registration](/account/registration/)
- [Profile](/account/profile/)
- [API Keys](/reference/management/api-keys/)

## Formato da requisição

Requisições da API da TerraScale usam corpos JSON para operações que enviam dados.

Cabeçalhos típicos:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer ts_live_your_api_key
```

Exemplo de corpo de requisição:

```json
{
  "pk": "user#123",
  "sk": "profile",
  "data": {
    "name": "Jane Doe",
    "plan": "pro"
  }
}
```

## Formato da resposta

As respostas são retornadas como JSON. Respostas bem-sucedidas normalmente incluem um envelope JSON consistente para o endpoint chamado, junto com o recurso solicitado, resultado da operação ou metadados relevantes.

Quando uma requisição falha, a TerraScale retorna uma resposta JSON de erro com o código de status HTTP e detalhes que ajudam a identificar o problema.

Exemplo de formato de erro:

```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "The provided API key is missing, invalid, or expired."
}
```

Veja [Error Handling](/reference/error-handling/) para orientações específicas por endpoint.

## Paginação

Endpoints no estilo listagem e consulta podem retornar resultados paginados. Quando um conjunto de resultados é maior do que uma única resposta, continue com o token de paginação ou cursor retornado por esse endpoint.

Paginação é especialmente importante para cargas de consulta de alto volume e conjuntos de resultados que se aproximam dos limites da plataforma.

## Rate Limits

A TerraScale aplica rate limits para proteger a estabilidade da plataforma e garantir uso justo entre os planos.

Veja a referência completa de [Rate Limits](/reference/rate-limits/) para limites de requisição, cotas e orientações de retry.

## Endpoints da API

A superfície da API está organizada em alguns grupos principais.

| Group | What it covers | Reference |
|-------|----------------|-----------|
| Health | Verificações de uptime e readiness probes | [Health](/reference/api/health/) |
| Database operations | Acesso a itens, repositórios, transações e operações em lote | [Item Operations](/reference/api/item-operations/), [Repositories](/reference/api/repositories/), [Transactions](/reference/api/transactions/), [Batch Operations](/reference/api/batch-operations/) |
| Query | Padrões de consulta e acesso no estilo SQL | [Query Operations](/reference/api/query-operations/), [SQL API](/reference/api/sql-api/) |
| Management | Bancos de dados, repositórios e gerenciamento de API keys | [Databases](/reference/management/databases/), [Repositories](/reference/management/repositories/), [API Keys](/reference/management/api-keys/) |

## Veja também

- [Authentication](/reference/authentication/)
- [Rate Limits](/reference/rate-limits/)
- [Error Handling](/reference/error-handling/)
- [Getting Started](/guides/getting-started/)
- [Querying](/guides/querying/)

