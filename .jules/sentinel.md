
## 2026-02-16 - XSS Prevention and CSP Implementation
**Vulnerability:** Potential XSS via unsanitized grounding source links from AI and lack of a Content Security Policy (CSP).
**Learning:** AI-generated content (like grounding metadata URIs) can be a vector for XSS if used directly in `href` attributes, as prompt injection or model error could lead to `javascript:` URIs. A restrictive CSP provides a critical second layer of defense by limiting script execution and resource loading to trusted domains.
**Prevention:** Always sanitize dynamic URLs with a whitelist-based approach and enforce a strict CSP that only allows trusted domains.
