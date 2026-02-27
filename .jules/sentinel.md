## 2025-05-15 - [XSS and CSP Implementation]
**Vulnerability:** XSS via `dangerouslySetInnerHTML` in `MathText.tsx` and missing Content Security Policy.
**Learning:** AI-generated and scraped content often contains raw HTML segments that bypass standard React escaping. Relying solely on KaTeX's `throwOnError` is insufficient for overall component security.
**Prevention:** Always wrap `dangerouslySetInnerHTML` with `DOMPurify.sanitize()` and implement a restrictive CSP as a defense-in-depth measure to block unauthorized script execution.
