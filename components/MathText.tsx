import React, { memo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Global cache for KaTeX rendered HTML strings.
 * Parsing and generating HTML from LaTeX can be expensive, especially in
 * streaming contexts like the AI Tutor chat. This cache prevents redundant work.
 */
const katexCache = new Map<string, string>();

/**
 * MathText Component
 * Renders text containing LaTeX math expressions ($...$) and basic markdown bolding (**...**).
 * Optimized with React.memo and a global KaTeX string cache.
 */
export const MathText: React.FC<MathTextProps> = memo(({ text, className = '' }) => {
  if (!text) return null;

  /**
   * Processes text for basic Markdown-style bolding.
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

  // Split by LaTeX delimiters ($...$)
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          // This is a math segment
          const math = part.slice(1, -1);

          // Check if we've already rendered this expression
          const cachedHtml = katexCache.get(math);
          if (cachedHtml) {
            return <span key={i} dangerouslySetInnerHTML={{ __html: cachedHtml }} className="mx-1" />;
          }

          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false
            });
            // Cache the result for future use
            katexCache.set(math, html);
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            // Fallback if KaTeX rendering fails
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

MathText.displayName = 'MathText';
