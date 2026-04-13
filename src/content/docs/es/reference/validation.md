---
title: Validación
description: La filosofía de validación de TerraScale, patrones recomendados y cuándo las restricciones de base de datos siguen ayudando.
---

TerraScale mantiene ligeras las responsabilidades de validación en la capa de base de datos. En la mayoría de los casos, recomendamos validar los datos en tu aplicación, API o código de dominio compartido antes de escribir los documentos.

## Nuestro enfoque de validación

TerraScale es intencionalmente opinada aquí: la base de datos debe centrarse en almacenar y recuperar datos con eficiencia, mientras que el código de la aplicación debe aplicar reglas de negocio y expectativas de esquema.

Eso no significa que la validación no importe. Significa que el lugar más fiable para la mayor parte de la validación suele ser la parte de tu sistema que ya conoce el contexto de la solicitud, los permisos del usuario, las reglas del producto y las definiciones de tipos.

## Por qué validación a nivel de aplicación

La validación a nivel de aplicación suele tener mejor acceso a la información necesaria para tomar buenas decisiones.

Por ejemplo, tu aplicación a menudo puede responder preguntas como:

- ¿Este campo es obligatorio para este tipo de usuario?
- ¿Este valor está permitido para este plan?
- ¿Esta actualización depende del estado actual del flujo?
- ¿Esta escritura debe rechazarse, normalizarse o recibir un valor por defecto?

Estas reglas suelen ser difíciles de expresar con claridad en un sistema general de restricciones de base de datos.

## Patrones recomendados

### Validación de entrada

Valida los payloads de solicitud en el borde de tu sistema, antes de que lleguen al código de persistencia.

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

### Aplicación de esquema en código

Usa constructores, parsers o bibliotecas de validación en la capa de aplicación para normalizar las escrituras antes de almacenarlas.

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

### Modelos con seguridad de tipos

Mantén tipados tus modelos de escritura, lectura y lógica de migración. La seguridad de tipos no sustituye la validación en tiempo de ejecución, pero reduce desajustes accidentales entre el código de la aplicación y los documentos almacenados.

## Cuándo ayudan las restricciones de base de datos

Aún hay casos en los que las restricciones o guardrails a nivel de base de datos pueden ser útiles.

Pueden ayudar cuando necesitas:

- identificadores o claves únicas
- garantías estructurales simples
- protección contra escrituras claramente inválidas procedentes de varios servicios
- un respaldo para rutas de datos de alto riesgo

La contrapartida es que las restricciones de base de datos pueden hacer más difícil la evolución del esquema y los cambios entre varios servicios si son demasiado rígidas. Para muchos equipos, un modelo equilibrado funciona mejor: validación fuerte en código, más restricciones de base de datos dirigidas donde reduzcan el riesgo con claridad.

## Buenas prácticas

### Valida pronto

Rechaza la entrada inválida antes de que llegue a tu capa de persistencia.

### Normaliza de forma consistente

Recorta cadenas, normaliza mayúsculas y minúsculas y establece valores por defecto en un único lugar compartido.

### Mantén la validación cerca del dominio

Las reglas de negocio deben vivir cerca del código que las entiende, no dispersas entre servicios sin relación.

### Reutiliza la validación en migraciones y jobs en background

No asumas que solo las solicitudes de API necesitan validación. Las importaciones, los jobs de reparación y las migraciones deben seguir las mismas reglas.

### Añade restricciones de base de datos de forma selectiva

Úsalas donde aporten una protección clara, no como sustituto del diseño de la aplicación.

## Relacionado

- [Data Migrations](/reference/migrations/)
- [Data Models](/reference/data-models/)
- [Best Practices](/reference/best-practices/)
- [API](/reference/api/)

