## 2025-05-22 - [XSS via javascript: URLs]
**Vulnerability:** Grounded AI sources were used directly in the 'href' attribute of anchor tags without validation, allowing for XSS via 'javascript:' URIs.
**Learning:** Even though the data comes from a trusted AI provider (Gemini), it should be treated as untrusted input when used in dangerous sinks like 'href'.
**Prevention:** Always sanitize URLs before rendering them in links by checking for the protocol or specifically blocking 'javascript:'.
