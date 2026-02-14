# Sentinel Journal - Critical Security Learnings

## 2025-05-15 - AI Grounding Metadata XSS Risk
**Vulnerability:** XSS via un-sanitized AI-generated grounding metadata URLs.
**Learning:** AI models with Google Search grounding return URLs as part of their metadata. If these URLs are rendered directly in an `<a>` tag's `href` attribute without sanitization, it can lead to XSS if the model returns a `javascript:` or `data:` URI.
**Prevention:** Always use a central `sanitizeUrl` utility to whitelist safe protocols (http, https, mailto, tel) when rendering dynamic links from AI-generated or external content.
