## 2025-03-10 - [XSS Protection for Math Rendering]
**Vulnerability:** The application was using an outdated version of KaTeX (0.16.9) with known XSS vulnerabilities and rendering its output via `dangerouslySetInnerHTML` without sanitization.
**Learning:** Relying on a third-party library's internal escaping is insufficient for defense-in-depth, especially when the library itself has disclosed vulnerabilities.
**Prevention:** Always use a secondary sanitizer (like DOMPurify) when using `dangerouslySetInnerHTML`, and keep security-critical dependencies updated to their latest patched versions.
