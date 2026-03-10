# Sentinel's Security Journal

## 2026-03-10 - [XSS Protection & Dependency Upgrade]
**Vulnerability:** Moderate security vulnerabilities in KaTeX (versions < 0.16.21) including XSS bypass and unsanitized attribute names. Potential XSS risk from rendering untrusted AI/scraped content via `dangerouslySetInnerHTML`.
**Learning:** KaTeX output can contain potentially unsafe HTML/SVG if not properly handled, especially when used with `dangerouslySetInnerHTML`. Relying on older versions of common libraries like KaTeX and not sanitizing their output exposes the app to XSS risks from generated question content.
**Prevention:**
1. Always keep security-sensitive dependencies like KaTeX and DOMPurify up to date.
2. Use Subresource Integrity (SRI) hashes for critical external assets.
3. Sanitized all HTML generated from untrusted sources (even if processed by another library like KaTeX) using `DOMPurify` before rendering it in React.
4. Use `USE_PROFILES: { html: true, svg: true, svgFilters: true }` in DOMPurify to maintain LaTeX rendering while ensuring safety.
