---
title: "La API SQL: porque a veces solo quieres SELECT *"
date: 2024-07-20
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - sql
  - tutorial
  - api
excerpt: No todo el mundo quiere aprender un nuevo lenguaje de consulta. Por eso construimos la API SQL. Así puedes usarla bien en TerraScale.
cover:
  wide: /images/blog/sql-api-for-everyone/cover-wide.svg
  square: /images/blog/sql-api-for-everyone/cover-square.svg
  alt: Planos arquitectónicos de tablas y líneas elegantes de consulta que sugieren acceso estructurado mediante SQL.
---

Voy a ser honesto: me encanta la API nativa de TerraScale. Es potente, rápida y, una vez entiendes las partition keys, tiene todo el sentido del mundo.

Pero no todo el mundo quiere aprender un nuevo paradigma de consulta. A veces solo quieres escribir SQL.

Por eso construimos la API SQL.

## Lo que aprenderás

- Cómo ejecutar consultas SQL a través de la API, el SDK y el dashboard
- Qué operaciones SQL soporta TerraScale hoy
- Cuándo SQL es la opción adecuada y cuándo la API nativa es mejor

Si estás decidiendo entre interfaces, acompaña esta publicación con la [guía de estrategia de API](/guides/api-strategy/) y la [referencia de la API SQL](/reference/api/sql-api/).

## La API SQL

TerraScale tiene una interfaz SQL completa. No es una ocurrencia tardía ni una capa de compatibilidad. Es una forma de primera clase de interactuar con tus datos.
```sql
SELECT * FROM users WHERE id = 'user_123'
```

Eso es todo. Esa query funciona.

## Cómo usarla

### Vía API
```bash
curl -X POST "https://api.terrascale.io/databases/my-db/sql/query" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "SELECT name, email FROM users WHERE created_at > ?",
    "parameters": { "created_at": "2024-01-01" }
  }'
```

### Vía SDK
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

### Vía dashboard

El Query Explorer del dashboard tiene un modo SQL. Solo cambia el interruptor y empieza a escribir queries.

## Cómo se ve SQL en TerraScale

Las tablas de TerraScale son un poco distintas de las tablas relacionales. Así se corresponden.

| SQL Concept | TerraScale Concept |
|-------------|-------------------|
| Table | Database (or Repository) |
| Primary Key | Partition Key + Sort Key |
| Column | Attribute |
| Row | Item |

Cuando escribes SQL, piensa en la partition key como parte de la cláusula `WHERE`:
```sql
-- This is efficient (uses partition key)
SELECT * FROM orders
WHERE customer_id = 'cust_123'
  AND order_date > '2024-01-01'

-- This is less efficient (scans all partitions)
SELECT * FROM orders
WHERE total > 100
```

El optimizador de queries es inteligente, pero no hace milagros. Si no estás filtrando por partition key, estás haciendo un scan.

Por qué importa: SQL puede hacer que TerraScale se sienta familiar, pero la base de datos subyacente sigue siendo distribuida y particionada. Un lenguaje de consulta familiar no elimina la necesidad de un buen modelo de datos.

## Operaciones soportadas

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

## Lo que NO está soportado

Seamos claros con las limitaciones:

| Feature | Status |
|---------|--------|
| JOIN | Not supported |
| Subqueries | Not supported |
| GROUP BY | Not supported |
| HAVING | Not supported |
| Aggregate functions | COUNT only |
| UNION | Not supported |

TerraScale es una base de datos NoSQL con interfaz SQL, no una base de datos relacional. Si tu query necesita JOINs, probablemente querrás desnormalizar tus datos o usar varias queries. La [referencia de modelos de datos](/reference/data-models/) es el mejor lugar para pensar en esas compensaciones.

## Cuándo usar SQL frente a la API nativa

**Usa SQL cuando:**
- Estás prototipando o explorando datos
- Conoces SQL pero aún no TerraScale
- Las queries son operaciones CRUD simples
- Estás migrando desde una base de datos relacional

**Usa la API nativa cuando:**
- Necesitas el máximo rendimiento
- Estás haciendo escrituras condicionales complejas
- Necesitas transacciones
- Quieres seguridad total de tipos con el SDK

Ambas interfaces acceden a los mismos datos. Puedes mezclarlas libremente. Muchos equipos usan SQL para explorar y la API nativa para los hot paths.

## Pruébalo tú mismo

Ve al [dashboard](https://dashboard.terrascale.io), crea una base de datos y abre el Query Explorer. Escribe algo de SQL y luego compara los resultados con la [guía de consultas](/guides/querying/) si quieres entender qué está haciendo TerraScale por debajo.

¿Preguntas? Escríbeme a mariogk@terrascale.tech.
