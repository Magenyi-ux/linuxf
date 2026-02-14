import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Global cache to store rendered KaTeX HTML strings.
 * This significantly improves performance by avoiding redundant calls
 * to katex.renderToString for identical LaTeX expressions.
 */
const katexCache = new Map<string, string>();

/**
 * Helper to process basic Markdown-style bolding (**text**).
 * Extracted outside the component to avoid recreation on every render cycle.
 */
const processBold = (input: string) => {
  if (!input.includes('**')) return [input];
  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
  });
};

/**
 * MathText Component - Renders text with LaTeX math support.
 *
 * PERFORMANCE OPTIMIZATIONS:
 * 1. React.memo: Prevents re-renders if the 'text' prop hasn't changed.
 * 2. KaTeX Cache: Uses a global Map to store and retrieve rendered HTML,
 *    drastically reducing CPU usage during AI response streaming.
 * 3. Hoisted Helpers: Moves processing logic outside the render loop.
 */
export const MathText: React.FC<MathTextProps> = React.memo(({ text, className = '' }) => {
  if (!text) return null;

  // Split by LaTeX delimiters ($...$)
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);

          // Check global cache for previously rendered math
          let html = katexCache.get(math);

          if (!html) {
            try {
              html = katex.renderToString(math, {
                throwOnError: false,
                displayMode: false
              });
              // Store in cache for future hits
              katexCache.set(math, html);
            } catch (e) {
              // Fallback to raw text if KaTeX fails
              return <span key={i} className="text-red-500">{part}</span>;
            }
          }

          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
        } else {
          // Process standard text for bolding
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
});

// Set display name for better debugging with React.memo
MathText.displayName = 'MathText';
