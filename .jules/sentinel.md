## 2026-03-31 - [Vulnerable KaTeX & Missing Sanitization]
**Vulnerability:** KaTeX version 0.16.9 was vulnerable to multiple moderate security issues, including protocol bypass and XSS risks. Additionally, MathText rendered KaTeX output using `dangerouslySetInnerHTML` without sanitization, posing a secondary XSS risk.
**Learning:** Even though KaTeX is a math rendering library, its output can contain HTML/SVG that could be manipulated if the input is untrusted. Version 0.16.9 had known vulnerabilities that were patched in later releases.
**Prevention:** Always use the latest stable version of rendering libraries and sanitize any HTML output before injecting it into the DOM with `dangerouslySetInnerHTML`, even if the source is considered "safe" library output.
