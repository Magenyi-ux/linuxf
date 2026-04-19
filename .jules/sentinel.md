# Sentinel Security Journal 🛡️

## 2026-04-19 - [Critical] Hardcoded Secrets and API Key Leakage
**Vulnerability:** Found hardcoded admin credentials (`admin@magenyi` / `admin123`) in `components/Auth.tsx` and GEMINI_API_KEY being leaked to the client via Vite's `define` block in `vite.config.ts`.
**Learning:** Vite's `define` feature replaces global constants at build time, which can unintentionally expose sensitive environment variables to the browser bundle. Hardcoded credentials in frontend logic are easily discoverable.
**Prevention:** Never use hardcoded credentials. Use server-side authentication and ensure environment variables intended for server-side use are not included in Vite's `define` or prefixed with `VITE_` unless absolutely necessary for public configuration.
