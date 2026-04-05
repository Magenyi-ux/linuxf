## 2026-04-04 - [XSS Protection in Math Rendering]
**Vulnerability:** XSS via KaTeX output in `MathText.tsx`. While KaTeX itself is generally safe, rendering its output via `dangerouslySetInnerHTML` without sanitization posed a defense-in-depth risk if the input to KaTeX or KaTeX itself were compromised.
**Learning:** In a browser-side ESM environment (using `importmap` and `esm.sh`), security dependencies like `DOMPurify` must be kept strictly in sync between the `package.json` (for local tooling/types) and the `index.html` importmap (for runtime resolution).
**Prevention:** Mandate the use of `DOMPurify` for all `dangerouslySetInnerHTML` calls. Use specific security profiles (e.g., `mathMl: true`) to ensure complex rendering like LaTeX remains functional while being sanitized.
