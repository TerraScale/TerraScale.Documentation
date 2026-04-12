---
title: Registro de conta
description: Crie uma nova conta TerraScale com verificação de email.
sidebar:
  order: 1
---

Crie uma nova conta TerraScale com seu email, senha e detalhes opcionais de perfil.

## Fluxo de registro

### Etapa 1: Envie o registro

Visite [dashboard.terrascale.io](https://dashboard.terrascale.io) e clique em **Sign Up**, ou chame a API diretamente.

### Etapa 2: Verifique o email

Confira sua caixa de entrada para encontrar um código de verificação e depois informe-o para ativar sua conta.

### Etapa 3: Comece a usar o TerraScale

Depois da verificação, você terá uma organização pessoal pronta para seu primeiro banco de dados.

## Referência da API

### POST /auth/signup

Cria uma nova conta de usuário e inicia o fluxo de verificação de email.

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

## Requisitos de senha

Sua senha deve atender a estes requisitos:

- Mínimo de 8 caracteres
- Pelo menos uma letra maiúscula (A-Z)
- Pelo menos uma letra minúscula (a-z)
- Pelo menos um número (0-9)

**Exemplos de senhas válidas:**
- `SecurePass123`
- `MyPassword1`
- `TerraScale2024!`

## Depois do registro

Depois que você se registra:

1. Um **email de verificação** é enviado para seu endereço
2. Você recebe um `pendingAuthenticationToken` para o fluxo de verificação
3. Sua conta fica inativa até a verificação de email ser concluída
4. Uma **organização pessoal** é criada automaticamente após a verificação

Se o `pendingAuthenticationToken` expirar antes de você concluir a verificação, inicie o fluxo de cadastro novamente para solicitar um token e um código novos.

## Respostas de erro

O endpoint de cadastro pode retornar estes erros comuns:

### 409 Conflict, Email já existe
```json
{
  "success": false,
  "error": "An account with this email already exists"
}
```

Use a página de [Login](/account/login/) se você já tiver uma conta.

### 400 Bad Request, Senha inválida
```json
{
  "success": false,
  "error": "Password does not meet requirements"
}
```

Revise a seção [Requisitos de senha](#requisitos-de-senha) acima antes de tentar novamente.

### 400 Bad Request, Email inválido
```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

Confira o payload da requisição e garanta que o endereço de email esteja formatado corretamente.

## Exemplo com SDK C#
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

## Próximos passos

- [Verificação de email](/account/email-verification/) - Conclua seu registro
- [Login](/account/login/) - Entre na sua conta
- [Primeiros passos](/guides/getting-started/) - Crie seu primeiro banco de dados
