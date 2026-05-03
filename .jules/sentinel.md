## 2026-04-22 - [CRITICAL] Removal of Hardcoded Admin Credentials and API Key Leakage
**Vulnerability:** Hardcoded admin credentials were found in multiple locations: `api/admin/logs.ts` (Basic Auth), `AdminDashboard.tsx` (Login gate), and `Auth.tsx` (Admin role assignment). Additionally, `GEMINI_API_KEY` was being leaked to the client-side bundle via the `define` block in `vite.config.ts`.

**Learning:** Vite's `define` block globally replaces occurrences of variables in the source code during build, which can easily lead to baking sensitive environment variables directly into the production JavaScript assets, making them visible to anyone inspecting the frontend code.

**Prevention:** Always use `import.meta.env` for environment variables in Vite. Keep server-side secrets strictly in serverless functions (e.g., `api/` folder) and never expose them via `vite.config.ts`'s `define` or `VITE_` prefix unless they are intended to be public. Backend endpoints should always verify credentials against environment variables, not hardcoded strings.
