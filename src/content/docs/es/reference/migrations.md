---
title: Migraciones de datos
description: Enfoques recomendados para evolucionar esquemas de documentos y migrar datos de forma segura en TerraScale.
---

TerraScale no depende de un sistema de migración administrado por la base de datos al estilo de las herramientas SQL tradicionales. En su lugar, recomendamos patrones de migración guiados por la aplicación que te permitan evolucionar la estructura de los documentos de forma segura y gradual.

## Enfoque actual de migración

Hoy, el modelo de migración más seguro en TerraScale es manejar los cambios de esquema en el código de la aplicación.

Eso normalmente significa una de estas opciones:

- leer documentos antiguos y reescribirlos con la nueva forma cuando se accede a ellos
- ejecutar un proceso en background que reescriba los registros existentes por lotes
- escribir temporalmente tanto los campos antiguos como los nuevos mientras las aplicaciones hacen la transición

Este enfoque mantiene las migraciones explícitas y comprobables. También evita cambios de esquema ocultos que son difíciles de depurar cuando las expectativas de la aplicación y de los datos se separan.

## Patrones recomendados

### Migración perezosa en lectura

Cuando se cargue un documento antiguo, detecta la forma vieja, transfórmala y vuelve a guardarla en el formato nuevo.

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

Usa este patrón cuando:

- se accede a los datos antiguos con regularidad
- no son necesarias reescrituras completas inmediatas
- quieres repartir el costo de migración sobre el tráfico normal

### Reescritor en background

Ejecuta un job separado que recorra registros por lotes, transforme, valide el resultado y vuelva a escribirlo.

```ts
for (const user of usersBatch) {
  const migrated = migrateUser(user);

  await db.users.update(user.id, migrated);
}
```

Usa este patrón cuando:

- necesitas actualizar todo el conjunto de datos dentro de una ventana definida
- los sistemas downstream esperan una sola versión de esquema
- quieres el progreso y las métricas de migración separados del tráfico de solicitudes

### Escritura dual

Durante un período de transición, escribe tanto la representación antigua como la nueva para que las versiones viejas y nuevas de la aplicación puedan convivir.

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

Usa este patrón cuando:

- estás desplegando varias versiones de la aplicación de forma gradual
- workers, APIs y clientes no cambiarán al mismo tiempo
- la compatibilidad hacia atrás importa durante el despliegue

## Lista de seguridad

Antes de ejecutar una migración, revisa lo siguiente:

- **Backups**: asegúrate de poder restaurar el conjunto de datos afectado.
- **Idempotencia**: la migración debe poder ejecutarse más de una vez con seguridad.
- **Validación**: confirma que los documentos migrados coincidan con la nueva forma.
- **Rollback**: define cómo te recuperarás si la migración introduce datos incorrectos.
- **Observabilidad**: sigue conteos, fallos, reintentos y progreso de finalización.
- **Tamaño del lote**: empieza pequeño para reducir el riesgo y observar el impacto en el sistema.

## Buenas prácticas

### Versiona tus documentos

Añade un campo `schemaVersion` cuando la estructura de un documento cambie de forma relevante. Eso facilita detectar datos antiguos y aplicar la lógica de migración correcta.

### Mantén la lógica de migración en el código

Trata las migraciones como código normal de aplicación. Revísalas, pruébalas y mantenlas junto a los modelos a los que afectan.

### Prefiere primero los cambios aditivos

Añadir campos nuevos suele ser más seguro que renombrar o eliminar campos de inmediato. Cuando todos los lectores entiendan la nueva forma, puedes eliminar la estructura vieja en una pasada posterior.

### Valida antes y después de escribir

Valida la forma de origen lo suficiente para migrar con seguridad y luego valida el resultado migrado antes de guardarlo.

### Prueba con muestras reales

Ejecuta las migraciones sobre datos representativos con forma de producción en staging antes de tocar los registros reales.

## Relacionado

- [Validation](/reference/validation/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [SMongo](/reference/smongo/)

