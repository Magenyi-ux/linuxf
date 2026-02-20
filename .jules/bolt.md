## 2025-05-22 - Optimized Math Rendering and Chat History
**Learning:** KaTeX's `renderToString` is an expensive operation that can cause significant lag during AI response streaming, especially when the entire chat history re-renders on every incoming chunk. React's `memo` combined with a global LRU-style cache for math strings effectively eliminates this bottleneck.

**Action:** Always memoize components that perform expensive string parsing or external library calls (like KaTeX). Implement a simple cache for idempotent rendering operations to avoid redundant work across different component instances or re-renders.
