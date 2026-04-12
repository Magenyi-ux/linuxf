## 2026-04-04 - [Hardcoded NVIDIA API Keys]
**Vulnerability:** Found hardcoded NVIDIA NIM API keys in `services/aiService.ts` and `scripts/scraper.js`.
**Learning:** Hardcoding secrets in source code, especially for frontend services or build scripts, exposes them to anyone with access to the repository and can lead to unauthorized usage and cost spikes. Vite's `import.meta.env` and Node's `process.env` should be used instead.
**Prevention:** Always use environment variables for sensitive keys. Implement a `.env.example` file to document required secrets and ensure `.env` files are in `.gitignore`. Use a 'VITE_' prefix for variables intended for the frontend.
