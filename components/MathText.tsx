import React, { useMemo, memo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * Global cache for KaTeX rendered HTML strings to avoid redundant processing.
 */
const katexCache = new Map<string, string>();

/**
 * MathText Component - Renders text with LaTeX math support.
 * Optimized with React.memo and a global cache for KaTeX rendering.
 */
export const MathText: React.FC<MathTextProps> = memo(({ text, className = '' }) => {
  if (!text) return null;

  /**
   * Processes basic Markdown-style bolding (**text**).
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

  // Use useMemo to avoid re-splitting and re-rendering math if the text hasn't changed
  const content = useMemo(() => {
    // Split by LaTeX delimiters ($...$)
    const parts = text.split(/(\$[^$]+\$)/g);

    return parts.map((part, i) => {
      if (part.startsWith('$') && part.endsWith('$')) {
        // This is a math segment
        const math = part.slice(1, -1);

        // Check cache first
        if (katexCache.has(math)) {
            return <span key={i} dangerouslySetInnerHTML={{ __html: katexCache.get(math)! }} className="mx-1" />;
        }

        try {
          const html = katex.renderToString(math, {
            throwOnError: false,
            displayMode: false
          });
          // Save to cache
          katexCache.set(math, html);
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
        } catch (e) {
          // Fallback if KaTeX fails
          return <span key={i} className="text-red-500">{part}</span>;
        }
      } else {
        // This is text, process for bolding
        return <span key={i}>{processBold(part)}</span>;
      }
    });
  }, [text]);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {content}
    </div>
  );
});

// Explicit display name for debugging
MathText.displayName = 'MathText';
