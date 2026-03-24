## 2025-03-24 - [KaTeX XSS Prevention and Dependency Upgrade]
**Vulnerability:** Outdated KaTeX (0.16.9) with multiple moderate-severity vulnerabilities (bypassing forbidden protocols, unescaped filenames, Unicode sub/superscripts).
**Learning:** Even well-known libraries like KaTeX can have rendering-related XSS vulnerabilities; using them with `dangerouslySetInnerHTML` without an additional sanitization layer is a high-risk pattern.
**Prevention:** Always pin security-critical dependencies to patched versions and implement a "defense-in-depth" strategy by sanitizing all HTML output from third-party renderers (like KaTeX) using `DOMPurify` with appropriate profiles (`mathMl`, `svg`).
