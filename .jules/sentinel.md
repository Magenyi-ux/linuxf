# Sentinel Security Journal 🛡️

## 2025-05-15 - KaTeX Fonts and CSP Configuration
**Vulnerability:** Potential XSS through dynamic links and lack of resource whitelisting.
**Learning:** Implementing a restrictive Content Security Policy (CSP) in an app using KaTeX requires explicit `font-src` entries for the CDNs serving the fonts (e.g., `cdn.jsdelivr.net`), otherwise math symbols will not render correctly even if the main CSS is allowed in `style-src`.
**Prevention:** When adding CSP to projects with external UI libraries, always check the console for font or worker-related blocks during verification.
