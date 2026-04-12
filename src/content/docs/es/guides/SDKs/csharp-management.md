---
title: Cliente de gestión C#
description: Guía para usar TerraScale Management Client para cuentas de usuario, organizaciones y facturación.
sidebar:
  order: 2
  badge:
    text: Nuevo
    variant: tip
---

El TerraScale Management Client te ayuda a gestionar login, datos de perfil, organizaciones, facturación y otras operaciones a nivel de cuenta desde C#.

Si quieres el camino más corto hacia una sesión funcional, usa primero el inicio rápido. El resto de la guía desarrolla cada área con más detalle.

## Inicio rápido

### 1. Instala el paquete
```bash
dotnet add package TerraScale.Management.Client
```

### 2. Crea el cliente
```csharp
using TerraScale.Management.Client;

var client = new ManagementClient(new ManagementClientOptions
{
    ApiBaseUrl = "https://api.terrascale.io"
});
```

### 3. Inicia sesión
```csharp
var loginResult = await client.Auth.LoginWithPasswordAsync(new PasswordLoginRequest(
    Email: "john@example.com",
    Password: "SecurePassword123!"
));

if (loginResult.IsSuccess && loginResult.Value.Status == PasswordLoginStatus.Success)
{
    client.SetAccessToken(loginResult.Value.AuthResponse!.AccessToken);
}
```

### 4. Obtén tu perfil y organizaciones
```csharp
var profileResult = await client.Users.GetCurrentUserAsync();
var orgsResult = await client.Organizations.ListAsync();
```

### 5. Crea una clave de API
```csharp
var keyResult = await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Local Development",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddMonths(6)
));
```

## Instalación
```bash
dotnet add package TerraScale.Management.Client
```

## Configuración
```csharp
using TerraScale.Management.Client;

// Create the management client
var client = new ManagementClient(new ManagementClientOptions
{
    ApiBaseUrl = "https://api.terrascale.io"
});

// Set access token after login
client.SetAccessToken("eyJhbGci...");
```

## Convenciones de manejo de errores

La mayoría de las operaciones de gestión devuelven valores `Result<T>`. Comprueba `IsSuccess` antes de leer `Value`, y muestra los mensajes de error devueltos a usuarios o registros.

```csharp
var profileResult = await client.Users.GetCurrentUserAsync();

if (profileResult.IsSuccess)
{
    Console.WriteLine($"Hello, {profileResult.Value.Name}!");
}
else
{
    foreach (var error in profileResult.Errors)
    {
        Console.WriteLine($"Request failed: {error.Message}");
    }
}
```

Para los flujos de login, comprueba tanto el resultado como el estado devuelto. Una llamada HTTP exitosa aún puede requerir MFA o verificación de email antes de que la sesión esté lista.

## Subclientes disponibles

| Sub-Client | Interface | Purpose |
|------------|-----------|---------|
| `Auth` | `IAuthClient` | Login, signup, token refresh, MFA |
| `Users` | `IUserClient` | User profile management |
| `Organizations` | `IOrganizationClient` | Organization and team management |
| `Databases` | `IDatabaseClient` | Database provisioning |
| `ApiKeys` | `IApiKeyClient` | API key management |
| `Payment` | `IPaymentClient` | Subscriptions and billing |
| `Plans` | `IPlanClient` | Available plans |
| `Items` | `IItemClient` | Database item operations |
| `Repositories` | `IRepositoryClient` | Repository operations |

## Autenticación

### Login con contraseña
```csharp
var loginResult = await client.Auth.LoginWithPasswordAsync(new PasswordLoginRequest(
    Email: "john@example.com",
    Password: "SecurePassword123!"
));

if (loginResult.IsSuccess && loginResult.Value.Status == PasswordLoginStatus.Success)
{
    client.SetAccessToken(loginResult.Value.AuthResponse!.AccessToken);
    Console.WriteLine($"Logged in as {loginResult.Value.AuthResponse.Email}");
}
```

