## 2026-04-22 - [CRITICAL] Removal of Hardcoded Admin Credentials and Secret Leakage Fix

**Vulnerability:** Hardcoded administrator credentials (`admin@magenyi:magenyi123`, `admin@magenyi:admin123`) were present in `api/admin/logs.ts`, `components/AdminDashboard.tsx`, and `components/Auth.tsx`. Additionally, `GEMINI_API_KEY` was being leaked to the client-side bundle via Vite's `define` block.

**Learning:** Hardcoded credentials provided a "backdoor" and a single point of failure. Explicitly defining environment variables in `vite.config.ts`'s `define` block bypasses Vite's built-in `VITE_` prefix protection, baking secrets into the public JS bundle.

**Prevention:**
1. Use server-side environment variables (`process.env`) for backend authentication.
2. Only expose necessary frontend configuration via the `VITE_` prefix.
3. Avoid the `define` block for sensitive keys in `vite.config.ts`.
4. Implement role-based access control (RBAC) in the UI based on environment-configured identifiers (e.g., `VITE_ADMIN_EMAIL`) rather than hardcoded strings.
