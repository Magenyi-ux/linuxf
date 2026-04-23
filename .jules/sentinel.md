# Sentinel Security Journal

## 2026-04-22 - [Critical] Removal of Hardcoded Credentials and API Key Leaks
**Vulnerability:** Hardcoded admin credentials (`admin@magenyi:magenyi123` and `admin@magenyi:admin123`) were found in both frontend components (`Auth.tsx`, `AdminDashboard.tsx`) and backend API handlers (`api/admin/logs.ts`). Additionally, `GEMINI_API_KEY` was being baked into the client-side bundle via `vite.config.ts`.
**Learning:** Hardcoded credentials and insecure build-time environment variable injection are common pitfalls that expose sensitive administrative access and API keys to anyone with access to the client-side bundle.
**Prevention:** Use server-side environment variables for authentication and avoid using `define` or `VITE_` prefixes for sensitive secrets that should never reach the browser. Use proxy endpoints to handle API calls that require secrets.
