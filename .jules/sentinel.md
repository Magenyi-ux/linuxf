## 2026-04-04 - [XSS Protection for Math Rendering]
**Vulnerability:** Use of `dangerouslySetInnerHTML` for KaTeX output without sanitization. Although KaTeX is generally safe, it's a high-priority security concern when handling content that might be influenced by AI or external data.
**Learning:** Upgrading to the latest KaTeX (0.16.44) and adding DOMPurify (3.3.3) provides defense-in-depth. Use of `<importmap>` requires strict synchronization with `package.json`.
**Prevention:** Always sanitize any HTML passed to `dangerouslySetInnerHTML`. Use SRI hashes for external CSS to prevent subresource tampering.
