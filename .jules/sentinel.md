# 🛡️ Sentinel Security Journal

## 2025-05-15 - [Insecure LaTeX Rendering]
**Vulnerability:** LaTeX content rendered via `katex` was injected into the DOM using `dangerouslySetInnerHTML` without any sanitization.
**Learning:** Even though `katex` generates relatively safe HTML, it can still be a vector for XSS if malicious input bypasses the parser or if an outdated version is used.
**Prevention:** Always sanitize any HTML generated from third-party libraries using a trusted sanitizer like `DOMPurify` before injecting it into the DOM.
