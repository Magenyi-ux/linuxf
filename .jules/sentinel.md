## 2026-04-22 - Hardcoded Admin Credentials and API Key Leakage
**Vulnerability:** Hardcoded admin credentials were found in `api/admin/logs.ts`, `components/AdminDashboard.tsx`, and `components/Auth.tsx`. Additionally, `GEMINI_API_KEY` was being leaked to the client-side bundle via `vite.config.ts`.
**Learning:** Initial prototyping often leads to hardcoded secrets for convenience, but these must be moved to environment variables before deployment. Using Vite's `define` can accidentally expose server-side secrets to the browser.
**Prevention:** Always use environment variables for secrets. Only prefix variables with `VITE_` if they are intended to be public. Avoid hardcoding any credentials, even for admin accounts.