### Maneja MFA
```csharp
if (loginResult.Value.Status == PasswordLoginStatus.MfaRequired)
{
    var pendingInfo = loginResult.Value.PendingInfo!;

    // Get code from user
    Console.Write("Enter MFA code: ");
    var code = Console.ReadLine();

    // Verify MFA
    var mfaResult = await client.Auth.VerifyMfaAsync(new MfaVerifyRequest(
        PendingAuthenticationToken: pendingInfo.PendingAuthenticationToken,
        ChallengeId: pendingInfo.Challenge!.Id,
        Code: code!
    ));

    if (mfaResult.IsSuccess)
    {
        client.SetAccessToken(mfaResult.Value.AccessToken);
    }
}
```

### Refresca el token
```csharp
var refreshResult = await client.Auth.RefreshTokenAsync(new RefreshTokenRequest(
    RefreshToken: "rt_abc123..."
));

if (refreshResult.IsSuccess)
{
    client.SetAccessToken(refreshResult.Value.AccessToken);
}
```

### Cambia de organización
```csharp
var switchResult = await client.Auth.SwitchOrganizationAsync(new SwitchOrganizationRequest(
    OrganizationId: "org_def456"
));
```

## Operaciones de usuario

### Obtén el perfil
```csharp
var userResult = await client.Users.GetCurrentUserAsync();

if (userResult.IsSuccess)
{
    Console.WriteLine($"Hello, {userResult.Value.Name}!");
    Console.WriteLine($"Email: {userResult.Value.Email}");
    Console.WriteLine($"Theme: {userResult.Value.Preferences.Theme}");
}
```

### Actualiza el perfil
```csharp
var updateResult = await client.Users.UpdateCurrentUserAsync(new UpdateUserRequest(
    Name: "John D. Doe",
    AvatarUrl: "https://example.com/avatar.jpg"
));
```

### Actualiza preferencias
```csharp
var prefsResult = await client.Users.UpdatePreferencesAsync(new UpdateUserPreferencesRequest(
    Theme: "dark",
    Timezone: "America/New_York",
    DefaultRegion: "us-east-1"
));
```

## Operaciones de organización

### Crea una organización
```csharp
var createOrgResult = await client.Organizations.CreateAsync(new CreateOrganizationRequest(
    Name: "Acme Corporation",
    Slug: "acme-corp",
    BillingEmail: "billing@acme.com"
));
```

### Lista organizaciones
```csharp
var listResult = await client.Organizations.ListAsync();

foreach (var org in listResult.Value.Organizations)
{
    Console.WriteLine($"{org.OrganizationName} ({org.Role})");
}
```

### Gestiona miembros
```csharp
// List members
var membersResult = await client.Organizations.ListMembersAsync("org_abc123");

// Invite member
var inviteResult = await client.Organizations.AddMemberAsync("org_abc123", new AddMemberRequest(
    Email: "newmember@example.com",
    Role: "member"
));

// Update role
var roleResult = await client.Organizations.UpdateMemberAsync("org_abc123", "usr_def456",
    new UpdateMemberRequest(Role: "admin"));

// Remove member
var removeResult = await client.Organizations.RemoveMemberAsync("org_abc123", "usr_def456");
```

## Operaciones de base de datos

### Crea una base de datos
```csharp
var createResult = await client.Databases.CreateAsync(new CreateDatabaseRequest(
    Name: "my-production-db",
    Region: "us-east-1"
));

if (createResult.IsSuccess)
{
    Console.WriteLine($"Database created: {createResult.Value.DatabaseId}");
}
```

### Lista bases de datos
```csharp
var listResult = await client.Databases.ListAsync();

foreach (var db in listResult.Value.Databases)
{
    Console.WriteLine($"{db.Name} - {db.Status} ({db.Region})");
}
```

### Elimina una base de datos
```csharp
var deleteResult = await client.Databases.DeleteAsync("db_abc123");
```

## Operaciones con claves de API

### Crea una clave de API
```csharp
var createResult = await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Production API Key",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddYears(1)
));

if (createResult.IsSuccess)
{
    // Important: Save this key - it's only shown once!
    Console.WriteLine($"API Key: {createResult.Value.ApiKey}");
}
```

