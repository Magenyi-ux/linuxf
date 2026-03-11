# SENTINEL'S JOURNAL - CRITICAL LEARNINGS ONLY

This journal records critical security learnings and vulnerability patterns specific to this codebase.

## 2025-05-15 - XSS via Unsanitized LaTeX Rendering
**Vulnerability:** The `MathText.tsx` component used `dangerouslySetInnerHTML` to render HTML from `katex.renderToString()` without any sanitization. Combined with an outdated version of KaTeX (0.16.9) which has known vulnerabilities (e.g., GHSA-3wc5-fcw2-2329), this presented an XSS risk if the input LaTeX was malformed or malicious.
**Learning:** Even though libraries like KaTeX are generally considered safe for rendering math, they can have bugs or features (like `\includegraphics` or custom macros) that might be exploitable if the version is old or the output is not sanitized.
**Prevention:** Always sanitize output from `dangerouslySetInnerHTML` using a library like DOMPurify, even when it comes from a trusted renderer. Ensure that the sanitization profile includes necessary elements (SVG for KaTeX) while blocking dangerous ones. Keep security-sensitive dependencies like KaTeX updated to the latest patched versions.
