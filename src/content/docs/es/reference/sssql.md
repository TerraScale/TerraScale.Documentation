---
title: Super Simple SQL
description: Referencia del subconjunto mínimo de SQL de TerraScale para operaciones CRUD comunes.
---

Super Simple SQL, o SSSQL, es una referencia resumida de las sentencias más comunes de la API SQL que la mayoría de los equipos usa primero. Está pensada para consultas directas, depuración y una migración más sencilla para equipos que ya piensan en SQL.

## Descripción general

SSSQL es intencionalmente limitado. Esta página se centra en la parte común de CRUD de la API SQL de TerraScale.

Para sentencias de esquema como `CREATE TABLE`, `ALTER TABLE`, `DROP TABLE` y gestión de índices, consulta [SQL API Reference](/reference/api/sql-api/).

Úsalo cuando quieras una sintaxis familiar para:

- leer registros
- insertar documentos
- actualizar documentos
- eliminar documentos

## Operaciones compatibles

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

## Cláusulas compatibles

### WHERE

Usa `WHERE` para filtrar registros en operaciones `SELECT`, `UPDATE` y `DELETE`.

```sql
SELECT * FROM users WHERE status = 'active'
```

### ORDER BY

Usa `ORDER BY` para ordenar resultados de consultas.

```sql
SELECT * FROM users WHERE age >= 18 ORDER BY createdAt DESC
```

### LIMIT

Usa `LIMIT` para limitar el número de registros devueltos.

```sql
SELECT * FROM users ORDER BY createdAt DESC LIMIT 20
```

## Funciones no compatibles

SSSQL no intenta ser SQL completo. Las funciones fuera del subconjunto admitido no están disponibles en esta referencia resumida.

Las funciones comúnmente no compatibles incluyen:

- joins
- subqueries
- `GROUP BY`
- cursores
- expresiones complejas en `SELECT`
- stored procedures

Para DDL y la superficie SQL completa admitida, usa [SQL API Reference](/reference/api/sql-api/).

## Consejos de rendimiento

### Filtra por campos indexados

Las consultas suelen ser más rápidas cuando la cláusula `WHERE` apunta a campos indexados.

### Mantén las actualizaciones dirigidas

Actualiza solo los registros que realmente quieres cambiar. Los filtros amplios aumentan el trabajo y hacen que los errores sean más difíciles de recuperar.

### Usa LIMIT para consultas exploratorias

Al depurar, empieza con un `LIMIT` pequeño para inspeccionar resultados sin escanear más datos de los necesarios.

### Usa parámetros para valores no confiables

No construyas cadenas SQL directamente a partir de entrada del usuario. Al llamar a la API SQL, pasa los valores no confiables mediante parámetros con nombre.

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

## Ejemplos

### Obtener usuarios activos recientes

```sql
SELECT * FROM users WHERE status = 'active' ORDER BY createdAt DESC LIMIT 5
```

### Insertar un pedido nuevo

```sql
INSERT INTO orders (id, status, total)
VALUES ('order_1', 'pending', 42.5)
```

### Actualizar un documento de perfil

```sql
UPDATE profiles
SET displayName = 'mario', visibility = 'public'
WHERE id = 'profile_1'
```

### Eliminar un token temporal

```sql
DELETE FROM tokens WHERE id = 'token_1'
```

## Relacionado

- [SMongo](/reference/smongo/)
- [API](/reference/api/)
- [SQL API Reference](/reference/api/sql-api/)
- [Best Practices](/reference/best-practices/)
- [Data Models](/reference/data-models/)

