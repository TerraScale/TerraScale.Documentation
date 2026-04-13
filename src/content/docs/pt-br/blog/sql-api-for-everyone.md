---
title: "A API SQL: porque às vezes você só quer SELECT *"
date: 2024-07-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - sql
  - tutorial
  - api
excerpt: Nem todo mundo quer aprender uma nova linguagem de consulta. Foi por isso que construímos a API SQL. Veja como usá-la bem no TerraScale.
cover:
  wide: /images/blog/sql-api-for-everyone/cover-wide.svg
  square: /images/blog/sql-api-for-everyone/cover-square.svg
  alt: Planos de tabela arquitetônicos e linhas elegantes de consulta que sugerem acesso estruturado por SQL.
---

Vou ser honesto: eu adoro a API nativa do TerraScale. Ela é poderosa, rápida e, quando você entende partition keys, tudo faz muito sentido.

Mas nem todo mundo quer aprender um novo paradigma de consulta. Às vezes você só quer escrever SQL.

Foi por isso que construímos a API SQL.

## O que você vai aprender

- Como rodar consultas SQL pela API, SDK e dashboard
- Quais operações SQL o TerraScale suporta hoje
- Quando SQL é a melhor escolha, e quando a API nativa é uma opção melhor

Se você estiver decidindo entre interfaces, combine este post com o [guia de estratégia de API](/guides/api-strategy/) e a [referência da API SQL](/reference/api/sql-api/).

## A API SQL

O TerraScale tem uma interface SQL completa. Não é um detalhe de última hora nem uma camada de compatibilidade. É uma forma de primeira classe de interagir com seus dados.
```sql
SELECT * FROM users WHERE id = 'user_123'
```

É isso. Essa query funciona.

## Como usar

### Via API
```bash
curl -X POST "https://api.terrascale.io/databases/my-db/sql/query" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT name, email FROM users WHERE created_at > ?",
    "parameters": { "created_at": "2024-01-01" }
  }'
```

### Via SDK
```csharp
var result = await client.Sql.QueryAsync(
    "SELECT name, email FROM users WHERE created_at > @date",
    new { date = new DateTime(2024, 1, 1) }
);

foreach (var row in result.Value.Rows)
{
    Console.WriteLine($"{row["name"]}: {row["email"]}");
}
```

### Via dashboard

O Query Explorer no dashboard tem um modo SQL. Basta alternar a opção e começar a escrever queries.

## Como SQL se parece no TerraScale

As tabelas do TerraScale são um pouco diferentes das tabelas relacionais. Veja como elas se correspondem.

| SQL Concept | TerraScale Concept |
|-------------|-------------------|
| Table | Database (or Repository) |
| Primary Key | Partition Key + Sort Key |
| Column | Attribute |
| Row | Item |

Quando você escreve SQL, pense na partition key como parte da cláusula `WHERE`:
```sql
-- This is efficient (uses partition key)
SELECT * FROM orders
WHERE customer_id = 'cust_123'
  AND order_date > '2024-01-01'

-- This is less efficient (scans all partitions)
SELECT * FROM orders
WHERE total > 100
```

O otimizador de query é inteligente, mas não faz milagres. Se você não está filtrando por partition key, está fazendo um scan.

Por que isso importa: SQL pode fazer o TerraScale parecer familiar, mas o banco de dados por baixo continua sendo distribuído e particionado. Uma linguagem de consulta familiar não elimina a necessidade de um bom modelo de dados.

## Operações suportadas

### SELECT
```sql
SELECT * FROM products WHERE category = 'electronics'
SELECT name, price FROM products WHERE category = 'electronics'
SELECT * FROM orders WHERE customer_id = 'cust_123' ORDER BY order_date DESC
SELECT * FROM products LIMIT 10
SELECT COUNT(*) FROM orders WHERE customer_id = 'cust_123'
```

### INSERT
```sql
INSERT INTO users (id, name, email, created_at)
VALUES ('user_456', 'Mario', 'mariogk@terrascale.tech', NOW())
```

### UPDATE
```sql
UPDATE users
SET last_login = NOW(), login_count = login_count + 1
WHERE id = 'user_123'
```

### DELETE
```sql
DELETE FROM orders
WHERE customer_id = 'cust_123'
  AND order_id = 'order_789'
```

### CREATE TABLE
```sql
CREATE TABLE products (
    category TEXT,
    product_id TEXT,
    name TEXT,
    price DECIMAL,
    PRIMARY KEY (category, product_id)
)
```

## O que NÃO é suportado

Vamos ser diretos sobre as limitações:

| Feature | Status |
|---------|--------|
| JOIN | Not supported |
| Subqueries | Not supported |
| GROUP BY | Not supported |
| HAVING | Not supported |
| Aggregate functions | COUNT only |
| UNION | Not supported |

O TerraScale é um banco de dados NoSQL com interface SQL, não um banco de dados relacional. Se sua query precisa de JOINs, provavelmente você vai querer desnormalizar seus dados ou usar múltiplas queries. A [referência de modelos de dados](/reference/data-models/) é o melhor lugar para pensar nesses trade-offs.

## Quando usar SQL versus API nativa

**Use SQL quando:**
- Você está prototipando ou explorando dados
- Você conhece SQL, mas ainda não conhece o TerraScale
- As queries são operações CRUD simples
- Você está migrando de um banco relacional

**Use a API nativa quando:**
- Você precisa de performance máxima
- Está fazendo escritas condicionais complexas
- Você precisa de transações
- Você quer segurança total de tipos com o SDK

As duas interfaces acessam os mesmos dados. Você pode misturar as duas livremente. Muitas equipes usam SQL para exploração e a API nativa para hot paths.

## Experimente você mesmo

Vá para o [dashboard](https://dashboard.terrascale.io), crie um banco de dados e abra o Query Explorer. Escreva algum SQL e depois compare os resultados com o [guia de consultas](/guides/querying/) se quiser entender o que o TerraScale está fazendo por baixo dos panos.

Dúvidas? Fale comigo em mariogk@terrascale.tech.
