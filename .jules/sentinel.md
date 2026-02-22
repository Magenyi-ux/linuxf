## 2025-05-14 - XSS Vulnerability in MathText Rendering
**Vulnerability:** Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` in the `MathText` component.
**Learning:** The application was rendering raw HTML strings from AI-generated content and fallback data without sanitization. This allowed execution of malicious scripts via attributes like `onerror`.
**Prevention:** Always sanitize any HTML rendered through `dangerouslySetInnerHTML`. Using a library like `dompurify` with a strict whitelist of tags and attributes is a robust way to allow safe formatting while blocking malicious payloads. Complementing this with a Content Security Policy (CSP) provides defense-in-depth.
