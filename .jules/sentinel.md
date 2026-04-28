## 2026-04-22 - Removal of Hardcoded Administrative Credentials
**Vulnerability:** The application contained hardcoded admin credentials (`admin@magenyi:magenyi123`) in both the frontend components and backend API endpoints, allowing anyone with source access to gain administrative privileges.
**Learning:** Hardcoded credentials are often left during early development for convenience but create critical security risks if not removed before deployment.
**Prevention:** Always use environment variables for sensitive configuration and implement a dynamic authentication flow that verifies credentials against the backend.

## 2026-04-22 - Prevention of Client-Side Secret Leakage
**Vulnerability:** The `vite.config.ts` was configured to bundle the `GEMINI_API_KEY` into the frontend code via the `define` block, exposing the secret to anyone inspecting the browser's JavaScript.
**Learning:** Vite's `define` and `loadEnv` can unintentionally bake secrets into the production bundle if not carefully managed.
**Prevention:** Only expose public configuration to the frontend using the `VITE_` prefix and avoid including sensitive keys in the `define` block of the build configuration.
