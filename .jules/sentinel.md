## 2025-05-22 - XSS in Dynamic Link Rendering
**Vulnerability:** Potential Cross-Site Scripting (XSS) via `javascript:` URIs in the sources list. The AI Tutor grounding metadata provides source URLs that were being rendered directly in an `<a>` tag's `href` attribute without sanitization.
**Learning:** Even trusted AI models can return malicious or malformed links (either through prompt injection or grounding errors). Rendering dynamic URLs directly into `href` is a high-priority security risk.
**Prevention:** Always sanitize dynamic URLs using a whitelist of safe protocols (http, https, mailto, etc.) and explicitly block `javascript:` and `data:` URIs before rendering them in the DOM.
