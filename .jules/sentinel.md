## 2026-02-18 - XSS Prevention via CSP and URL Sanitization
**Vulnerability:** Missing Content Security Policy (CSP) and lack of URL sanitization for AI-generated grounding sources, which could lead to XSS via malicious protocols (e.g., `javascript:`).
**Learning:** Even with safe libraries like KaTeX, defense in depth is necessary. AI-generated content (like URLs) should always be treated as untrusted and sanitized before rendering in the DOM.
**Prevention:** Implement a restrictive CSP meta tag in the HTML entry point and centralize URL sanitization in a reusable utility function that uses a whitelist approach for protocols.
