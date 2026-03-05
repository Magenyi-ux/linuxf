## 2025-05-15 - [XSS Protection in LaTeX Rendering]
**Vulnerability:** XSS via `dangerouslySetInnerHTML` in `MathText.tsx` when rendering KaTeX output.
**Learning:** While KaTeX output is generally trusted, wrapping it in `DOMPurify.sanitize` provides defense-in-depth against malformed or malicious inputs that might bypass KaTeX's internal sanitization or exploit vulnerabilities in the library itself.
**Prevention:** Always wrap `dangerouslySetInnerHTML` with `DOMPurify.sanitize()`. For KaTeX, ensure the configuration allows `svg`, `use`, and `path` tags along with necessary attributes like `d`, `viewBox`, and `transform`.
