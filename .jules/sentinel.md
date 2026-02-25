## 2025-05-15 - [XSS Protection in MathText]
**Vulnerability:** XSS via dangerouslySetInnerHTML in MathText.tsx when rendering non-LaTeX HTML content.
**Learning:** AI-generated content (e.g. from Gemini) can contain malicious HTML tags if not properly sanitized, especially when the app logic explicitly allows rendering raw HTML for formatting.
**Prevention:** Always use a robust sanitizer like DOMPurify when using dangerouslySetInnerHTML, and implement a restrictive CSP as a second layer of defense.
