## 2026-04-19 - [Hardcoded Admin Credentials Removal]
**Vulnerability:** Hardcoded admin credentials (`admin@magenyi:magenyi123`) were found in `AdminDashboard.tsx`, `Auth.tsx`, and `api/admin/logs.ts`.
**Learning:** Hardcoding credentials makes it easy for attackers to gain administrative access by just reading the source code.
**Prevention:** Always use environment variables for sensitive credentials and handle authentication on the server-side whenever possible.

## 2026-04-22 - [GEMINI_API_KEY Leakage Prevention]
**Vulnerability:** `GEMINI_API_KEY` was being baked into the client-side bundle via the `define` block in `vite.config.ts`.
**Learning:** Variables in the `define` block are replaced with their values during build, exposing them to the browser.
**Prevention:** Never include sensitive API keys in the frontend build. Use server-side proxies or environment variables that are NOT prefixed with `VITE_` if they shouldn't be exposed.
