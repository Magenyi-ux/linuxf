## 2025-05-14 - KaTeX Upgrade and HTML Sanitization
**Vulnerability:** Use of `dangerouslySetInnerHTML` for KaTeX output without sanitization, and outdated KaTeX version (0.16.9) with known vulnerabilities.
**Learning:** Even though KaTeX is generally safe, "defense in depth" requires sanitizing any HTML injected into the DOM. Using `DOMPurify` with SVG profiles is necessary to preserve math rendering while preventing XSS.
**Prevention:** Always sanitize dynamic HTML with `DOMPurify`. Maintain exact dependency versions and matching SRI hashes in `index.html` for critical security libraries.
