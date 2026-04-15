## 2026-04-04 - [CRITICAL] Removal of Hardcoded Secrets and Insecure Configuration
**Vulnerability:** Found hardcoded NVIDIA API keys in `services/aiService.ts` and `scripts/scraper.js`, along with an insecure `define` block in `vite.config.ts` that leaked legacy keys.
**Learning:** Hardcoding secrets is a common but severe vulnerability that exposes API credentials to anyone with access to the source code. The insecure `define` block in Vite further amplified this by injecting secrets into the production bundle.
**Prevention:** Always use environment variables for sensitive credentials. Ensure `.env` files are in `.gitignore` and provide a `.env.example` for reference. Avoid using `define` to inject secrets; use Vite's built-in `VITE_` prefix mechanism for client-side exposure.
