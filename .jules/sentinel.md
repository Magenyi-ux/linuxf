# Sentinel Security Journal - Critical Learnings Only

## 2026-04-19 - Admin Credential Synchronization & API Security
**Vulnerability:** Hardcoded admin credentials were split across components with different passwords (`admin123` vs `magenyi123`), and the Admin API logs were accessible via a hardcoded base64 string in the serverless function. Additionally, `GEMINI_API_KEY` was being leaked into the client-side bundle via Vite's `define` block.
**Learning:** Hardcoded credentials and "security through obscurity" (like base64 encoding a password in source code) are fragile and easily bypassed. Vite's `define` block is a common vector for accidental secret leakage if not carefully managed.
**Prevention:** Always use environment variables for sensitive data on the server-side. For frontend secrets, use Vite's `VITE_` prefixing mechanism ONLY if the secret is intended for public consumption; otherwise, use a backend proxy. Centralize authentication logic and avoid duplicating sensitive values across the codebase. Ensure that state management for authenticated sessions (like Basic Auth headers) is correctly persisted to avoid runtime errors when components re-render.