### Lista claves de API
```csharp
var listResult = await client.ApiKeys.ListAsync();

foreach (var key in listResult.Value.Keys)
{
    Console.WriteLine($"{key.Name} ({key.KeyPrefix}...)");
}
```

### Revoca una clave de API
```csharp
var revokeResult = await client.ApiKeys.RevokeAsync("key_abc123");
```

## Operaciones de pago

### Obtén información de suscripción
```csharp
var paymentInfo = await client.Payment.GetPaymentInfoAsync();

if (paymentInfo.IsSuccess)
{
    Console.WriteLine($"Plan: {paymentInfo.Value.PlanName}");
    Console.WriteLine($"Status: {paymentInfo.Value.Status}");
}
```

### Obtén uso
```csharp
var usageResult = await client.Payment.GetUsageAsync();

if (usageResult.IsSuccess)
{
    Console.WriteLine($"Databases: {usageResult.Value.DatabaseCount}");
    Console.WriteLine($"Storage: {usageResult.Value.TotalStorageGb} GB");
    Console.WriteLine($"Requests: {usageResult.Value.TotalRequests}");
}
```

### Crea el checkout
```csharp
var checkoutResult = await client.Payment.CreateCheckoutAsync(new CreateCheckoutRequest("pro"));

if (checkoutResult.IsSuccess)
{
    // Redirect user to checkout URL
    Console.WriteLine($"Checkout: {checkoutResult.Value.CheckoutUrl}");
}
```

### Obtén el portal de facturación
```csharp
var portalResult = await client.Payment.GetPortalUrlAsync();

if (portalResult.IsSuccess)
{
    Console.WriteLine($"Portal: {portalResult.Value.PortalUrl}");
}
```

## Operaciones de planes

### Lista planes
```csharp
var plansResult = await client.Plans.ListAsync();

if (plansResult.IsSuccess)
{
    foreach (var plan in plansResult.Value)
    {
        Console.WriteLine($"{plan.Name}: ${plan.MonthlyPriceCents / 100}/month");
        foreach (var feature in plan.Features)
        {
            Console.WriteLine($"  - {feature.Name}");
        }
    }
}
```

### Obtén detalles del plan
```csharp
var planResult = await client.Plans.GetAsync("plan_pro");
```

## Ejemplo completo de login
```csharp
using TerraScale.Management.Client;

var client = new ManagementClient(new ManagementClientOptions
{
    ApiBaseUrl = "https://api.terrascale.io"
});

// Login
var loginResult = await client.Auth.LoginWithPasswordAsync(new PasswordLoginRequest(
    Email: "john@example.com",
    Password: "SecurePassword123!"
));

if (!loginResult.IsSuccess)
{
    Console.WriteLine("Login failed");
    return;
}

switch (loginResult.Value.Status)
{
    case PasswordLoginStatus.Success:
        client.SetAccessToken(loginResult.Value.AuthResponse!.AccessToken);
        break;

    case PasswordLoginStatus.MfaRequired:
        Console.Write("Enter MFA code: ");
        var code = Console.ReadLine();

        var mfaResult = await client.Auth.VerifyMfaAsync(new MfaVerifyRequest(
            PendingAuthenticationToken: loginResult.Value.PendingInfo!.PendingAuthenticationToken,
            ChallengeId: loginResult.Value.PendingInfo.Challenge!.Id,
            Code: code!
        ));

        if (mfaResult.IsSuccess)
        {
            client.SetAccessToken(mfaResult.Value.AccessToken);
        }
        break;

    case PasswordLoginStatus.EmailVerificationRequired:
        Console.WriteLine("Please verify your email first");
        return;

    default:
        Console.WriteLine("Login failed");
        return;
}

// Now use the client
var userResult = await client.Users.GetCurrentUserAsync();
Console.WriteLine($"Welcome, {userResult.Value.Name}!");

// Cleanup
await client.DisposeAsync();
```

## Próximos pasos

- [Cliente de base de datos C#](/guides/sdks/csharp/) - Operaciones de base de datos
- [Organizations](/reference/organizations/) - Gestión de organizaciones
- [Billing](/reference/billing/) - Detalles de la suscripción
