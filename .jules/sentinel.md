## 2025-05-15 - Robust XSS Prevention in MathText
**Vulnerability:** A critical XSS vulnerability existed in `MathText.tsx` where non-LaTeX segments containing HTML tags were rendered directly using `dangerouslySetInnerHTML` without any sanitization.
**Learning:** Custom hand-written sanitizers using `DOMParser` are often insufficient as they may fail to properly escape text nodes during re-serialization, leading to bypasses. Established libraries like `dompurify` provide more robust protection and are easier to maintain.
**Prevention:** Always use a battle-tested library like `dompurify` for HTML sanitization. Additionally, implement a restrictive Content Security Policy (CSP) as a defense-in-depth measure to mitigate the impact of any potential sanitizer bypasses.
