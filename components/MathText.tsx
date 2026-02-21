import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * processBold - Converts Markdown-style bold (**text**) into <strong> elements.
 * Moved outside component to avoid re-creation on every render.
 */
const processBold = (input: string) => {
  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
  });
};

/**
 * katexCache - Global cache to store rendered LaTeX strings.
 * Reduces expensive calls to katex.renderToString.
 */
const katexCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * renderMath - Helper to render math with caching.
 */
const renderMath = (math: string, displayMode: boolean) => {
  const cacheKey = `${displayMode}:${math}`;
  if (katexCache.has(cacheKey)) {
    return katexCache.get(cacheKey)!;
  }


  const html = katex.renderToString(math, {
    throwOnError: false,
    displayMode
  });

  // Basic LRU-like eviction: remove the oldest entry
  if (katexCache.size >= MAX_CACHE_SIZE) {
    const firstKey = katexCache.keys().next().value;
    if (firstKey) katexCache.delete(firstKey);
  }
  katexCache.set(cacheKey, html);
  return html;
};

/**
 * MathText - Component for rendering text with embedded LaTeX math.
 * Optimized with React.memo and a global KaTeX cache.
 */
export const MathText: React.FC<MathTextProps> = React.memo(({ text, className = '' }) => {
  if (!text) return null;

  // Split by LaTeX delimiters ($...$, \(...\), or \[...\])
  const parts = text.split(/(\\\(.+?\\\)|\\\[.+?\\\]|\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        let math = "";
        let displayMode = false;

        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          math = part.slice(2, -2);
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          math = part.slice(2, -2);
          displayMode = true;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          math = part.slice(1, -1);
        }

        if (math) {
          try {
            const html = renderMath(math, displayMode);
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            return <span key={i} className="text-red-500">{part}</span>;
          }
        } else {
          // This is text or HTML, render it as HTML if it looks like it
          if (part.includes('<') && part.includes('>')) {
            return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
          }
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
});
