## 2026-02-24 - Cross-Site Scripting (XSS) in MathText Component
**Vulnerability:** The `MathText` component was using `dangerouslySetInnerHTML` to render raw strings that contained HTML-like characters (`<` and `>`) without any sanitization. This allowed arbitrary JavaScript execution via payloads like `<img src=x onerror=alert(1)>`.
**Learning:** Even components intended for "safe" rendering (like LaTeX) can have fallback logic that is dangerously permissive. Identifying these patterns requires checking all uses of `dangerouslySetInnerHTML`.
**Prevention:** Always use a robust sanitization library like `DOMPurify` when rendering dynamic HTML. Add automated security tests (like the Playwright scripts used here) to verify that XSS payloads are neutralized.
