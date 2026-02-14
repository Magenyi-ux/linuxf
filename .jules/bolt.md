## 2025-05-22 - [Chat & Math Rendering Optimization]
**Learning:** In applications utilizing AI streaming with rich text/math (like KaTeX), the UI can become extremely sluggish if the entire chat history and every math expression are re-rendered on every streamed chunk. Standard React reconciliation is not enough because math rendering libraries like KaTeX are CPU-intensive.
**Action:** Always wrap message components in `React.memo` and implement a global cache for expensive rendering results (like KaTeX HTML strings) to ensure O(1) update complexity during streaming.
