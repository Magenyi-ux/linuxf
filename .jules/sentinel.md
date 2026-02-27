## 2025-05-15 - [XSS vulnerability in MathText rendering]
**Vulnerability:** Use of `dangerouslySetInnerHTML` without sanitization in `MathText.tsx`.
**Learning:** Raw strings containing HTML-like characters were being passed directly to `dangerouslySetInnerHTML`, providing an XSS vector.
**Prevention:** Always wrap content in `DOMPurify.sanitize()` when using `dangerouslySetInnerHTML`.

## 2025-05-15 - [Missing CSP and Defense in Depth]
**Vulnerability:** Lack of Content Security Policy (CSP) headers or meta tags.
**Learning:** Without a CSP, the browser has no secondary defense against XSS if sanitization is bypassed.
**Prevention:** Implement a restrictive CSP that whitelists only necessary domains for scripts, styles, fonts, and API connections.
