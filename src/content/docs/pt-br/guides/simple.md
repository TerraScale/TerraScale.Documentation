---
title: Guia de uso simples
description: Um guia de uso simples para o TerraScale
sidebar:
  order: 2
---

## Primeiros passos com o TerraScale

Este guia apresenta o básico para usar o TerraScale em apenas alguns minutos.

TerraScale é um banco de dados NoSQL distribuído globalmente, criado para leituras rápidas, documentos JSON flexíveis e fluxos de trabalho diretos para desenvolvedores. Se você quer ir rapidamente da configuração da conta ao primeiro item armazenado, comece aqui.

## O que você precisa

Antes de começar, verifique se você tem:

- Uma conta TerraScale
- Uma chave de API com acesso ao banco de dados
- Conhecimento básico de REST APIs ou do SDK de sua preferência

Se você pretende trabalhar diretamente com a API, mantenha por perto a [visão geral da API](/reference/api/) e o [guia de autenticação](/reference/authentication/).

## Etapa 1: Crie uma conta

Comece criando sua conta TerraScale:

1. Vá para [dashboard.terrascale.io](https://dashboard.terrascale.io)
2. Cadastre-se com seu endereço de email
3. Verifique seu email
4. Abra o dashboard e crie uma chave de API

Para acesso de aplicação, use uma chave de API em vez de um token de sessão do dashboard. Chaves de API são a escolha padrão para scripts, serviços e integrações baseadas em SDK.

## Etapa 2: Crie um banco de dados

Em seguida, crie um banco de dados para os dados do seu app.

Você pode fazer isso de duas formas:

- Pelo dashboard
- Pela Management API

Ao criar o banco de dados, escolha:

- Um nome claro para o banco
- A região mais próxima dos seus usuários ou cargas de trabalho

Exemplo de requisição para a Management API:

```bash
curl -X POST "https://api.terrascale.io/api/v1/management/databases" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-first-db",
    "region": "us-east-1"
  }'
```

Se você estiver usando a API, a criação do banco de dados usa a autenticação do dashboard. Consulte a [Database Management API](/reference/management/databases/) para o fluxo completo.

## Etapa 3: Armazene seu primeiro item

Quando seu banco de dados estiver pronto, armazene um documento JSON com a REST API.

Este exemplo grava um perfil de usuário no banco `my-first-db`:

```bash
curl -X PUT "https://api.terrascale.io/api/v1/databases/my-first-db/items" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "pk": "user#1001",
    "sk": "profile",
    "data": {
      "name": "Ava Chen",
      "email": "ava@example.com",
      "plan": "starter"
    }
  }'
```

Esta requisição usa:

- `pk` como partition key
- `sk` como sort key
- `data` para o documento JSON que você quer armazenar

Para mais exemplos, consulte [Item Operations](/reference/api/item-operations/).

## Etapa 4: Leia seus dados

Depois de gravar um item, recupere-o com uma requisição GET simples:

```bash
curl "https://api.terrascale.io/api/v1/databases/my-first-db/items/user%231001/profile" \
  -H "Authorization: Bearer ts_live_your_api_key"
```

Você deve receber uma resposta JSON com o item armazenado, junto com metadados como `createdAt` e `updatedAt`.

## Etapa 5: Consulte seus dados

Quando você precisar de mais do que um único item, consulte pela partition key.

Exemplo de requisição de consulta:

```bash
curl -X POST "https://api.terrascale.io/api/v1/databases/my-first-db/items/query" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "partitionKey": "user#1001",
    "sortKeyCondition": "begins_with:profile",
    "limit": 10
  }'
```

O TerraScale também oferece opções de consulta de nível mais alto, incluindo:

- **SSSQL** para consultas no estilo SQL
- **SMongo** para uma experiência de consulta inspirada em Mongo

Se quiser se aprofundar, continue com o [guia de consultas](/guides/querying/) e a [referência de Query Operations](/reference/api/query-operations/).

## Próximos passos

- [Guia de consultas](/guides/querying/)
- [Guia do SDK C#](/guides/sdks/csharp/)
- [Referência da API](/reference/api/)
- [Boas práticas](/reference/best-practices/)
