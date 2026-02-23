## 2026-02-23 - XSS Prevention in AI-Generated Content
**Vulnerability:** The `MathText` component used `dangerouslySetInnerHTML` to render AI-generated content without sanitization, exposing the app to XSS via prompt injection.
**Learning:** Even with defense-in-depth measures like CSP, sanitizing all content rendered as HTML is mandatory when the source is untrusted or potentially manipulatable.
**Prevention:** Always use `dompurify` to sanitize HTML content before passing it to `dangerouslySetInnerHTML`.
