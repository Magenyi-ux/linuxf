## 2026-02-21 - Chat Rendering Optimization
**Learning:** React chat applications with expensive child components (like KaTeX math rendering) suffer from O(N^2) complexity during message streaming because every state update re-renders the entire message history.
**Action:** Always extract and memoize individual message components and implement computational caching for expensive operations like KaTeX to reduce complexity to O(1) per update.
