# Bolt's Performance Journal ⚡

## 2025-05-15 - [Math & Chat Rendering Optimization]
**Learning:** In a streaming AI context, components that parse complex formats (like LaTeX) or render large lists (like chat history) become significant bottlenecks. Re-rendering the entire chat history for every streamed chunk causes noticeable lag and high CPU usage. Global caching for parsing results (e.g., KaTeX) combined with component-level memoization drastically improves responsiveness.
**Action:** Always memoize individual list items in streaming views and use global caches for expensive idempotent transformations like math-to-html conversion.

## 2025-05-15 - [PWA & Offline-First Performance]
**Learning:** The application relies heavily on external CDNs (KaTeX, Google Fonts, etc.). Ensuring these are cached via Workbox `runtimeCaching` is critical for offline performance and initial load speed.
**Action:** Audit `vite.config.ts` whenever new external assets are added to ensure they are captured by the service worker.
