## 2025-05-15 - XSS Vulnerability in MathText Rendering
**Vulnerability:** The MathText component was using dangerouslySetInnerHTML on unsanitized input strings that looked like HTML.
**Learning:** Even when using a math library like KaTeX, any fallback logic that handles mixed HTML/Text must sanitize the HTML segments to prevent XSS. AI-generated explanations or user-provided chat messages can easily contain malicious scripts if not sanitized.
**Prevention:** Always use a robust sanitization library like DOMPurify when using dangerouslySetInnerHTML. Implement a Content Security Policy (CSP) as an additional layer of defense to block unauthorized script execution.
