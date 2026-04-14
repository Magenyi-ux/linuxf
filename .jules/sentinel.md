## 2026-04-04 - Hardcoded NVIDIA API Keys
**Vulnerability:** Hardcoded NVIDIA NIM API keys were found in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoding secrets in source code is a critical vulnerability that leads to unauthorized resource usage and potential account compromise. Even if the repository is private, secrets can leak through build artifacts or developer environments.
**Prevention:** Always use environment variables for secrets. For Vite-based frontends, use the `VITE_` prefix. Maintain a `.env.example` file to document required keys without exposing them, and strictly ignore `.env` files in `.gitignore`.
