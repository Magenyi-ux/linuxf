## 2025-05-14 - [XSS vulnerability in math rendering component]
**Vulnerability:** The `MathText.tsx` component used `dangerouslySetInnerHTML` to render KaTeX output without any sanitization. While KaTeX is generally safe, using an outdated version (0.16.9) with known vulnerabilities and no defense-in-depth sanitization presented a risk of XSS through malicious LaTeX input.
**Learning:** Even well-known libraries like KaTeX can have vulnerabilities. Always use the latest secure version and implement secondary sanitization for untrusted inputs being rendered as HTML.
**Prevention:** Use `dompurify` to sanitize HTML output from third-party rendering libraries before inserting it into the DOM. Keep critical security dependencies pinned to known secure versions.
