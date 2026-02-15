## 2025-05-15 - [XSS Prevention via URL Sanitization]
**Vulnerability:** Dynamic links in the practice session used externally-provided URLs (from AI grounding metadata) without sanitization, allowing for potential XSS via `javascript:` URIs.
**Learning:** Even if data comes from a "trusted" AI model, it should be treated as untrusted user input when rendered in the UI, especially in attributes like `href`.
**Prevention:** Centralized sanitization utility `lib/security.ts` whitelists safe protocols (http, https, mailto, tel) and blocks dangerous ones.
