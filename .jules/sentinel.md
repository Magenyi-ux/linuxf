# Sentinel Journal 🛡️

## 2025-05-22 - [Reusable Security Pattern: URL Sanitization]
**Vulnerability:** Potential XSS via malicious URLs in AI-generated grounding data (sources).
**Learning:** AI models can sometimes generate or reference URLs that might contain dangerous protocols like `javascript:`. Directly injecting these into `href` attributes creates an XSS vector.
**Prevention:** Always sanitize dynamic URLs using a whitelist of safe protocols (http, https, mailto, tel). The `sanitizeUrl` function in `lib/security.ts` should be used for all dynamic links.
