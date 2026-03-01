## 2025-05-14 - Content Security Policy for AI Applications
**Vulnerability:** Cross-Site Scripting (XSS) via `dangerouslySetInnerHTML` in `MathText.tsx` and AI-generated content.
**Learning:** In applications using third-party CDNs (like Tailwind via script tag) and AI services (Gemini), a CSP must explicitly whitelist these domains and might require `'unsafe-inline'` for styles injected by the CDN.
**Prevention:** Implement a restrictive CSP meta tag as a defense-in-depth layer to restrict resource loading and script execution to trusted domains, even if individual components lack full sanitization.

## 2025-05-15 - DOM Sanitization for Dynamic AI Content
**Vulnerability:** Persistent XSS via `dangerouslySetInnerHTML` in components rendering AI-generated or scraped HTML (e.g., `MathText.tsx`).
**Learning:** CSP provides defense-in-depth, but a misconfigured or overly permissive CSP (like one allowing `unsafe-inline`) can be bypassed. Explicit sanitization using a library like `DOMPurify` at the component level is necessary to ensure that dynamic HTML content is stripped of active scripts and event handlers.
**Prevention:** Always wrap `dangerouslySetInnerHTML` values with `DOMPurify.sanitize()`. For LaTeX rendering, sanitize the output of libraries like KaTeX as well, as they may generate HTML that could be exploited if the input is malicious.
