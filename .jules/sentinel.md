## 2026-04-04 - Removal of Hardcoded NVIDIA API Keys
**Vulnerability:** Hardcoded NVIDIA API keys were found in `services/aiService.ts` and `scripts/scraper.js`, and legacy `GEMINI_API_KEY` was being explicitly exposed to the client in `vite.config.ts`.
**Learning:** Developers often hardcode keys during rapid prototyping or debugging, and legacy configuration can persist even after migrating to new providers.
**Prevention:** Use environment variables (prefixed with `VITE_` for frontend access) and strictly enforce `.gitignore` for `.env` files. Regularly audit `vite.config.ts` for unnecessary `define` blocks.
