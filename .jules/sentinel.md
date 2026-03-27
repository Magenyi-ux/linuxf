## 2025-05-22 - [KaTeX XSS Prevention and Dependency Integrity]
**Vulnerability:** Outdated KaTeX (v0.16.9) with known XSS vulnerabilities and lack of output sanitization when rendering LaTeX via `dangerouslySetInnerHTML`.
**Learning:** Even well-known libraries like KaTeX can have protocol bypass and filename-based XSS vulnerabilities. Trusting the library output directly without a secondary sanitization layer violates "Defense in Depth".
**Prevention:** Pin security-critical dependencies to safe versions (e.g., KaTeX v0.16.21+) and always sanitize generated HTML using `DOMPurify` with appropriate profiles (`html`, `svg`, `svgFilters`) before rendering. Maintain strict version parity between `package.json` and `index.html` import maps.
