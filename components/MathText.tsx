import React, { memo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

// Global cache to store rendered KaTeX HTML strings.
// This prevents redundant parsing and rendering of the same LaTeX expressions
// across the entire application, significantly improving performance in math-heavy views.
const katexCache = new Map<string, string>();

export const MathText: React.FC<MathTextProps> = memo(({ text, className = '' }) => {
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

          // Check if we have already rendered this math expression
          let html = katexCache.get(math);

          if (!html) {
            try {
              // Perform expensive KaTeX rendering and store the result in the cache
              html = katex.renderToString(math, {
                throwOnError: false,
                displayMode: false
              });
              katexCache.set(math, html);
            } catch (e) {
              // Fallback if KaTeX fails
              return <span key={i} className="text-red-500">{part}</span>;
            }
          }

          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
        } else {
          // This is text, process for bolding
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
});
