## 2025-03-16 - [KaTeX XSS Prevention]
**Vulnerability:** KaTeX versions < 0.16.21 were susceptible to multiple XSS and bypass vulnerabilities. Additionally, the app used `dangerouslySetInnerHTML` to render KaTeX output without sanitization.
**Learning:** Even "safe" renderers like KaTeX can have vulnerabilities. Using `dangerouslySetInnerHTML` is always a risk, especially when rendering content derived from LLMs which could be manipulated.
**Prevention:** Always pin security-critical dependencies to known safe versions. Use `DOMPurify` with appropriate profiles (`html`, `svg`, `svgFilters`) to sanitize HTML even when it comes from trusted libraries like KaTeX.
