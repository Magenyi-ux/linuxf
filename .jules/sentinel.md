## 2025-05-15 - [KaTeX Vulnerability and XSS Protection]
**Vulnerability:** KaTeX version 0.16.9 was identified to have several vulnerabilities (protocol bypass, unescaped filenames, maxExpand bypass) and the application was also lacking HTML sanitization when rendering math content.
**Learning:** Even specialized libraries like KaTeX can have security vulnerabilities, and rendering AI-generated or external content with `dangerouslySetInnerHTML` without sanitization is a significant XSS risk.
**Prevention:** Upgrade dependencies regularly, use SRI hashes for external assets, and always sanitize HTML content before rendering with `dangerouslySetInnerHTML`.
