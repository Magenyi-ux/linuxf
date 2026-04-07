## 2026-04-04 - [Hardcoded NVIDIA API Keys]
**Vulnerability:** Found hardcoded NVIDIA API keys in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoding secrets in the source code exposes them to anyone with access to the repository, leading to potential unauthorized usage and cost implications.
**Prevention:** Always use environment variables for sensitive information and provide a `.env.example` file to document required configurations.
