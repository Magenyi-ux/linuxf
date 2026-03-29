## 2025-05-14 - [XSS Protection in LaTeX Rendering]
**Vulnerability:** The application was using `dangerouslySetInnerHTML` to render KaTeX output without sanitization. Additionally, the KaTeX version (0.16.9) was vulnerable to several CVEs including uncontrolled recursion (DoS) and XSS via `\htmlData`.
**Learning:** Even though KaTeX is a specialized library, its output can contain HTML, SVG, and MathML which can be exploited if the input is untrusted (e.g., AI-generated or user-provided). Simple `renderToString` is not enough for defense-in-depth.
**Prevention:** Always sanitize HTML output from third-party renderers using a library like DOMPurify with appropriate profiles (`html`, `svg`, `mathMl`). Keep security-critical dependencies like KaTeX updated to the latest patched versions.
