## 2025-05-22 - XSS in AI-Generated Grounding Links
**Vulnerability:** Cross-Site Scripting (XSS) via `javascript:` protocol in grounding source links.
**Learning:** AI-generated content (like URLs from grounding chunks) must be treated as untrusted input, even if the model is instructed to be helpful. Direct binding to `href` is a classic XSS vector.
**Prevention:** Implement a `sanitizeUrl` whitelist (allowing only safe protocols like http, https, mailto, tel) and enforce a restrictive Content Security Policy (CSP) as defense-in-depth.
