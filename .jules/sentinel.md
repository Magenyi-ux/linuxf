## 2025-05-14 - Content Security Policy for AI Applications
**Vulnerability:** Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` in `MathText.tsx` and AI-generated content.
**Learning:** In applications using third-party CDNs (like Tailwind via script tag) and AI services (Gemini), a CSP must explicitly whitelist these domains and might require `'unsafe-inline'` for styles injected by the CDN.
**Prevention:** Implement a restrictive CSP meta tag as a defense-in-depth layer to restrict resource loading and script execution to trusted domains, even if individual components lack full sanitization.
