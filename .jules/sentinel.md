## 2025-05-22 - URL Sanitization and CSP Implementation
**Vulnerability:** Potential XSS via untrusted source URLs and lack of Content Security Policy.
**Learning:** Even if data comes from a trusted AI source, grounding metadata URLs should be treated as untrusted user input. A restrictive CSP is essential for defense-in-depth, especially when using multiple external CDNs.
**Prevention:** Always sanitize dynamic links using a whitelist approach and maintain a strict CSP that specifically allows only known-good origins and required inline behaviors.
