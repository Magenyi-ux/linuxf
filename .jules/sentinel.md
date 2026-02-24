## 2025-05-15 - XSS in MathText Component
**Vulnerability:** Unsanitized HTML rendering in `MathText.tsx` using `dangerouslySetInnerHTML`. AI-generated content or user input containing `<` and `>` was rendered directly, allowing for potential script injection.
**Learning:** Even if a memory suggests a security measure (like DOMPurify) is already in place, it is critical to verify the actual codebase. In this case, the memory was inaccurate.
**Prevention:** Always sanitize any content rendered via `dangerouslySetInnerHTML` using a robust library like `DOMPurify`. Complement this with a restrictive Content Security Policy (CSP) to provide defense-in-depth against injection attacks.
