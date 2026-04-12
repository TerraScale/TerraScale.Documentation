---
title: Validation
description: TerraScale's validation philosophy, recommended patterns, and when database constraints still help.
---

TerraScale keeps validation responsibilities lightweight at the database layer. In most cases, we recommend validating data in your application, API, or shared domain code before documents are written.

## Our Approach to Validation

TerraScale is intentionally opinionated here: the database should focus on storing and retrieving data efficiently, while application code should enforce business rules and schema expectations.

That does not mean validation is unimportant. It means the most reliable place for most validation is usually the part of your system that already knows the request context, user permissions, product rules, and type definitions.

## Why Application-Level Validation

Application level validation usually has better access to the information needed to make good decisions.

For example, your application can often answer questions like:

- Is this field required for this type of user?
- Is this value allowed for this plan?
- Does this update depend on current workflow state?
- Should this write be rejected, normalized, or defaulted?

Those rules are often hard to express cleanly in a general database constraint system.

## Recommended Patterns

### Input validation

Validate request payloads at the edge of your system, before they reach persistence code.

```ts
function validateCreateUser(input: unknown): asserts input is {
  email: string;
  name: string;
} {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid payload");
  }

  const value = input as Record<string, unknown>;

  if (typeof value.email !== "string" || typeof value.name !== "string") {
    throw new Error("Invalid user fields");
  }
}
```

### Schema enforcement in code

Use constructors, parsers, or validation libraries in your application layer so writes are normalized before they are stored.

```ts
type User = {
  id: string;
  email: string;
  name: string;
};

function toUser(input: { id: string; email: string; name: string }): User {
  return {
    id: input.id,
    email: input.email.trim().toLowerCase(),
    name: input.name.trim()
  };
}
```

### Type-safe models

Keep your write models, read models, and migration logic typed. Type safety does not replace runtime validation, but it reduces accidental drift between application code and stored documents.

## When Database Constraints Help

There are still cases where database level constraints or guardrails can be useful.

They can help when you need:

- unique identifiers or keys
- simple structural guarantees
- protection against obviously invalid writes from multiple services
- a backstop for high risk data paths

The tradeoff is that database constraints can make schema evolution and multi service changes harder if they are too rigid. For many teams, a balanced model works best: strong validation in code, plus targeted database constraints where they clearly reduce risk.

## Best Practices

### Validate early

Reject bad input before it reaches your persistence layer.

### Normalize consistently

Trim strings, normalize casing, and set defaults in one shared place.

### Keep validation close to the domain

Business rules belong near the code that understands them, not scattered across unrelated services.

### Reuse validation in migrations and background jobs

Do not assume only API requests need validation. Imports, repair jobs, and migrations should follow the same rules.

### Add database constraints selectively

Use them where they provide clear protection, not as a substitute for application design.

## Related

- [Data Migrations](/reference/migrations/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [API](/reference/api/)
