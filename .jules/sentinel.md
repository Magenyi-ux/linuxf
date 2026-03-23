## 2026-03-23 - [XSS Protection in Math Rendering]
**Vulnerability:** KaTeX 0.16.9 was vulnerable to certain XSS vectors, and mathematical content was rendered via `dangerouslySetInnerHTML` without sanitization.
**Learning:** Upgrading KaTeX and adding DOMPurify with specific profiles (`svg`, `mathMl`) provides defense-in-depth without breaking complex math rendering.
**Prevention:** Always sanitize any string before passing it to `dangerouslySetInnerHTML`, and keep security-sensitive libraries like KaTeX up to date. Synchronize versions between `package.json` and `index.html` importmaps.
