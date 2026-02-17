## 2026-02-17 - Optimizing AI Stream Rendering and Math Content
**Learning:** In applications using AI streaming (like Gemini sendMessageStream), updating a single message in a list of messages triggers a re-render of the entire list. If messages contain expensive components like KaTeX math rendering, this leads to O(N*M) processing where N is message count and M is stream chunks.
**Action:** Always extract individual items in a frequently updating list into a `React.memo` component (e.g., `ChatMessage`) and use a global cache for expensive idempotent operations like `katex.renderToString`.
