## 2026-02-20 - Defense-in-Depth against XSS
**Vulnerability:** Lack of Content Security Policy and unsanitized external source links in PracticeSession.
**Learning:** Even if the app is purely offline-first, it still interacts with external CDNs and AI services. If an AI generates a malicious link (e.g., `javascript:alert(1)`), it could lead to XSS if not sanitized. A CSP provides a global safety net.
**Prevention:** Implement a strict CSP meta tag in `index.html` and centralize URL sanitization in a dedicated utility (`lib/security.ts`) to be used for all dynamic links.
