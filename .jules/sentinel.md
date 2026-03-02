## 2025-03-02 - [Defense-in-Depth for Math Rendering & Content Security]
**Vulnerability:** XSS risk via `dangerouslySetInnerHTML` in `MathText.tsx` and missing Content Security Policy (CSP).
**Learning:** Even when using reputable libraries like KaTeX for rendering, wrapping output in `DOMPurify.sanitize()` is a critical defense-in-depth measure, especially when content originates from LLMs or external scrapes. Upgrading CDN-hosted dependencies requires careful management of Subresource Integrity (SRI) hashes to prevent regression in security posture.
**Prevention:** Always sanitize any HTML rendered via `dangerouslySetInnerHTML`. Implement a restrictive CSP from day one. Use automated tools to generate and verify SRI hashes when updating external assets.
