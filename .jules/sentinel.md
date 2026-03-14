# Sentinel Security Journal 🛡️

## 2025-05-14 - Outdated KaTeX and Unsanitized Math Rendering
**Vulnerability:** The application used an outdated version of KaTeX (0.16.9) with known XSS and protocol bypass vulnerabilities. Additionally, it rendered KaTeX output using `dangerouslySetInnerHTML` without sanitization, trusting external AI-generated content.
**Learning:** Relying on a single layer of protection (KaTeX's internal safety) is insufficient when dealing with AI-generated inputs. Vulnerabilities in the library itself can expose the application if defense-in-depth (sanitization) is missing.
**Prevention:** Always pin security-critical dependencies to patched versions and apply secondary sanitization (e.g., DOMPurify) when using `dangerouslySetInnerHTML`, even for "trusted" library output.
