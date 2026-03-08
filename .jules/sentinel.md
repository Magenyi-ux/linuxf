## 2025-05-15 - [Secure KaTeX Rendering]
**Vulnerability:** XSS via `dangerouslySetInnerHTML` when rendering mathematical content from AI or external sources.
**Learning:** Outdated versions of KaTeX (e.g. 0.16.9) have known vulnerabilities, and raw library output should still be sanitized if passed to React's inner HTML sink.
**Prevention:** Always use `DOMPurify.sanitize()` with `USE_PROFILES: { html: true, svg: true, svgFilters: true }` to allow KaTeX's SVG-based math symbols while stripping malicious scripts. Upgrade `katex` regularly and maintain SRI hashes for external CSS.
