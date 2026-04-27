# Sentinel Security Journal

## 2026-04-22 - [Critical] Hardcoded Admin Credentials and Secret Leakage
**Vulnerability:** Hardcoded admin credentials in frontend components and API handlers, and sensitive API keys bundled into the client via Vite `define`.
**Learning:** Hardcoding credentials in frontend code is a major risk as they are visible to anyone. Even in "internal" dashboards, using hardcoded strings for Basic Auth is insecure. Vite's `define` block can accidentally leak server-side environment variables if not carefully managed.
**Prevention:** Always use environment variables for secrets. Verify credentials server-side. Ensure Vite `define` only includes public, non-sensitive configuration. Use `.env.example` to document required secrets without exposing them.
