## 2025-05-15 - KaTeX Sanitization and Dependency Update
**Vulnerability:** XSS risk via unsanitized `dangerouslySetInnerHTML` when rendering KaTeX output, and use of outdated `katex` dependency with known vulnerabilities.
**Learning:** Even though KaTeX is often trusted, its output should be sanitized when handling AI-generated or scraped content to prevent potential XSS attacks if the input is malformed or malicious.
**Prevention:** Always wrap KaTeX output in `DOMPurify.sanitize()` and keep security-critical dependencies like `katex` and `dompurify` pinned to their latest secure versions with SRI hashes.
