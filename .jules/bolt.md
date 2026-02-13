## 2025-02-13 - [Rendering & Math Optimization]
**Learning:** React component re-renders during high-frequency updates (like AI streaming) are a major bottleneck when components contain expensive computations (like KaTeX rendering). Memoizing individual list items and caching results of string-to-HTML conversions provides a massive boost.
**Action:** Always wrap list items in `React.memo` when they are part of a frequently updating list (e.g., chat), and use global caches for pure, expensive string parsing operations like LaTeX or Markdown rendering.
