# Security Guidelines for `company-dashboard-realtime`

This document defines the security principles and best practices tailored to the **company-dashboard-realtime** project—a dual-application system built with Next.js, Supabase, Drizzle ORM, Tailwind CSS, and deployed on Vercel. Adhering to these guidelines will help ensure a robust, maintainable, and secure codebase by design.

## Table of Contents

1. [Authentication & Access Control](#authentication--access-control)
2. [Input Validation & Output Encoding](#input-validation--output-encoding)
3. [Data Protection & Privacy](#data-protection--privacy)
4. [API & Real-Time Service Security](#api--real-time-service-security)
5. [Web Application Security Hygiene](#web-application-security-hygiene)
6. [Infrastructure & Configuration Management](#infrastructure--configuration-management)
7. [Dependency Management](#dependency-management)
8. [Testing, Monitoring & Incident Response](#testing-monitoring--incident-response)

---

## 1. Authentication & Access Control

### 1.1 Supabase Auth Integration
- Replace existing `better-auth` with `@supabase/auth-helpers-nextjs`.
- Enforce **Secure Defaults**:
  - Mandatory password complexity and length policies.
  - Argon2 or bcrypt for password hashing (Supabase manages this for built-in auth).
  - HTTPS-only authentication endpoints.

### 1.2 Role-Based Access Control (RBAC)
- Define two primary roles: `admin` and `viewer`.
- Store roles as a custom claim in the JWT or in a `profiles` table.
- Enforce server-side checks in Next.js middleware within `/app/(admin)/middleware.ts`:
  - Verify the token’s signature and `role` claim.
  - Deny access (HTTP 403) if `role !== 'admin'` for write routes.

### 1.3 Session Management & Token Security
- Use Supabase’s built-in session management with secure, rotating refresh tokens.
- Set the following cookie attributes:
  - `Secure` (TLS only), `HttpOnly` (no JS access), `SameSite=Strict`.
- Validate `exp` and `iat` claims on every request.
- Implement a logout endpoint that revokes refresh tokens.

### 1.4 Row-Level Security (RLS)
- **Enable RLS** on every table in Supabase.
- Example `todos` policies:
  - `SELECT`: authenticated users.
  - `INSERT/UPDATE/DELETE`: only where `auth.jwt().claims.role = 'admin'`.
- Continuously review and test policies in the Supabase dashboard.

---

## 2. Input Validation & Output Encoding

### 2.1 Server-Side Input Validation
- Never trust client input. Use Zod or Yup schemas in Server Actions.
- Validate all JSON bodies, query params, and route params.
- Whitelist allowed values for enums, IDs, and file extensions.

### 2.2 Preventing Injection Attacks
- Use Drizzle ORM’s parameterized queries; avoid raw SQL when possible.
- For any raw queries, sanitize inputs diligently.

### 2.3 Output Encoding & XSS Mitigation
- Escape user-generated content in React components.
- Use `dangerouslySetInnerHTML` only when sanitized with a library like DOMPurify.
- Enforce a strict **Content Security Policy**:
  ```plaintext
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://YOUR_SUPABASE_URL;
  ```

---

## 3. Data Protection & Privacy

### 3.1 Encryption
- Enforce TLS 1.2+ for all client-server and server-database communications.
- Supabase encrypts data at rest by default; verify this in your project settings.

### 3.2 Secrets Management
- Do **not** commit `.env` files. Store Supabase keys in Vercel environment variables or a secrets manager.
- Rotate API keys periodically.

### 3.3 Logging & Error Handling
- Do not expose stack traces or PII in logs or API responses.
- Use structured logging (e.g., Winston or pino) with log levels.
- Mask or truncate sensitive fields (passwords, tokens).

---

## 4. API & Real-Time Service Security

### 4.1 Enforce HTTPS Everywhere
- Redirect all HTTP traffic to HTTPS in Vercel and Next.js `redirects` configuration.

### 4.2 Rate Limiting & Throttling
- Implement rate limits on authentication endpoints and real-time subscriptions.
- Use Vercel Edge or a middleware like `express-rate-limit` adapted for Next.js.

### 4.3 CORS Policy
- Restrict CORS to approved origins (your Display Portal and Admin Dashboard domains). Example:
  ```js
  // next.config.js
  module.exports = {
    async headers() {
      return [{
        source: '/api/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' }]
      }]
    }
  }
  ```

### 4.4 Secure Real-Time Subscriptions
- Only establish `supabase.channel` subscriptions after validating user session and role.
- Tear down subscriptions on sign-out.

---

## 5. Web Application Security Hygiene

### 5.1 CSRF Protection
- For any state-changing API route, use anti-CSRF tokens (e.g., `next-csrf`).

### 5.2 Security Headers
- Add the following in `next.config.js`:
  ```js
  securityHeaders: [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Referrer-Policy', value: 'no-referrer' }
  ]
  ```

### 5.3 Cookie Security
- Ensure all cookies set by Supabase and Next.js use `Secure`, `HttpOnly`, `SameSite=Strict`.

---

## 6. Infrastructure & Configuration Management

### 6.1 Environment Hardening
- Run Node.js in non-root mode within Docker.
- Disable unnecessary ports and services.

### 6.2 TLS Configuration
- Use only TLS 1.2+ cipher suites in Vercel settings.

### 6.3 Deployment Practices
- Disable Next.js debug and SWR verbose logs in production.
- Enable automatic security patching in your CI/CD pipeline.

---

## 7. Dependency Management

- Lock dependencies with `pnpm-lock.yaml` (or `package-lock.json`).
- Regularly run SCA tools (e.g., `npm audit`, Snyk) in CI.
- Remove unused libraries to minimize attack surface.

---

## 8. Testing, Monitoring & Incident Response

### 8.1 Security Testing
- E2E tests (Playwright/Cypress) for auth flows and real-time updates.
- Integration tests to verify RLS policies and API error handling.

### 8.2 Monitoring & Alerts
- Integrate error monitoring (Sentry) for runtime exceptions and auth failures.
- Set up dashboards to track rate-limiting events and unusual traffic patterns.

### 8.3 Incident Response
- Define a runbook for revoking compromised keys and rotating secrets.
- Establish a communication plan for notifying stakeholders in case of a breach.

---

By following these guidelines, the **company-dashboard-realtime** application will be architected with multiple layers of defense, secure by default, and resilient against common web vulnerabilities. Continuous review and testing are essential to maintain a robust security posture as the codebase evolves.