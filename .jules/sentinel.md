# Sentinel Security Journal

## 2024-05-20 - Unsanitized HTML rendering in MathText
**Vulnerability:** The `MathText` component used `dangerouslySetInnerHTML` to render segments containing raw HTML tags without any sanitization. This allowed any HTML content (including malicious `<script>` or `onerror` attributes) from AI responses or user chat messages to be executed in the browser.
**Learning:** The application's offline fallback data and AI-generated content frequently contain HTML tags (like `<p>`, `<br>`, `<tbody>`, etc.) for formatting, which misled the original implementation into assuming that raw rendering was safe and necessary.
**Prevention:** Always use a robust sanitizer like `DOMPurify` when rendering dynamic content as HTML, even if the source is an internal AI model or trusted dataset.
