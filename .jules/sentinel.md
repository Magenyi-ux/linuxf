## 2025-05-22 - XSS Vulnerability in Math Rendering
**Vulnerability:** The `MathText.tsx` component was using `dangerouslySetInnerHTML` to render both KaTeX output and raw HTML segments without any sanitization. This allowed for potential Cross-Site Scripting (XSS) if the AI or external sources provided malicious HTML.
**Learning:** Even trusted sources like AI-generated content can occasionally include malformed or malicious HTML tags. Rendering such content directly into the DOM is always a risk.
**Prevention:** Use `dompurify` to sanitize all HTML content before using `dangerouslySetInnerHTML`. Additionally, implement a Content Security Policy (CSP) as a defense-in-depth measure to limit the execution of unauthorized scripts.
