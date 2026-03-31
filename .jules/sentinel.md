## 2025-05-15 - KaTeX XSS Protection and Version Update
**Vulnerability:** KaTeX versions prior to 0.16.21 contain multiple vulnerabilities, including protocol bypass and unescaped filenames, which could lead to XSS. Additionally, rendering untrusted LaTeX via `dangerouslySetInnerHTML` without sanitization poses a high security risk.
**Learning:** Even specialized rendering libraries like KaTeX can have vulnerabilities in how they handle complex inputs (SVG, URLs). Relying solely on the library's internal safety is not enough for defense-in-depth.
**Prevention:** Always pin security-critical dependencies to known patched versions and use a robust sanitizer like DOMPurify (with appropriate profiles for SVG/HTML) when rendering output from these libraries via `dangerouslySetInnerHTML`.
