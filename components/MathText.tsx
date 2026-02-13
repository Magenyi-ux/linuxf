import React, { memo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Global cache for KaTeX rendering results to avoid redundant parsing and HTML generation.
 * This provides a significant speedup when the same math expressions are rendered multiple times,
 * such as during AI response streaming or in large lists.
 */
const katexCache = new Map<string, string>();

/**
 * MathText Component - Renders text with LaTeX math support.
 * Optimized with React.memo and KaTeX result caching for high performance.
 */
export const MathText = memo(({ text, className = '' }: MathTextProps) => {
  if (!text) return null;

  // 1. Handle basic Markdown-style bolding (**text**)
  // Note: This is a simple replacement. For full markdown, a library is better, 
  // but we want to keep it lightweight.
  const processBold = (input: string) => {
    const parts = input.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
  };

  // 2. Split by LaTeX delimiters ($...$)
  // The regex captures the content inside the $ signs
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          // This is a math segment
          const math = part.slice(1, -1);
          try {
            // Check cache first to avoid expensive KaTeX rendering
            let html = katexCache.get(math);

            if (!html) {
              html = katex.renderToString(math, {
                throwOnError: false,
                displayMode: false
              });
              katexCache.set(math, html);
            }

            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            // Fallback if KaTeX fails
            return <span key={i} className="text-red-500">{part}</span>;
          }
        } else {
          // This is text, process for bolding
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
});
