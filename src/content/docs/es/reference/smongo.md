---
title: Lenguaje simple de consultas Mongo
description: Este es un lenguaje similar al lenguaje de consulta de mongodb
---

## Descripción general

SMongo es la interfaz de consulta compatible con MongoDB de TerraScale. Da a los equipos una forma familiar, de estilo documento, de consultar y modificar datos sin cambiar su modelo mental.

Si ya conoces la sintaxis de consultas de MongoDB, SMongo debería resultarte accesible desde el principio.

## Cuándo usar SMongo

SMongo es una buena opción cuando:

- vienes de MongoDB
- prefieres consultas de estilo documento en lugar de sintaxis SQL
- tu equipo ya conoce filtros y operadores de MongoDB

Si prefieres trabajar con sentencias parecidas a SQL, consulta [SSSQL](/reference/sssql/).

## Operaciones compatibles

### find

Usa `find` para consultar documentos que coinciden con un filtro.

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

Usa `findOne` cuando esperas un solo documento coincidente.

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

Usa `insertOne` para añadir un solo documento, o `insert` cuando trabajes con varios documentos en una sola solicitud.

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

Usa `updateOne` para un cambio dirigido, o `update` cuando pueda actualizarse más de un documento coincidente.

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

Usa `deleteOne` para eliminar un solo documento coincidente, o `delete` para operaciones de limpieza más amplias.

```json
{
  "collection": "sessions",
  "operation": "deleteOne",
  "filter": {
    "id": { "$eq": "session_abc" }
  }
}
```

## Operadores de consulta compatibles

SMongo admite un subconjunto práctico de los operadores más comunes al estilo MongoDB.

### Operadores de comparación

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

## Limitaciones

SMongo está intencionalmente enfocado. Ten en cuenta estas restricciones:

- sin soporte para aggregation pipeline
- sin `$lookup` ni consultas de estilo join
- máximo de 100 resultados por respuesta de consulta
- usa paginación cuando necesites leer más allá de la primera página

Para flujos analíticos o relacionales más complejos, [SSSQL](/reference/sssql/) puede ser una mejor opción.

## Ejemplos

### Encontrar usuarios activos en un plan de pago

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

### Encontrar pedidos recientes por encima de un umbral

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

### Actualizar el tier de suscripción de un usuario

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

### Eliminar sesiones expiradas

```json
{
  "collection": "sessions",
  "operation": "delete",
  "filter": {
    "expiresAt": { "$lt": "2026-04-01T00:00:00Z" }
  }
}
```

## Ver también

- [SSSQL](/reference/sssql/)
- [Querying](/guides/querying/)
- [Best Practices](/reference/best-practices/)
- [Rate Limits](/reference/rate-limits/)

