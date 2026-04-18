## 2026-04-04 - [CRITICAL] Hardcoded NVIDIA API Keys Removal
**Vulnerability:** Hardcoded NVIDIA NIM API keys were found in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoded secrets in client-side code or scripts that might be committed to version control expose the service to unauthorized usage and potential financial or reputational damage.
**Prevention:** Always use environment variables for API keys and sensitive configuration. Use `.env.example` to document required variables without exposing actual secrets. Ensure `vite.config.ts` does not leak keys via `define` if they are not strictly necessary for the build.
