## 2025-05-15 - [Security Hardening: XSS Protection & CSP]
**Vulnerability:** Potential XSS via `dangerouslySetInnerHTML` when rendering AI-generated or scraped LaTeX content using KaTeX.
**Learning:** Even though KaTeX is mostly safe, rendering unvetted content from LLMs or external sites directly into the DOM is risky. A restrictive CSP and output sanitization are essential defense-in-depth layers.
**Prevention:** Always wrap `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` and configure it to allow only necessary tags (like SVG for KaTeX). Implement a strict CSP to limit the impact of any successful injection.
