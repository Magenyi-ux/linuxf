## 2025-05-15 - [XSS Prevention & Dependency Upgrade]
**Vulnerability:** XSS risk via unsanitized LaTeX rendering and outdated KaTeX version with known CVEs.
**Learning:** `dangerouslySetInnerHTML` was used with KaTeX output without sanitization. KaTeX 0.16.9 was vulnerable to GHSA-3wc5-fcw2-2329 and GHSA-f98w-7cxr-ff2h.
**Prevention:** Always sanitize third-party library output (like KaTeX) using DOMPurify before rendering. Keep math-related dependencies updated and use SRI hashes for external assets.
