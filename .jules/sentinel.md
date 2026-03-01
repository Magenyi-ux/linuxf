## 2026-03-01 - [KaTeX HTML Sanitization with DOMPurify]
**Vulnerability:** Cross-Site Scripting (XSS) via unsanitized HTML output from KaTeX rendered through `dangerouslySetInnerHTML`.
**Learning:** Default `DOMPurify` configuration strips out MathML and SVG elements/attributes, which are essential for KaTeX rendering.
**Prevention:** When sanitizing KaTeX output, always use `DOMPurify.sanitize(html, { USE_PROFILES: { mathMl: true, svg: true } })` to maintain rendering integrity while protecting against XSS. Additionally, always use Subresource Integrity (SRI) hashes when loading security-critical libraries from CDNs.
