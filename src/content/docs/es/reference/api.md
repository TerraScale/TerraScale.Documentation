---
title: API
description: Información sobre la api de TerraScale
order: 1000
---

## Descripción general

TerraScale expone una API basada en REST para operaciones de base de datos, consultas y flujos de gestión. Las solicitudes y respuestas usan JSON, lo que hace que la API sea fácil de llamar desde servicios backend, scripts y herramientas de migración.

Para la mayor parte del acceso programático, te autenticas con una API key y envías solicitudes HTTPS estándar.

## Base URL

Usa el endpoint de API de TerraScale para todas las solicitudes programáticas. En la práctica, esta es la API detrás del dashboard y de los SDKs.

- Dashboard: [https://dashboard.terrascale.io](https://dashboard.terrascale.io)
- API endpoint: `https://dashboard.terrascale.io/api`

Algunas áreas del producto y ejemplos también pueden hacer referencia a `api.terrascale.io`. Usa el endpoint documentado por el SDK o la página de referencia específica con la que estés trabajando.

## Autenticación

La mayoría de las solicitudes de API requieren una API key.

Envíala en el encabezado `Authorization`:

```http
Authorization: Bearer ts_live_your_api_key
```

Crea y administra claves desde la configuración de tu cuenta y del dashboard. Para más detalles, consulta:

- [Authentication](/reference/authentication/)
- [Account Registration](/account/registration/)
- [Profile](/account/profile/)
- [API Keys](/reference/management/api-keys/)

## Formato de solicitud

Las solicitudes de la API de TerraScale usan cuerpos JSON para operaciones que envían datos.

Encabezados típicos:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer ts_live_your_api_key
```

Ejemplo de cuerpo de solicitud:

```json
{
  "pk": "user#123",
  "sk": "profile",
  "data": {
    "name": "Jane Doe",
    "plan": "pro"
  }
}
```

## Formato de respuesta

Las respuestas se devuelven como JSON. Las respuestas exitosas suelen incluir un envelope JSON consistente para el endpoint que llamaste, junto con el recurso solicitado, el resultado de la operación o metadatos relevantes.

Cuando una solicitud falla, TerraScale devuelve una respuesta JSON de error con el código de estado HTTP y detalles que te ayudan a identificar el problema.

Ejemplo de forma de error:

```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "The provided API key is missing, invalid, or expired."
}
```

Consulta [Error Handling](/reference/error-handling/) para orientaciones específicas por endpoint.

## Paginación

Los endpoints de listado y consulta pueden devolver resultados paginados. Cuando un conjunto de resultados es mayor que una sola respuesta, continúa con el token de paginación o cursor que devuelva ese endpoint.

La paginación es especialmente importante para cargas de consulta de alto volumen y conjuntos de resultados que se acercan a los límites de la plataforma.

## Rate Limits

TerraScale aplica rate limits para proteger la estabilidad de la plataforma y garantizar un uso justo entre planes.

Consulta la referencia completa de [Rate Limits](/reference/rate-limits/) para límites de solicitudes, cuotas y guías de reintento.

## Endpoints de la API

La superficie de la API está organizada en algunos grupos principales.

| Group | What it covers | Reference |
|-------|----------------|-----------|
| Health | Comprobaciones de uptime y readiness probes | [Health](/reference/api/health/) |
| Database operations | Acceso a elementos, repositorios, transacciones y operaciones por lotes | [Item Operations](/reference/api/item-operations/), [Repositories](/reference/api/repositories/), [Transactions](/reference/api/transactions/), [Batch Operations](/reference/api/batch-operations/) |
| Query | Patrones de consulta y acceso estilo SQL | [Query Operations](/reference/api/query-operations/), [SQL API](/reference/api/sql-api/) |
| Management | Bases de datos, repositorios y gestión de API keys | [Databases](/reference/management/databases/), [Repositories](/reference/management/repositories/), [API Keys](/reference/management/api-keys/) |

## Ver también

- [Authentication](/reference/authentication/)
- [Rate Limits](/reference/rate-limits/)
- [Error Handling](/reference/error-handling/)
- [Getting Started](/guides/getting-started/)
- [Querying](/guides/querying/)

