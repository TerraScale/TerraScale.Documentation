---
title: "Buenas prácticas de seguridad para TerraScale"
date: 2024-09-25
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - security
  - best-practices
excerpt: La seguridad no es opcional. Aquí tienes cómo mantener seguras tus bases de datos de TerraScale con una gestión sensata de API keys, MFA y controles de acceso.
cover:
  wide: /images/blog/security-best-practices/cover-wide.svg
  square: /images/blog/security-best-practices/cover-square.svg
  alt: Geometría de escudo en capas y nodos perimetrales protegidos, transmitiendo seguridad de base de datos de nivel empresarial.
---

La seguridad no es opcional. Aquí tienes un checklist práctico para ayudarte a mantener seguras tus bases de datos de TerraScale.

## Lo que aprenderás

- Cómo gestionar API keys sin crear riesgos innecesarios
- Qué controles de cuenta y equipo importan más
- Qué revisar de forma regular para que la seguridad siga siendo algo tranquilo, en el mejor sentido

Si estás configurando acceso mientras lees, ten cerca la [referencia de autenticación](/reference/authentication/), la [referencia de API keys](/reference/management/api-keys/) y la [guía de MFA](/reference/mfa/).

## Seguridad de API keys

### Usa scopes específicos

Nunca uses `*` para workloads de producción. Concede solo los permisos que cada servicio realmente necesita:
```csharp
// Bad: Full access
{ "scopes": ["*"] }

// Good: Specific permissions
{ "scopes": ["database:read"] }  // Read-only service
{ "scopes": ["database:read", "database:write"] }  // Backend API
{ "scopes": ["repository:read", "repository:write"] }  // Specific to repositories
```

### Separa claves por entorno

Usa API keys distintas para cada entorno. Así, un problema en un entorno no se convierte automáticamente en un problema en todos.

| Environment | Key Name | Scopes |
|-------------|----------|--------|
| Production | prod-backend | database:read, database:write |
| Staging | staging-backend | database:read, database:write |
| Development | dev-local | database:* |
| CI/CD | ci-tests | database:read |

### Rota las claves regularmente

Las API keys deben rotarse cada 90 días:

1. Crea una nueva clave con los mismos scopes
2. Actualiza la configuración de tu aplicación
3. Haz deploy y verifica
4. Revoca la clave anterior

### Nunca hagas commit de claves

Las API keys nunca deben estar en el control de código fuente:
```csharp
// Bad: Hardcoded
var apiKey = "ts_live_abc123...";

// Good: Environment variable
var apiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY");

// Good: Secret manager
var apiKey = await secretManager.GetSecretAsync("terrascale-api-key");
```

Añade estos patrones a tu `.gitignore` si todavía no están:
```
.env
.env.local
*.env
appsettings.Development.json
```

## Seguridad de la cuenta

### Activa autenticación de dos factores

Cada cuenta debería tener 2FA activado. TerraScale admite:

- **Apps autenticadoras** (Google Authenticator, Authy, 1Password) - Recomendado
- **Códigos por email** - Buenos como respaldo

Para activarlo:
1. Ve a Settings > Security
2. Haz clic en "Add Method"
3. Escanea el QR code con tu app autenticadora
4. Introduce el código de verificación

### Usa contraseñas fuertes

Requisitos:
- Mínimo 12 caracteres (recomendamos 16 o más)
- Mezcla de mayúsculas, minúsculas, números y símbolos
- Única para TerraScale (no reutilizada de otros servicios)

Considera usar un gestor de contraseñas. Si alguien de tu equipo sigue reutilizando contraseñas, este es el momento de corregirlo.

### Revisa las sesiones activas

Comprueba periódicamente Settings > Security > Sessions:

- Busca ubicaciones o dispositivos desconocidos
- Revoca cualquier sesión que no reconozcas
- Considera revocar todas las sesiones tras cambios de contraseña

## Seguridad del equipo

### Principio de mínimo privilegio

Asigna el rol mínimo necesario:

| Role | Use Case |
|------|----------|
| Owner | Only the account creator (one person) |
| Admin | Team leads who need to manage members |
| Member | Developers who create and manage resources |
| Read-only | Auditors, analysts, support staff |

### Audita a los miembros del equipo

