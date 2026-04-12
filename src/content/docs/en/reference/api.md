---
title: API
description: Information about TerraScale's api
order: 1000
---

## Overview

TerraScale exposes a REST-based API for database operations, queries, and management workflows. Requests and responses use JSON, which makes the API easy to call from backend services, scripts, and migration tools.

For most programmatic access, you authenticate with an API key and send standard HTTPS requests.

## Base URL

Use the TerraScale API endpoint for all programmatic requests. In practice, this is the API behind the dashboard and SDKs.

- Dashboard: [https://dashboard.terrascale.io](https://dashboard.terrascale.io)
- API endpoint: `https://dashboard.terrascale.io/api`

Some product areas and examples may also reference `api.terrascale.io`. Use the endpoint documented by the specific SDK or reference page you are working with.

## Authentication

Most API requests require an API key.

Send it in the `Authorization` header:

```http
Authorization: Bearer ts_live_your_api_key
```

Create and manage keys from your account and dashboard settings. For more details, see:

- [Authentication](/reference/authentication/)
- [Account Registration](/account/registration/)
- [Profile](/account/profile/)
- [API Keys](/reference/management/api-keys/)

## Request Format

TerraScale API requests use JSON bodies for operations that send data.

Typical headers:

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer ts_live_your_api_key
```

Example request body:

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

## Response Format

Responses are returned as JSON. Successful responses usually include a consistent JSON envelope for the endpoint you called, along with the requested resource, operation result, or relevant metadata.

When a request fails, TerraScale returns a JSON error response with the HTTP status code and details that help you identify what went wrong.

Example error shape:

```json
{
  "status": 401,
  "title": "Unauthorized",
  "detail": "The provided API key is missing, invalid, or expired."
}
```

See [Error Handling](/reference/error-handling/) for endpoint-specific guidance.

## Pagination

List and query style endpoints may return paginated results. When a result set is larger than a single response, continue with the pagination token or cursor returned by that endpoint.

Pagination is especially important for high-volume query workloads and result sets that approach platform limits.

## Rate Limits

TerraScale applies rate limits to protect platform stability and ensure fair usage across plans.

See the full [Rate Limits](/reference/rate-limits/) reference for request limits, quotas, and retry guidance.

## API Endpoints

The API surface is organized into a few main groups.

| Group | What it covers | Reference |
|-------|----------------|-----------|
| Health | Uptime checks and readiness probes | [Health](/reference/api/health/) |
| Database operations | Item access, repositories, transactions, and batch operations | [Item Operations](/reference/api/item-operations/), [Repositories](/reference/api/repositories/), [Transactions](/reference/api/transactions/), [Batch Operations](/reference/api/batch-operations/) |
| Query | Query patterns and SQL-style access | [Query Operations](/reference/api/query-operations/), [SQL API](/reference/api/sql-api/) |
| Management | Databases, repositories, and API key management | [Databases](/reference/management/databases/), [Repositories](/reference/management/repositories/), [API Keys](/reference/management/api-keys/) |

## See Also

- [Authentication](/reference/authentication/)
- [Rate Limits](/reference/rate-limits/)
- [Error Handling](/reference/error-handling/)
- [Getting Started](/guides/getting-started/)
- [Querying](/guides/querying/)
