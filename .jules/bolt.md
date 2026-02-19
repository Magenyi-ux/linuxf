## 2025-05-22 - KaTeX Rendering Bottleneck
**Learning:** KaTeX rendering via `renderToString` is a synchronous, CPU-intensive operation. In components that render many math segments (like chat lists or quiz options) and re-render frequently (e.g. during AI streaming), this becomes a significant performance bottleneck.
**Action:** Always memoize math-rendering components with `React.memo` and implement a global string-based cache for rendered HTML to skip redundant parsing. Ensure the cache has a size limit to avoid memory leaks.
