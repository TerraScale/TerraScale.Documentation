---
title: Registro de cuenta
description: Crea una nueva cuenta de TerraScale con verificación de email.
sidebar:
  order: 1
---

Crea una nueva cuenta de TerraScale con tu email, contraseña y datos opcionales de perfil.

## Flujo de registro

### Paso 1: Envía el registro

Visita [dashboard.terrascale.io](https://dashboard.terrascale.io) y haz clic en **Sign Up**, o llama a la API directamente.

### Paso 2: Verifica el email

Revisa tu bandeja de entrada para encontrar un código de verificación y luego introdúcelo para activar tu cuenta.

### Paso 3: Empieza a usar TerraScale

Después de la verificación, tendrás una organización personal lista para tu primera base de datos.

## Referencia de la API

### POST /auth/signup

Crea una nueva cuenta de usuario e inicia el flujo de verificación de email.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Password (min 8 characters, must include uppercase, lowercase, and number) |
| `firstName` | string | No | User's first name |
| `lastName` | string | No | User's last name |

**Response (200 OK):**
```json
{
  "success": true,
  "requiresEmailVerification": true,
  "pendingAuthenticationToken": "pat_abc123...",
  "email": "john@example.com"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether signup was successful |
| `requiresEmailVerification` | boolean | If true, user must verify email before login |
| `pendingAuthenticationToken` | string | Token for the email verification flow. This token expires, so store it temporarily and use it promptly |
| `email` | string | The registered email address |

## Requisitos de contraseña

Tu contraseña debe cumplir estos requisitos:

- Mínimo 8 caracteres
- Al menos una letra mayúscula (A-Z)
- Al menos una letra minúscula (a-z)
- Al menos un número (0-9)

**Ejemplos de contraseñas válidas:**
- `SecurePass123`
- `MyPassword1`
- `TerraScale2024!`

## Después del registro

Una vez que te registres:

1. Se envía un **email de verificación** a tu dirección
2. Recibes un `pendingAuthenticationToken` para el flujo de verificación
3. Tu cuenta permanece inactiva hasta completar la verificación del email
4. Se crea automáticamente una **organización personal** al completar la verificación

Si el `pendingAuthenticationToken` expira antes de que termines la verificación, inicia nuevamente el flujo de registro para solicitar un token y un código nuevos.

## Respuestas de error

El endpoint de registro puede devolver estos errores comunes:

### 409 Conflict, El email ya existe
```json
{
  "success": false,
  "error": "An account with this email already exists"
}
```

Usa la página de [Login](/account/login/) si ya tienes una cuenta.

### 400 Bad Request, Contraseña inválida
```json
{
  "success": false,
  "error": "Password does not meet requirements"
}
```

Revisa la sección [Requisitos de contraseña](#requisitos-de-contraseña) anterior antes de volver a intentarlo.

### 400 Bad Request, Email inválido
```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

Revisa el payload de la solicitud y asegúrate de que la dirección de email esté correctamente formateada.

## Ejemplo con SDK C#
```csharp
var client = new ManagementClient(new ManagementClientOptions
{
    ApiBaseUrl = "https://api.terrascale.io"
});

var signupResult = await client.Auth.SignupAsync(new SignupRequest(
    Email: "john@example.com",
    Password: "SecurePassword123!",
    FirstName: "John",
    LastName: "Doe"
));

if (signupResult.IsSuccess && signupResult.Value.RequiresEmailVerification)
{
    Console.WriteLine("Check your email for a verification code!");
    // Store the pending token for the verification step.
    // If it expires, start signup again to get a fresh token.
    var pendingToken = signupResult.Value.PendingAuthenticationToken;
}
```

## Próximos pasos

- [Verificación de email](/account/email-verification/) - Completa tu registro
- [Login](/account/login/) - Inicia sesión en tu cuenta
- [Primeros pasos](/guides/getting-started/) - Crea tu primera base de datos
