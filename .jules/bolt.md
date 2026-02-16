# Bolt's Performance Journal ⚡

## 2025-05-15 - [Initial Hunt]
**Learning:** Identified that `MathText` (using KaTeX) and `ChatBot` (message streaming) are significant rendering bottlenecks due to missing memoization and redundant expensive calculations (`katex.renderToString`).
**Action:** Implement `React.memo` and a global KaTeX string cache to optimize these paths.
