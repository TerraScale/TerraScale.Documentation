---
title: Querying
description: How querying at TerraScale works
sidebar:
  order: 9
---

## Querying Your Data

TerraScale gives you two ways to query your data. You can use **SSSQL** if you prefer SQL-style syntax, or **SMongo** if you are more comfortable with MongoDB-style query patterns. This page helps you choose the right interface and points you to the full reference docs.

## SSSQL

SSSQL is TerraScale's SQL-compatible query interface. It is a good fit if your team already works with relational query syntax, reporting workflows, or structured filtering and sorting.

```sql
SELECT id, email
FROM users
WHERE plan = 'pro'
ORDER BY created_at DESC
LIMIT 10;
```

Read the full [SSSQL reference](/reference/sssql/).

## SMongo

SMongo is TerraScale's MongoDB-compatible query interface. It is a natural choice if you already use document-oriented query patterns and want a familiar API for filters and projections.

```javascript
db.users.find(
  { plan: 'pro' },
  { id: 1, email: 1 }
).limit(10)
```

Read the full [SMongo reference](/reference/smongo/).

## Which Interface Should I Use?

- Use **SSSQL** if you prefer SQL syntax, tabular thinking, and query patterns that look like traditional database queries.
- Use **SMongo** if you are familiar with MongoDB query syntax and document-based filtering.

Both interfaces query the same TerraScale data model, so the best choice usually comes down to what feels most natural for your team.

## Performance Tips

- Prefer indexed queries whenever possible.
- Use pagination for large result sets.
- Avoid full scans on large collections or tables.

## Next Steps

- Explore the [SSSQL reference](/reference/sssql/).
- Explore the [SMongo reference](/reference/smongo/).
- Review [rate limits](/reference/rate-limits/) before high-volume workloads.
