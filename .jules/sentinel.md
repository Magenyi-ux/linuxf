## 2025-05-15 - XSS in AI Content Rendering
**Vulnerability:** XSS via `dangerouslySetInnerHTML` in `MathText.tsx` when rendering non-LaTeX HTML segments from AI responses.
**Learning:** AI models can sometimes include malicious HTML or be tricked into doing so. Relying on simple string detection (`includes('<')`) to decide whether to render as HTML without sanitization is extremely dangerous. Manual sanitizers must be recursive and handle nested tags carefully to avoid bypasses.
**Prevention:** Always use a robust HTML sanitizer (ideally a library like DOMPurify, or a carefully crafted recursive DOM-based whitelist) when rendering arbitrary HTML. Supplement with a restrictive Content Security Policy (CSP).
