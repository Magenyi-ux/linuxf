## 2026-04-22 - [Secure Admin Access and Prevent API Key Leakage]
**Vulnerability:** Hardcoded admin credentials in frontend/backend and API keys leaked via Vite's `define` block.
**Learning:**
1. Hardcoded credentials in SPAs provide no security as they are easily extractable from the source code.
2. Vite's `define` block in `vite.config.ts` bakes variables directly into the client-side bundle, making them public.
3. Using `sessionStorage` for Basic Auth persistence in SPAs is effective when paired with server-side validation.
**Prevention:**
1. Always use environment variables for secrets and keep them server-side.
2. Use serverless functions (like Vercel Functions) as proxies for sensitive API calls.
3. Verify authentication on the backend for all sensitive operations.
4. Ensure `vite.config.ts` does not include sensitive keys in the `define` block.
