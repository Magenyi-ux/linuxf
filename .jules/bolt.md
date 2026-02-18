# Bolt's Performance Journal

## 2025-05-15 - KaTeX Rendering Optimization
**Learning:** KaTeX rendering via `renderToString` is a major CPU bottleneck in math-heavy applications, especially during UI updates like chat streaming where the entire message list re-renders. Component-level memoization alone is insufficient if the component internally performs expensive computations on every render.
**Action:** Always implement a global cache (e.g., `Map`) for idempotent, expensive operations like LaTeX-to-HTML conversion. Combine this with `React.memo` to prevent both reconciliation and computation overhead.
