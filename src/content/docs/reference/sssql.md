---
title: Super Simple SQL
description: This is a subset of sql to only have CRUD operations
---


# Examles

# Supported Operations

### SELECT
```sql
SELECT * FROM databaseName WHERE name = 'test' AND age >= 29
```

### UPDATE //todo acutally make an SQL update here
```sql
UPDATE ID FROM databaseName JSON '{"name": "test", "age":"29"}'
```

### UPDATE JSON
```sql
UPDATE ID FROM databaseName JSON '{"name": "test", "age":"29"}'
```

### DELETE
```sql
DELETE ID from databaseName
```

Where example:
```sql
DELETE from databaseName WHERE name = 'test'
```

# Not Supporteds
We do not support any other SQL feature that is not mentioned before at the example.
For example we do not support joins, cursors, inner sql and etc.

# References

# Why SSSQL?
I was jelous of Cassandra having CQL and RavenDb having RQL that is why i create `SSSQL`, jokes aside
we wanted to support some simple SQL like operations to make migration to TerraScale easier and some
occasional manual querying to debug easier as well.
