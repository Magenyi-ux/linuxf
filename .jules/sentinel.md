## 2026-05-08 - Hardcoded Secrets and API Key Leakage
**Vulnerability:** Multiple hardcoded administrative credentials and AI API keys were present in both frontend components and backend serverless functions. Additionally, Vite's `define` configuration was explicitly injecting secrets into the client-side bundle.
**Learning:** Development-time convenience led to "temporary" hardcoded credentials and configuration patterns that bypassed secure environment variable handling, exposing the application to unauthorized administrative access and API key theft.
**Prevention:** Always use a server-side proxy for authenticated API calls to prevent key exposure in the browser. Enforce the use of environment variables for all secrets and validate their presence at startup or request time with "fail-secure" logic. Avoid using Vite's `define` for sensitive data.

## 2026-05-08 - Client-Side Session Management Trade-offs
**Vulnerability:** Storing administrative credentials in `sessionStorage` or `localStorage` in plaintext creates an XSS risk.
**Learning:** In a decoupled frontend architecture without a traditional secure cookie session, developers often resort to storing credentials client-side to maintain state across refreshes.
**Prevention:** Transition to HttpOnly, Secure, SameSite=Strict cookies for session management to mitigate XSS-based credential theft. Avoid storing sensitive credentials in plaintext in web storage.
