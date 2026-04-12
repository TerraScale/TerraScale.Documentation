---
title: Account Registration
description: Create a new TerraScale account with email verification.
sidebar:
  order: 1
---

Create a new TerraScale account with your email, password, and optional profile details.

## Registration Flow

### Step 1: Submit Registration

Visit [dashboard.terrascale.io](https://dashboard.terrascale.io) and click **Sign Up**, or call the API directly.

### Step 2: Verify Email

Check your inbox for a verification code, then enter it to activate your account.

### Step 3: Start Using TerraScale

After verification, you'll have a personal organization ready for your first database.

## API Reference

### POST /auth/signup

Creates a new user account and starts the email verification flow.

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

## Password Requirements

Your password must meet these requirements:

- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)

**Example of valid passwords:**
- `SecurePass123`
- `MyPassword1`
- `TerraScale2024!`

## After Registration

Once you register:

1. A **verification email** is sent to your address
2. You receive a `pendingAuthenticationToken` for the verification flow
3. Your account is inactive until email verification is complete
4. A **personal organization** is created automatically upon verification

If the `pendingAuthenticationToken` expires before you finish verification, start the signup flow again to request a fresh token and code.

## Error Responses

The signup endpoint can return these common errors:

### 409 Conflict, Email Already Exists
```json
{
  "success": false,
  "error": "An account with this email already exists"
}
```

Use the [Login](/account/login/) page if you already have an account.

### 400 Bad Request, Invalid Password
```json
{
  "success": false,
  "error": "Password does not meet requirements"
}
```

Review the [Password Requirements](#password-requirements) section above before trying again.

### 400 Bad Request, Invalid Email
```json
{
  "success": false,
  "error": "Invalid email address format"
}
```

Check the request payload and make sure the email address is formatted correctly.

## C# SDK Example
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

## Next Steps

- [Email Verification](/account/email-verification/) - Complete your registration
- [Login](/account/login/) - Sign in to your account
- [Getting Started](/guides/getting-started/) - Create your first database
