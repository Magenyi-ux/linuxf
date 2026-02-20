## 2026-02-20 - XSS Vulnerability in Math Rendering
**Vulnerability:** The MathText component used dangerouslySetInnerHTML on arbitrary strings, allowing execution of malicious scripts.
**Learning:** Sanitize arbitrary HTML content using a whitelist approach. Avoid sanitizing KaTeX output directly as it relies on specific tags (like SVG) that are often blocked by standard whitelists, which would break math rendering.
**Prevention:** Implement defense-in-depth with a Content Security Policy (CSP) and use restrictive sanitization for non-library HTML content.
