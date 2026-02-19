import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Global cache for KaTeX rendered HTML to avoid redundant parsing and rendering.
 * Limited to 1000 entries to prevent unbounded memory growth.
 */
const katexCache = new Map<string, string>();
const CACHE_LIMIT = 1000;

/**
 * Handles basic Markdown-style bolding (**text**) outside the component
 * to avoid recreation on every render.
 */
const processBold = (input: string) => {
  if (!input || !input.includes('**')) return input;

  const parts = input.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

/**
 * MathText Component - Renders text with embedded LaTeX math ($...$).
 * ⚡ Optimized with React.memo and a global KaTeX result cache.
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

          // ⚡ Check cache first
          const cached = katexCache.get(math);
          if (cached) {
            return (
              <span
                key={i}
                dangerouslySetInnerHTML={{ __html: cached }}
                className="mx-1"
              />
            );
          }

          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false
            });

            // ⚡ Save to cache with limit check
            if (katexCache.size >= CACHE_LIMIT) {
              katexCache.clear();
            }
            katexCache.set(math, html);

            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            return <span key={i} className="text-red-500">{part}</span>;
          }
        } else {
          // ⚡ Process text for bolding
          const bolded = processBold(part);
          return <span key={i}>{bolded}</span>;
        }
      })}
    </div>
  );
});

MathText.displayName = 'MathText';
