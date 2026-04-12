---
title: Consultas
description: Cómo funciona la consulta en TerraScale
sidebar:
  order: 9
---

## Consulta tus datos

TerraScale te ofrece dos formas de consultar tus datos. Puedes usar **SSSQL** si prefieres sintaxis de estilo SQL, o **SMongo** si te sientes más cómodo con patrones de consulta de estilo MongoDB. Esta página te ayuda a elegir la interfaz correcta y te dirige a la documentación de referencia completa.

## SSSQL

SSSQL es la interfaz de consulta compatible con SQL de TerraScale. Es una buena opción si tu equipo ya trabaja con sintaxis relacional de consulta, flujos de informes o filtrado y ordenación estructurados.

```sql
SELECT id, email
FROM users
WHERE plan = 'pro'
ORDER BY created_at DESC
LIMIT 10;
```

Lee la [referencia completa de SSSQL](/reference/sssql/).

## SMongo

SMongo es la interfaz de consulta compatible con MongoDB de TerraScale. Es una elección natural si ya usas patrones de consulta orientados a documentos y quieres una API familiar para filtros y proyecciones.

```javascript
db.users.find(
  { plan: 'pro' },
  { id: 1, email: 1 }
).limit(10)
```

Lee la [referencia completa de SMongo](/reference/smongo/).

## ¿Qué interfaz debo usar?

- Usa **SSSQL** si prefieres sintaxis SQL, pensamiento tabular y patrones de consulta que se parezcan a consultas tradicionales de bases de datos.
- Usa **SMongo** si conoces la sintaxis de consulta de MongoDB y el filtrado basado en documentos.

Ambas interfaces consultan el mismo modelo de datos de TerraScale, así que la mejor elección normalmente depende de lo que resulte más natural para tu equipo.

## Consejos de rendimiento

- Prefiere consultas indexadas siempre que sea posible.
- Usa paginación para conjuntos de resultados grandes.
- Evita scans completos en colecciones o tablas grandes.

## Próximos pasos

- Explora la [referencia de SSSQL](/reference/sssql/).
- Explora la [referencia de SMongo](/reference/smongo/).
- Revisa los [rate limits](/reference/rate-limits/) antes de cargas de trabajo de alto volumen.