Revisa tu equipo trimestralmente:

- Elimina a las personas que ya no estén en la organización
- Reduce permisos que ya no hagan falta
- Verifica que todos los miembros tengan 2FA activado

### Gestiona las salidas con rapidez

Cuando alguien se vaya:

1. Elimínalo de la organización inmediatamente
2. Revoca cualquier API key que haya creado
3. Revisa los recursos a los que tenía acceso
4. Considera rotar credenciales compartidas

## Seguridad de red

### Usa solo HTTPS

Todas las APIs de TerraScale requieren HTTPS. Nunca intentes usar HTTP.

### Valida certificados TLS

No desactives la validación de certificados en producción:
```csharp
// Never do this in production
ServicePointManager.ServerCertificateValidationCallback = (s, c, ch, e) => true;
```

### IP allowlisting (Enterprise)

Los clientes Enterprise pueden restringir el acceso a la API a rangos concretos de IP. Contacta con soporte para activar esta función. Es especialmente útil para herramientas internas y sistemas back-office con rutas de red predecibles.

## Seguridad de los datos

### Manejo de datos sensibles

No guardes datos altamente sensibles directamente, salvo que tengas una razón clara y un plan documentado de manejo:
```csharp
// Bad: Storing raw SSN
["ssn"] = "123-45-6789"

// Better: Store a hash or encrypted value
["ssnHash"] = Hash("123-45-6789")

// Best: Don't store it at all if you don't need it
```

### Encryption at rest

Todos los datos en TerraScale están cifrados en reposo con AES-256. Esto es automático y no requiere configuración.

### Encryption in transit

Todos los datos en tránsito usan TLS 1.3. Esto es automático y obligatorio.

Por qué importa: los valores por defecto de la infraestructura pueden protegerte de grandes clases de errores, pero no sustituyen decisiones a nivel de aplicación, como definir bien los scopes de los secretos o decidir qué datos realmente deberían vivir en la base de datos.

## Monitorización y alertas

### Activa audit logs

Haz seguimiento de quién accede a tus datos:

- Uso de API keys por tipo de operación
- Intentos fallidos de autenticación
- Acciones administrativas (cambios de miembros, creación de claves)

### Configura alertas

Configura alertas para:

- Patrones inusuales de uso de la API
- Picos de fallos de autenticación
- Creación de nuevas API keys
- Cambios en miembros del equipo

### Revisiones regulares

Checklist mensual de seguridad:

- [ ] Revisar el uso de API keys, ¿hay sorpresas?
- [ ] Comprobar API keys inactivas, revócalas
- [ ] Verificar que la lista de miembros del equipo es correcta
- [ ] Confirmar que todos los miembros del equipo tienen 2FA
- [ ] Revisar cualquier alerta de seguridad

## Respuesta ante incidentes

### Si una API key se ve comprometida

1. **Revócala de inmediato** - No esperes, revoca la clave ahora
2. **Crea una nueva clave** - Genera un reemplazo
3. **Actualiza las aplicaciones** - Haz deploy de la nueva clave
4. **Audita el uso** - Revisa logs en busca de accesos no autorizados
5. **Revisa los datos** - Busca cualquier modificación de datos
6. **Documenta** - Registra qué pasó y cómo respondiste

### Si una cuenta se ve comprometida

1. **Cambia la contraseña inmediatamente**
2. **Revoca todas las sesiones**
3. **Revisa y revoca API keys**
4. **Activa 2FA si aún no estaba activado**
5. **Comprueba miembros de equipo no autorizados**
6. **Contacta con soporte** en mariogk@terrascale.tech

## Resumen

La seguridad es responsabilidad de todos. El objetivo no es la perfección. El objetivo es hacer que el camino seguro sea el camino normal.

1. Usa scopes específicos para API keys
2. Rota las claves cada 90 días
3. Activa 2FA para todas las cuentas
4. Usa el principio de mínimo privilegio
5. Nunca hagas commit de secretos al control de código fuente
6. Monitoriza actividad inusual
7. Ten un plan de respuesta ante incidentes

¿Tienes preguntas sobre seguridad? Contacta a mariogk@terrascale.tech. Para orientación operativa general, también vale la pena guardar la [referencia de buenas prácticas](/reference/best-practices/).
