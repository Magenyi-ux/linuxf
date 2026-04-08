# Sentinel's Security Journal

## 2026-04-04 - [CRITICAL] Hardcoded API Keys in Frontend and Scripts
**Vulnerability:** Found hardcoded NVIDIA API keys in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoding secrets is a common but high-risk practice that occurs when developers prioritize speed or convenience over security, especially in early development or automation scripts.
**Prevention:** Always use environment variables for secrets. Implement a `.env.example` file and update `.gitignore` from the start of the project. Use pre-commit hooks or CI/CD scanners to detect secrets before they are committed.
