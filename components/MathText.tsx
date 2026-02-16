import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

// Global cache for KaTeX rendered HTML strings to avoid redundant processing
// This provides a massive speed boost when the same math expressions appear multiple times
const katexCache = new Map<string, string>();

/**
 * Internal component for rendering text with math.
 */
const MathTextComponent: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // 1. Handle basic Markdown-style bolding (**text**)
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
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          // This is a math segment
          const math = part.slice(1, -1);

          // Performance Optimization: Check global cache before rendering
          let html = katexCache.get(math);
          if (!html) {
            try {
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
};

/**
 * MathText - Memoized component to prevent unnecessary re-renders.
 * Essential for performance in lists (Chat history, Quiz options).
 */
export const MathText = React.memo(MathTextComponent);
