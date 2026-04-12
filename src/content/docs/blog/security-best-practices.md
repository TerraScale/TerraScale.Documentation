---
title: "Security Best Practices for TerraScale"
date: 2024-09-25
authors:
  - name: Mario Gabriell Karaziaki Belchior
    title: Founder
    url: mailto:mariogk@terrascale.tech
tags:
  - security
  - best-practices
excerpt: Security isn't optional. Here's how to keep your TerraScale databases secure with sensible API key management, MFA, and access controls.
cover:
  wide: /images/blog/security-best-practices/cover-wide.svg
  square: /images/blog/security-best-practices/cover-square.svg
  alt: Layered shield geometry and guarded perimeter nodes, conveying enterprise-grade database security.
---

Security isn't optional. Here's a practical checklist to help you keep your TerraScale databases secure.

## What you'll learn

- How to manage API keys without creating unnecessary risk
- Which account and team controls matter most
- What to review regularly so security stays boring, in the best way

If you're configuring access as you read, keep the [authentication reference](/reference/authentication/), [API keys reference](/reference/management/api-keys/), and [MFA guide](/reference/mfa/) nearby.

## API Key Security

### Use Specific Scopes

Never use `*` for production workloads. Grant only the permissions each service actually needs:
```csharp
// Bad: Full access
{ "scopes": ["*"] }

// Good: Specific permissions
{ "scopes": ["database:read"] }  // Read-only service
{ "scopes": ["database:read", "database:write"] }  // Backend API
{ "scopes": ["repository:read", "repository:write"] }  // Specific to repositories
```

### Separate Keys by Environment

Use different API keys for different environments. That way, a problem in one environment doesn't automatically become a problem everywhere.

| Environment | Key Name | Scopes |
|-------------|----------|--------|
| Production | prod-backend | database:read, database:write |
| Staging | staging-backend | database:read, database:write |
| Development | dev-local | database:* |
| CI/CD | ci-tests | database:read |

### Rotate Keys Regularly

API keys should be rotated every 90 days:

1. Create a new key with the same scopes
2. Update your application configuration
3. Deploy and verify
4. Revoke the old key

### Never Commit Keys

API keys should never be in source control:
```csharp
// Bad: Hardcoded
var apiKey = "ts_live_abc123...";

// Good: Environment variable
var apiKey = Environment.GetEnvironmentVariable("TERRASCALE_API_KEY");

// Good: Secret manager
var apiKey = await secretManager.GetSecretAsync("terrascale-api-key");
```

Add these patterns to your `.gitignore` if they aren't already there:
```
.env
.env.local
*.env
appsettings.Development.json
```

## Account Security

### Enable Two-Factor Authentication

Every account should have 2FA enabled. TerraScale supports:

- **Authenticator apps** (Google Authenticator, Authy, 1Password) - Recommended
- **Email codes** - Good as a backup

To enable:
1. Go to Settings > Security
2. Click "Add Method"
3. Scan the QR code with your authenticator app
4. Enter the verification code

### Use Strong Passwords

Requirements:
- Minimum 12 characters (we recommend 16+)
- Mix of uppercase, lowercase, numbers, symbols
- Unique to TerraScale (not reused from other services)

Consider using a password manager. If one person on your team is still reusing passwords, now is the time to fix it.

### Review Active Sessions

Periodically check Settings > Security > Sessions:

- Look for unfamiliar locations or devices
- Revoke any sessions you don't recognize
- Consider revoking all sessions after password changes

## Team Security

### Principle of Least Privilege

Assign the minimum role needed:

| Role | Use Case |
|------|----------|
| Owner | Only the account creator (one person) |
| Admin | Team leads who need to manage members |
| Member | Developers who create and manage resources |
| Read-only | Auditors, analysts, support staff |

### Audit Team Members

Review your team quarterly:

- Remove people who've left the organization
- Downgrade permissions that are no longer needed
- Verify all members have 2FA enabled

### Handle Departures Promptly

When someone leaves:

1. Remove them from the organization immediately
2. Revoke any API keys they created
3. Review any resources they had access to
4. Consider rotating shared credentials

## Network Security

### Use HTTPS Only

All TerraScale APIs require HTTPS. Never attempt to use HTTP.

### Validate TLS Certificates

Don't disable certificate validation in production:
```csharp
// Never do this in production
ServicePointManager.ServerCertificateValidationCallback = (s, c, ch, e) => true;
```

### IP Allowlisting (Enterprise)

Enterprise customers can restrict API access to specific IP ranges. Contact support to enable this feature. It is especially useful for internal tools and back-office systems with predictable network paths.

## Data Security

### Sensitive Data Handling

Don't store highly sensitive data directly unless you have a clear reason and a documented handling plan:
```csharp
// Bad: Storing raw SSN
["ssn"] = "123-45-6789"

// Better: Store a hash or encrypted value
["ssnHash"] = Hash("123-45-6789")

// Best: Don't store it at all if you don't need it
```

### Encryption at Rest

All data in TerraScale is encrypted at rest using AES-256. This is automatic and requires no configuration.

### Encryption in Transit

All data in transit uses TLS 1.3. This is automatic and required.

Why this matters: infrastructure defaults can protect you from broad classes of mistakes, but they don't replace application-level decisions like scoping secrets correctly or choosing what data should live in the database at all.

## Monitoring and Alerting

### Enable Audit Logs

Track who's accessing your data:

- API key usage by operation type
- Failed authentication attempts
- Administrative actions (member changes, key creation)

### Set Up Alerts

Configure alerts for:

- Unusual API usage patterns
- Failed authentication spikes
- New API key creation
- Team member changes

### Regular Reviews

Monthly security checklist:

- [ ] Review API key usage - any surprises?
- [ ] Check for inactive API keys - revoke them
- [ ] Verify team member list is accurate
- [ ] Confirm all team members have 2FA
- [ ] Review any security alerts

## Incident Response

### If an API Key is Compromised

1. **Revoke immediately** - Don't wait, revoke the key now
2. **Create a new key** - Generate a replacement
3. **Update applications** - Deploy the new key
4. **Audit usage** - Check logs for unauthorized access
5. **Review data** - Look for any data modifications
6. **Document** - Record what happened and how you responded

### If an Account is Compromised

1. **Change password immediately**
2. **Revoke all sessions**
3. **Review and revoke API keys**
4. **Enable 2FA if not already enabled**
5. **Check for unauthorized team members**
6. **Contact support** at mariogk@terrascale.tech

## Summary

Security is everyone's responsibility. The goal is not perfection. The goal is to make the safe path the normal path.

1. Use specific API key scopes
2. Rotate keys every 90 days
3. Enable 2FA for all accounts
4. Use the principle of least privilege
5. Never commit secrets to source control
6. Monitor for unusual activity
7. Have an incident response plan

Questions about security? Contact mariogk@terrascale.tech. For general operational guidance, the [best practices reference](/reference/best-practices/) is also worth bookmarking.
