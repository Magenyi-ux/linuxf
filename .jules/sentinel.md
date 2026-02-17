## 2025-05-22 - [URL Sanitization and CSP Enhancement]
**Vulnerability:** Potential XSS through malicious URLs in AI-generated content (e.g., javascript: URIs) and lack of defense-in-depth against unauthorized resource loading.
**Learning:** Even grounded AI responses can contain malicious or malformed URLs that could execute arbitrary code if rendered directly in an `href` attribute. A restrictive CSP is essential for PWAs that rely on multiple external CDNs to ensure they don't load unauthorized scripts or styles.
**Prevention:** Always sanitize dynamic URLs using a whitelist of safe protocols (http, https, mailto, tel). Implement a restrictive CSP meta tag to provide a second layer of defense against XSS and unauthorized resource loading.
