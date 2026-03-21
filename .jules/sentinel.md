## 2025-05-15 - [High] XSS Vulnerability in KaTeX Rendering

**Vulnerability:** The application was using an outdated version of KaTeX (0.16.9) which has several known security vulnerabilities, including XSS protocol bypass and unescaped filenames in `\includegraphics`. Furthermore, the output of `katex.renderToString` was being directly injected into the DOM using `dangerouslySetInnerHTML` without any sanitization.

**Learning:** Even though libraries like KaTeX are generally considered safe, they can still have vulnerabilities. Directly using `dangerouslySetInnerHTML` is always a risk, especially when combined with user-provided or third-party content (like AI-generated questions) that might contain malicious LaTeX. The importmap in `index.html` also needs to be kept in sync with `package.json` to ensure the correct version is loaded in the browser.

**Prevention:**
1. Always keep security-sensitive dependencies like KaTeX and DOMPurify updated to their latest secure versions.
2. Never trust the output of a rendering library (even a math library) if it is going to be used in `dangerouslySetInnerHTML`.
3. Use a sanitizer like `DOMPurify` with appropriate security profiles (e.g., enabling MathML and SVG for KaTeX) to ensure the output is safe before injection.
4. Use Subresource Integrity (SRI) hashes for all external CSS and JS links to prevent tampering.
5. Periodically run `npm audit` to catch known vulnerabilities in dependencies.
