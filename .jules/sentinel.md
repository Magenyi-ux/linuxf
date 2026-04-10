## 2026-04-04 - Removal of Hardcoded NVIDIA API Keys
**Vulnerability:** Found hardcoded NVIDIA API keys in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoding keys is a common convenience during initial development but poses a high security risk if the code is committed to a version control system.
**Prevention:** Always use environment variables for sensitive information (secrets, API keys) and ensure `.env` files are ignored by git. Provide a `.env.example` for documentation.
