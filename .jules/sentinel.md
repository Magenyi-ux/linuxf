## 2025-05-15 - [XSS Protection in Math Rendering]
**Vulnerability:** Cross-Site Scripting (XSS) in `MathText.tsx` due to unsanitized rendering of KaTeX output via `dangerouslySetInnerHTML`.
**Learning:** KaTeX output can contain potentially malicious HTML or SVG if the input is untrusted (e.g., AI-generated content). Standard sanitization can strip necessary math elements.
**Prevention:** Use `DOMPurify` with `USE_PROFILES: { html: true, svg: true, svgFilters: true }` to sanitize KaTeX output while preserving mathematical symbols and layout. Pin security-critical dependencies like `katex` to versions with known vulnerability fixes (0.16.21+).
