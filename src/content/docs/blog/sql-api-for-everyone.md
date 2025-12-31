---
title: "The SQL API: Because Sometimes You Just Want SELECT *"
date: 2024-07-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - sql
  - tutorial
  - api
excerpt: Not everyone wants to learn a new query language. That's why we built the SQL API. It's SQL. It works. Here's how to use it.
---

I'll be honest: I love TerraScale's native API. It's powerful, it's fast, and once you understand partition keys, it makes perfect sense.

But not everyone wants to learn a new query paradigm. Sometimes you just want to write SQL.

That's why we built the SQL API.

## The SQL API

TerraScale has a full SQL interface. It's not an afterthought or a compatibility layer. It's a first-class way to interact with your data.

```sql
SELECT * FROM users WHERE id = 'user_123'
```

That's it. That query works.

## How to Use It

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

### Via Dashboard

The Query Explorer in the dashboard has a SQL mode. Just flip the toggle and start writing queries.

## What SQL Looks Like in TerraScale

TerraScale tables are a bit different from relational tables. Here's how they map:

| SQL Concept | TerraScale Concept |
|-------------|-------------------|
| Table | Database (or Repository) |
| Primary Key | Partition Key + Sort Key |
| Column | Attribute |
| Row | Item |

When you write SQL, think of the partition key as part of the WHERE clause:

```sql
-- This is efficient (uses partition key)
SELECT * FROM orders
WHERE customer_id = 'cust_123'
  AND order_date > '2024-01-01'

-- This is less efficient (scans all partitions)
SELECT * FROM orders
WHERE total > 100
```

The query optimizer is smart, but it can't work miracles. If you're not filtering by partition key, you're doing a scan.

## Supported Operations

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

## What's NOT Supported

Let's be upfront about the limitations:

| Feature | Status |
|---------|--------|
| JOIN | Not supported |
| Subqueries | Not supported |
| GROUP BY | Not supported |
| HAVING | Not supported |
| Aggregate functions | COUNT only |
| UNION | Not supported |

TerraScale is a NoSQL database with a SQL interface, not a relational database. If your query needs JOINs, you probably want to denormalize your data or use multiple queries.

## When to Use SQL vs Native API

**Use SQL when:**
- You're prototyping or exploring data
- You know SQL but not TerraScale yet
- The queries are simple CRUD operations
- You're migrating from a relational database

**Use the native API when:**
- You need maximum performance
- You're doing complex conditional writes
- You need transactions
- You want full type safety with the SDK

Both interfaces hit the same data. You can mix and match freely.

## Try It Yourself

Head to the [dashboard](https://dashboard.terrascale.io), create a database, and open the Query Explorer. Write some SQL. It just works.

Questions? Reach out at mariogk@terrascale.tech.
