---
title: Guía de uso simple
description: Una guía de uso simple para TerraScale
sidebar:
  order: 2
---

## Primeros pasos con TerraScale

Esta guía te acompaña por lo básico de TerraScale en solo unos minutos.

TerraScale es una base de datos NoSQL distribuida globalmente, creada para lecturas rápidas, documentos JSON flexibles y flujos de trabajo directos para desarrolladores. Si quieres pasar de configurar tu cuenta a almacenar tu primer elemento rápidamente, empieza aquí.

## Lo que necesitas

Antes de empezar, asegúrate de tener:

- Una cuenta de TerraScale
- Una clave de API con acceso a la base de datos
- Conocimientos básicos de REST APIs o del SDK que prefieras

Si planeas trabajar directamente con la API, ten a mano la [descripción general de la API](/reference/api/) y la [guía de autenticación](/reference/authentication/).

## Paso 1: Crea una cuenta

Empieza creando tu cuenta de TerraScale:

1. Ve a [dashboard.terrascale.io](https://dashboard.terrascale.io)
2. Regístrate con tu dirección de email
3. Verifica tu email
4. Abre el dashboard y crea una clave de API

Para acceso de aplicaciones, usa una clave de API en lugar de un token de sesión del dashboard. Las claves de API son la opción estándar para scripts, servicios e integraciones basadas en SDK.

## Paso 2: Crea una base de datos

Después, crea una base de datos para los datos de tu app.

Puedes hacerlo de dos maneras:

- Desde el dashboard
- Desde Management API

Al crear la base de datos, elige:

- Un nombre claro para la base de datos
- La región más cercana a tus usuarios o cargas de trabajo

Ejemplo de solicitud a Management API:

```bash
curl -X POST "https://api.terrascale.io/api/v1/management/databases" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-first-db",
    "region": "us-east-1"
  }'
```

Si estás usando la API, la creación de bases de datos usa la autenticación del dashboard. Consulta [Database Management API](/reference/management/databases/) para ver el flujo completo.

## Paso 3: Almacena tu primer elemento

Una vez que tu base de datos esté lista, almacena un documento JSON con la REST API.

Este ejemplo escribe un perfil de usuario en la base de datos `my-first-db`:

```bash
curl -X PUT "https://api.terrascale.io/api/v1/databases/my-first-db/items" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "pk": "user#1001",
    "sk": "profile",
    "data": {
      "name": "Ava Chen",
      "email": "ava@example.com",
      "plan": "starter"
    }
  }'
```

Esta solicitud usa:

- `pk` como partition key
- `sk` como sort key
- `data` para el documento JSON que quieres almacenar

Para ver más ejemplos, consulta [Item Operations](/reference/api/item-operations/).

## Paso 4: Lee tus datos

Después de escribir un elemento, recupéralo con una solicitud GET simple:

```bash
curl "https://api.terrascale.io/api/v1/databases/my-first-db/items/user%231001/profile" \
  -H "Authorization: Bearer ts_live_your_api_key"
```

Deberías recibir una respuesta JSON que contenga el elemento almacenado, junto con metadatos como `createdAt` y `updatedAt`.

## Paso 5: Consulta tus datos

Cuando necesites más que un único elemento, consulta por partition key.

Ejemplo de solicitud de consulta:

```bash
curl -X POST "https://api.terrascale.io/api/v1/databases/my-first-db/items/query" \
  -H "Authorization: Bearer ts_live_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "partitionKey": "user#1001",
    "sortKeyCondition": "begins_with:profile",
    "limit": 10
  }'
```

TerraScale también admite opciones de consulta de mayor nivel, incluidas:

- **SSSQL** para consultas con estilo SQL
- **SMongo** para una experiencia de consulta inspirada en Mongo

Si quieres profundizar, continúa con la [guía de consultas](/guides/querying/) y la [referencia de Query Operations](/reference/api/query-operations/).

## Próximos pasos

- [Guía de consultas](/guides/querying/)
- [Guía del SDK C#](/guides/sdks/csharp/)
- [Referencia de la API](/reference/api/)
- [Buenas prácticas](/reference/best-practices/)
