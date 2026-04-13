---
title: Super Simple SQL
description: Referência para o subconjunto mínimo de SQL da TerraScale para operações CRUD comuns.
---

Super Simple SQL, ou SSSQL, é uma referência resumida das instruções mais comuns da API SQL que a maioria das equipes usa primeiro. Ela foi pensada para consultas simples, depuração e migração mais fácil para equipes que já pensam em SQL.

## Visão geral

SSSQL é intencionalmente limitado. Esta página foca na parte comum de CRUD da API SQL da TerraScale.

Para instruções de schema como `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` e gerenciamento de índices, veja [SQL API Reference](/reference/api/sql-api/).

Use quando quiser sintaxe familiar para:

- ler registros
- inserir documentos
- atualizar documentos
- excluir documentos

## Operações suportadas

### SELECT

```sql
SELECT * FROM users WHERE name = 'test' AND age >= 29 ORDER BY age DESC LIMIT 10
```

### INSERT

```sql
INSERT INTO users (id, name, age)
VALUES ('user_1', 'test', 29)
```

### UPDATE

```sql
UPDATE users
SET name = 'updated test', age = 30
WHERE id = 'user_1'
```

### DELETE

```sql
DELETE FROM users WHERE id = 'user_1'
```

## Cláusulas suportadas

### WHERE

Use `WHERE` para filtrar registros em operações `SELECT`, `UPDATE` e `DELETE`.

```sql
SELECT * FROM users WHERE status = 'active'
```

### ORDER BY

Use `ORDER BY` para ordenar resultados de consulta.

```sql
SELECT * FROM users WHERE age >= 18 ORDER BY createdAt DESC
```

### LIMIT

Use `LIMIT` para limitar o número de registros retornados.

```sql
SELECT * FROM users ORDER BY createdAt DESC LIMIT 20
```

## Recursos não suportados

SSSQL não tenta ser SQL completo. Recursos fora do subconjunto suportado não estão disponíveis nesta referência resumida.

Recursos comuns não suportados incluem:

- joins
- subqueries
- `GROUP BY`
- cursores
- expressões complexas em `SELECT`
- stored procedures

Para DDL e a superfície SQL suportada completa, use [SQL API Reference](/reference/api/sql-api/).

## Dicas de performance

### Filtre em campos indexados

Consultas geralmente são mais rápidas quando a cláusula `WHERE` aponta para campos indexados.

### Mantenha atualizações direcionadas

Atualize apenas os registros que você realmente quer alterar. Filtros amplos aumentam o trabalho e tornam erros mais difíceis de recuperar.

### Use LIMIT para consultas exploratórias

Ao depurar, comece com um `LIMIT` pequeno para inspecionar resultados sem varrer mais dados do que o necessário.

### Use parâmetros para valores não confiáveis

Não monte strings SQL diretamente a partir de entrada do usuário. Ao chamar a API SQL, passe valores não confiáveis por parâmetros nomeados.

```json
{
  "sql": "SELECT * FROM users WHERE id = ?",
  "parameters": {
    "id": "user_1"
  },
  "limit": 1,
  "pageToken": null
}
```

## Exemplos

### Buscar usuários ativos recentes

```sql
SELECT * FROM users WHERE status = 'active' ORDER BY createdAt DESC LIMIT 5
```

### Inserir um novo pedido

```sql
INSERT INTO orders (id, status, total)
VALUES ('order_1', 'pending', 42.5)
```

### Atualizar um documento de perfil

```sql
UPDATE profiles
SET displayName = 'mario', visibility = 'public'
WHERE id = 'profile_1'
```

### Excluir um token temporário

```sql
DELETE FROM tokens WHERE id = 'token_1'
```

## Relacionado

- [SMongo](/reference/smongo/)
- [API](/reference/api/)
- [SQL API Reference](/reference/api/sql-api/)
- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)

