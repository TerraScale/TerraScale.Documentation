---
title: Simple Mongo Query Language
description: This is a similar language to mongodb's query
---

## Overview

SMongo is TerraScale's MongoDB-compatible query interface. It gives teams a familiar, document-style way to query and modify data without switching mental models.

If you already know MongoDB query syntax, SMongo should feel approachable from the start.

## When to Use SMongo

SMongo is a good fit when:

- you are coming from MongoDB
- you prefer document-style queries over SQL syntax
- your team is already familiar with MongoDB filters and operators

If you would rather work with SQL-like statements, see [SSSQL](/reference/sssql/).

## Supported Operations

### find

Use `find` to query documents that match a filter.

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

Use `findOne` when you expect a single matching document.

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

Use `insertOne` to add a single document, or `insert` when working with multiple documents in one request.

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

Use `updateOne` for a targeted change, or `update` when more than one matching document may be updated.

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

Use `deleteOne` to remove a single matching document, or `delete` for broader cleanup operations.

```json
{
  "collection": "sessions",
  "operation": "deleteOne",
  "filter": {
    "id": { "$eq": "session_abc" }
  }
}
```

## Supported Query Operators

SMongo supports a practical subset of common MongoDB-style operators.

### Comparison Operators

- `$eq`
- `$gt`
- `$gte`
- `$lt`
- `$lte`
- `$ne`

### Logical Operators

- `$and`
- `$or`
- `$not`

## Limitations

SMongo is intentionally focused. Keep these constraints in mind:

- no aggregation pipeline support
- no `$lookup` or join-style queries
- a maximum of 100 results per query response
- use pagination when you need to read beyond the first page

For complex analytical or relational workflows, [SSSQL](/reference/sssql/) may be a better fit.

## Examples

### Find active users on a paid plan

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

### Find recent orders over a threshold

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

### Update a user's subscription tier

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

### Delete expired sessions

```json
{
  "collection": "sessions",
  "operation": "delete",
  "filter": {
    "expiresAt": { "$lt": "2026-04-01T00:00:00Z" }
  }
}
```

## See Also

- [SSSQL](/reference/sssql/)
- [Querying](/guides/querying/)
- [Best Practices](/reference/best-practices/)
- [Rate Limits](/reference/rate-limits/)
