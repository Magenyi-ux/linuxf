## 2025-05-15 - XSS Prevention and KaTeX Upgrade
**Vulnerability:** Cross-Site Scripting (XSS) risk via `dangerouslySetInnerHTML` in `MathText.tsx` and use of vulnerable KaTeX 0.16.9.
**Learning:** Rendering external content (AI responses, scraped data) via `dangerouslySetInnerHTML` without sanitization creates an XSS vector, even if the intermediate processor (KaTeX) is generally trusted.
**Prevention:** Always sanitize dynamic HTML with `DOMPurify` before using `dangerouslySetInnerHTML`. Implement a strict Content Security Policy (CSP) and keep security-sensitive dependencies like KaTeX updated.
