---
title: Super Simple SQL
description: Reference for TerraScale's minimal SQL subset for common CRUD operations.
---

Super Simple SQL, or SSSQL, is a shorthand reference for the common SQL API statements most teams use first. It is intended for straightforward queries, debugging, and easier migration for teams that already think in SQL.

## Overview

SSSQL is intentionally limited. This page focuses on the common CRUD part of TerraScale's SQL API.

For schema statements such as `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE`, and index management, see the [SQL API Reference](/reference/api/sql-api/).

Use it when you want familiar syntax for:

- reading records
- inserting documents
- updating documents
- deleting documents

## Supported Operations

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

## Supported Clauses

### WHERE

Use `WHERE` to filter records for `SELECT`, `UPDATE`, and `DELETE` operations.

```sql
SELECT * FROM users WHERE status = 'active'
```

### ORDER BY

Use `ORDER BY` to sort query results.

```sql
SELECT * FROM users WHERE age >= 18 ORDER BY createdAt DESC
```

### LIMIT

Use `LIMIT` to cap the number of returned records.

```sql
SELECT * FROM users ORDER BY createdAt DESC LIMIT 20
```

## Unsupported Features

SSSQL does not try to be full SQL. Features outside the supported subset are not available in this shorthand reference.

Common unsupported features include:

- joins
- subqueries
- `GROUP BY`
- cursors
- complex expressions in `SELECT`
- stored procedures

For DDL and the complete supported SQL surface, use the [SQL API Reference](/reference/api/sql-api/).

## Performance Tips

### Filter on indexed fields

Queries are usually fastest when the `WHERE` clause targets indexed fields.

### Keep updates targeted

Update only the records you intend to change. Broad filters increase work and make mistakes harder to recover from.

### Use LIMIT for exploratory queries

When debugging, start with a small `LIMIT` so you can inspect results without scanning more data than necessary.

### Use parameters for untrusted values

Do not build SQL strings directly from user input. When you call the SQL API, pass untrusted values through named parameters.

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

## Examples

### Fetch recent active users

```sql
SELECT * FROM users WHERE status = 'active' ORDER BY createdAt DESC LIMIT 5
```

### Insert a new order

```sql
INSERT INTO orders (id, status, total)
VALUES ('order_1', 'pending', 42.5)
```

### Update a profile document

```sql
UPDATE profiles
SET displayName = 'mario', visibility = 'public'
WHERE id = 'profile_1'
```

### Delete a temporary token

```sql
DELETE FROM tokens WHERE id = 'token_1'
```

## Related

- [SMongo](/reference/smongo/)
- [API](/reference/api/)
- [SQL API Reference](/reference/api/sql-api/)
- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)
