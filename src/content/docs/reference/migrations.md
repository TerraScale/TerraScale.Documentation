---
title: Data Migrations
description: Recommended approaches for evolving document schemas and safely migrating data in TerraScale.
---

TerraScale does not depend on a database managed migration system in the style of traditional SQL tools. Instead, we recommend application driven migration patterns that let you evolve document structure safely and incrementally.

## Current Migration Approach

Today, the safest migration model in TerraScale is to handle schema changes in application code.

That usually means one of the following:

- read old documents and rewrite them into the new shape when they are accessed
- run a background process that rewrites existing records in batches
- temporarily write both old and new fields while applications transition

This approach keeps migrations explicit and testable. It also avoids hidden schema changes that are difficult to debug when application and data expectations drift apart.

## Recommended Patterns

### Lazy migration on read

When an older document is loaded, detect the old shape, transform it, and save it back in the new format.

```ts
type UserV1 = {
  id: string;
  fullName: string;
};

type UserV2 = {
  id: string;
  profile: {
    fullName: string;
  };
  schemaVersion: 2;
};

function migrateUser(doc: UserV1 | UserV2): UserV2 {
  if ("schemaVersion" in doc && doc.schemaVersion === 2) {
    return doc;
  }

  return {
    id: doc.id,
    profile: {
      fullName: doc.fullName
    },
    schemaVersion: 2
  };
}
```

Use this pattern when:

- old data is accessed regularly
- immediate full rewrites are not necessary
- you want migration cost spread over normal traffic

### Background rewriter

Run a separate job that scans records in batches, transforms them, validates the result, and writes them back.

```ts
for (const user of usersBatch) {
  const migrated = migrateUser(user);

  await db.users.update(user.id, migrated);
}
```

Use this pattern when:

- you need the whole dataset upgraded within a defined window
- downstream systems expect a single schema version
- you want migration progress and metrics separate from request traffic

### Dual-write

During a transition period, write both the old and new representations so older and newer application versions can coexist.

```ts
await db.orders.insert({
  id: order.id,
  customerName: order.customerName,
  customer: {
    name: order.customerName
  },
  schemaVersion: 2
});
```

Use this pattern when:

- you are rolling out multiple application versions gradually
- workers, APIs, and clients will not switch at the same time
- backward compatibility matters during deployment

## Safety Checklist

Before running a migration, check the following:

- **Backups**: make sure you can restore the affected data set.
- **Idempotency**: the migration should be safe to run more than once.
- **Validation**: confirm migrated documents match the new shape.
- **Rollback**: define how you will recover if the migration introduces bad data.
- **Observability**: track counts, failures, retries, and completion progress.
- **Batch size**: start small to reduce risk and watch system impact.

## Best Practices

### Version your documents

Add a `schemaVersion` field when a document structure changes in a meaningful way. That makes it easier to detect old data and apply the right migration logic.

### Keep migration logic in code

Treat migrations like normal application code. Review them, test them, and keep them alongside the models they affect.

### Prefer additive changes first

Adding new fields is usually safer than renaming or deleting fields immediately. Once all readers understand the new shape, you can remove the old structure in a later pass.

### Validate before and after writing

Validate the source shape enough to migrate safely, then validate the migrated result before saving it.

### Test on real samples

Run migrations against representative production shaped data in staging before touching live records.

## Related

- [Validation](/reference/validation/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [SMongo](/reference/smongo/)
