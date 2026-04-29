## 2026-04-22 - Fix hardcoded credentials and API key leakage
**Vulnerability:** Hardcoded admin credentials in frontend and backend; API key leakage via Vite's `define` block.
**Learning:** Hardcoded credentials and global `define` injections in `vite.config.ts` are high-risk patterns that easily leak secrets into client-side bundles.
**Prevention:** Always use environment variables for secrets, ensure they are only accessible where needed (e.g., server-side), and verify client bundles for accidental secret inclusion.
