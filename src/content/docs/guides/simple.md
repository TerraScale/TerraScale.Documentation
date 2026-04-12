---
title: Simple usage guide
description: A simple usage guide for TerraScale
sidebar:
  order: 2
---

## Getting Started with TerraScale

This guide walks you through the basics of using TerraScale in just a few minutes.

TerraScale is a globally distributed NoSQL database built for fast reads, flexible JSON documents, and straightforward developer workflows. If you want to get from account setup to your first stored item quickly, start here.

## What You Need

Before you begin, make sure you have:

- A TerraScale account
- An API key with database access
- Basic knowledge of REST APIs or your preferred SDK

If you plan to work with the API directly, keep the [API overview](/reference/api/) and [authentication guide](/reference/authentication/) nearby.

## Step 1: Create an Account

Start by creating your TerraScale account:

1. Go to [dashboard.terrascale.io](https://dashboard.terrascale.io)
2. Sign up with your email address
3. Verify your email
4. Open the dashboard and create an API key

For application access, use an API key rather than a dashboard session token. API keys are the standard choice for scripts, services, and SDK-based integrations.

## Step 2: Create a Database

Next, create a database for your app data.

You can do this in two ways:

- Through the dashboard
- Through the Management API

When creating the database, choose:

- A clear database name
- The region closest to your users or workloads

Example Management API request:

```bash
curl -X POST "https://api.terrascale.io/api/v1/management/databases" \
  -H "Authorization: Bearer eyJhbGci..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-first-db",
    "region": "us-east-1"
  }'
```

If you are using the API, database creation uses dashboard authentication. See [Database Management API](/reference/management/databases/) for the full flow.

## Step 3: Store Your First Item

Once your database is ready, store a JSON document with the REST API.

This example writes a user profile into the `my-first-db` database:

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

This request uses:

- `pk` as the partition key
- `sk` as the sort key
- `data` for the JSON document you want to store

For more examples, see [Item Operations](/reference/api/item-operations/).

## Step 4: Read Your Data

After writing an item, fetch it back with a simple GET request:

```bash
curl "https://api.terrascale.io/api/v1/databases/my-first-db/items/user%231001/profile" \
  -H "Authorization: Bearer ts_live_your_api_key"
```

You should get a JSON response containing the stored item, along with metadata such as `createdAt` and `updatedAt`.

## Step 5: Query Your Data

When you need more than a single item, query by partition key.

Example query request:

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

TerraScale also supports higher-level query options, including:

- **SSSQL** for SQL-style queries
- **SMongo** for a Mongo-inspired query experience

If you want to go deeper, continue with the [querying guide](/guides/querying/) and the [Query Operations reference](/reference/api/query-operations/).

## Next Steps

- [Querying guide](/guides/querying/)
- [C# SDK guide](/guides/sdks/csharp/)
- [API reference](/reference/api/)
- [Best practices](/reference/best-practices/)
