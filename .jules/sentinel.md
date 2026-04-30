## 2026-04-22 - [CRITICAL] Remove Hardcoded Admin Credentials and Prevent API Key Leakage
**Vulnerability:** Hardcoded admin credentials (`admin@magenyi:magenyi123`) were used for both frontend and backend authentication. Additionally, the `GEMINI_API_KEY` was being injected into the client bundle via Vite's `define` block.
**Learning:** Hardcoding credentials in both client and server code creates a single point of failure and leaks secrets. Injecting server-side API keys into the client bundle makes them visible to any user.
**Prevention:** Use environment variables for all secrets. Implement backend-verified authentication for sensitive endpoints. Ensure that only necessary variables (prefixed with `VITE_`) are exposed to the frontend, and avoid using `define` for sensitive keys.
