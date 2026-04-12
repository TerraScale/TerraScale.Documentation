---
title: Cliente de gerenciamento C#
description: Guia para usar o TerraScale Management Client para contas de usuário, organizações e cobrança.
sidebar:
  order: 2
  badge:
    text: Novo
    variant: tip
---

O TerraScale Management Client ajuda você a lidar com login, dados de perfil, organizações, cobrança e outras operações em nível de conta a partir de C#.

Se você quer o caminho mais curto até uma sessão funcional, use primeiro o início rápido. O restante do guia detalha cada área com mais profundidade.

## Início rápido

### 1. Instale o pacote
```bash
dotnet add package TerraScale.Management.Client
```

### 2. Crie o cliente
```csharp
using TerraScale.Management.Client;

var client = new ManagementClient(new ManagementClientOptions
{
    ApiBaseUrl = "https://api.terrascale.io"
});
```

### 3. Faça login
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

### 4. Busque seu perfil e organizações
```csharp
var profileResult = await client.Users.GetCurrentUserAsync();
var orgsResult = await client.Organizations.ListAsync();
```

### 5. Crie uma chave de API
```csharp
var keyResult = await client.ApiKeys.CreateAsync(new CreateApiKeyRequest(
    Name: "Local Development",
    Scopes: new[] { "database:read", "database:write" },
    ExpiresAt: DateTime.UtcNow.AddMonths(6)
));
```

## Instalação
```bash
dotnet add package TerraScale.Management.Client
```

## Configuração
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

## Convenções de tratamento de erros

A maioria das operações de gerenciamento retorna valores `Result<T>`. Verifique `IsSuccess` antes de ler `Value`, e exponha as mensagens de erro retornadas para usuários ou logs.

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

Para fluxos de login, verifique tanto o resultado quanto o status retornado. Uma chamada HTTP bem-sucedida ainda pode exigir MFA ou verificação de email antes que a sessão esteja pronta.

## Subclientes disponíveis

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

## Autenticação

### Login com senha
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

### Trate MFA
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

### Atualize o token
```csharp
var refreshResult = await client.Auth.RefreshTokenAsync(new RefreshTokenRequest(
    RefreshToken: "rt_abc123..."
));

if (refreshResult.IsSuccess)
{
    client.SetAccessToken(refreshResult.Value.AccessToken);
}
```

### Troque de organização
```csharp
var switchResult = await client.Auth.SwitchOrganizationAsync(new SwitchOrganizationRequest(
    OrganizationId: "org_def456"
));
```

## Operações de usuário

### Obtenha o perfil
```csharp
var userResult = await client.Users.GetCurrentUserAsync();

if (userResult.IsSuccess)
{
    Console.WriteLine($"Hello, {userResult.Value.Name}!");
    Console.WriteLine($"Email: {userResult.Value.Email}");
    Console.WriteLine($"Theme: {userResult.Value.Preferences.Theme}");
}
```

### Atualize o perfil
```csharp
var updateResult = await client.Users.UpdateCurrentUserAsync(new UpdateUserRequest(
    Name: "John D. Doe",
    AvatarUrl: "https://example.com/avatar.jpg"
));
```

### Atualize preferências
```csharp
var prefsResult = await client.Users.UpdatePreferencesAsync(new UpdateUserPreferencesRequest(
    Theme: "dark",
    Timezone: "America/New_York",
    DefaultRegion: "us-east-1"
));
```

## Operações de organização

### Crie uma organização
```csharp
var createOrgResult = await client.Organizations.CreateAsync(new CreateOrganizationRequest(
    Name: "Acme Corporation",
    Slug: "acme-corp",
    BillingEmail: "billing@acme.com"
));
```

### Liste organizações
```csharp
var listResult = await client.Organizations.ListAsync();

foreach (var org in listResult.Value.Organizations)
{
    Console.WriteLine($"{org.OrganizationName} ({org.Role})");
}
```

### Gerencie membros
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

## Operações de banco de dados

### Crie um banco de dados
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

### Liste bancos de dados
```csharp
var listResult = await client.Databases.ListAsync();

foreach (var db in listResult.Value.Databases)
{
    Console.WriteLine($"{db.Name} - {db.Status} ({db.Region})");
}
```

### Exclua um banco de dados
```csharp
var deleteResult = await client.Databases.DeleteAsync("db_abc123");
```

## Operações com chaves de API

### Crie uma chave de API
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

### Liste chaves de API
```csharp
var listResult = await client.ApiKeys.ListAsync();

foreach (var key in listResult.Value.Keys)
{
    Console.WriteLine($"{key.Name} ({key.KeyPrefix}...)");
}
```

### Revogue uma chave de API
```csharp
var revokeResult = await client.ApiKeys.RevokeAsync("key_abc123");
```

## Operações de pagamento

### Obtenha informações da assinatura
```csharp
var paymentInfo = await client.Payment.GetPaymentInfoAsync();

if (paymentInfo.IsSuccess)
{
    Console.WriteLine($"Plan: {paymentInfo.Value.PlanName}");
    Console.WriteLine($"Status: {paymentInfo.Value.Status}");
}
```

### Obtenha uso
```csharp
var usageResult = await client.Payment.GetUsageAsync();

if (usageResult.IsSuccess)
{
    Console.WriteLine($"Databases: {usageResult.Value.DatabaseCount}");
    Console.WriteLine($"Storage: {usageResult.Value.TotalStorageGb} GB");
    Console.WriteLine($"Requests: {usageResult.Value.TotalRequests}");
}
```

### Crie o checkout
```csharp
var checkoutResult = await client.Payment.CreateCheckoutAsync(new CreateCheckoutRequest("pro"));

if (checkoutResult.IsSuccess)
{
    // Redirect user to checkout URL
    Console.WriteLine($"Checkout: {checkoutResult.Value.CheckoutUrl}");
}
```

### Obtenha o portal de cobrança
```csharp
var portalResult = await client.Payment.GetPortalUrlAsync();

if (portalResult.IsSuccess)
{
    Console.WriteLine($"Portal: {portalResult.Value.PortalUrl}");
}
```

## Operações de plano

### Liste planos
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

### Obtenha detalhes do plano
```csharp
var planResult = await client.Plans.GetAsync("plan_pro");
```

## Exemplo completo de login
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

## Próximos passos

- [Cliente de banco de dados C#](/guides/sdks/csharp/) - Operações de banco de dados
- [Organizations](/reference/organizations/) - Gerenciamento de organizações
- [Billing](/reference/billing/) - Detalhes da assinatura
