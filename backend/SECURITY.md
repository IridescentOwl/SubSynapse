# Security

This document outlines the security measures that have been implemented in this application.

## Security Headers

The application uses the `helmet` middleware to set various security headers, including:

*   **Content-Security-Policy:** Helps prevent cross-site scripting (XSS) and other code injection attacks.
*   **Strict-Transport-Security:** Enforces secure (HTTP over SSL/TLS) connections to the server.
*   **X-Content-Type-Options:** Prevents browsers from MIME-sniffing a response away from the declared content-type.
*   **X-Frame-Options:** Provides clickjacking protection.

## Rate Limiting

The application uses the `express-rate-limit` middleware to protect against brute-force and denial-of-service attacks. Two tiers of rate limiting have been implemented:

*   **Strict:** Applied to sensitive authentication routes, such as `/login` and `/register`.
*   **Default:** Applied to all other routes.

## Input Validation and Sanitization

The application uses the `express-validator` middleware to validate and sanitize all user-supplied data. This helps prevent common vulnerabilities, such as XSS and SQL injection.

## CSRF Protection

The application uses a stateless, JWT-based authentication system that relies on the `Authorization` header. This is not vulnerable to CSRF attacks, so no additional CSRF protection is required.

## API Key Authentication

Admin functions are protected by API key authentication. The API key is a randomly generated string that is stored as a hashed value in the database. The `apiKeyMiddleware` validates the API key on all admin routes.

## SQL Injection Prevention

The application uses the Prisma ORM, which provides strong protection against SQL injection attacks. All database queries are parameterized, and no raw SQL queries are used.

## Data Encryption

The application uses the `crypto` module to encrypt sensitive data at rest. The following fields are encrypted:

*   **User:** `name`
*   **WithdrawalRequest:** `upiId`
*   **Credential:** `credentials`

## Audit Logging

The application has a comprehensive audit logging system that records all security-critical actions, including:

*   User registration
*   Login attempts (successful and failed)
*   Password reset requests
*   Credential access
*   Profile updates
*   Account deactivation
*   Withdrawal requests

## Bot Detection

The application uses a simple honeypot-based bot detection mechanism on the registration and forgot password routes. This provides a basic level of protection against automated attacks.

## Suspicious Activity Monitoring

The application has a `SuspiciousActivityService` that analyzes the audit logs for patterns of suspicious behavior, such as multiple failed login attempts from the same IP address and rapid requests. This provides a foundation for proactive threat detection.
