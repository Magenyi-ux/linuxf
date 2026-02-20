import React from 'react';
import katex from 'katex';

/**
 * Global cache for KaTeX rendering results.
 * Storing the rendered HTML strings prevents expensive re-parsing of LaTeX
 * during AI response streaming or frequent UI updates.
 */
const katexCache = new Map<string, string>();
const MAX_CACHE_SIZE = 1000;

/**
 * processBold - A lightweight utility to convert Markdown-style bolding (**text**)
 * into <strong> elements. Defined outside the component to avoid recreation.
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

interface MathTextProps {
  text: string;
  className?: string;
}

const MathTextComponent: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by LaTeX delimiters ($...$, \(...\), or \[...\])
  const parts = text.split(/(\\\(.+?\\\)|\\\[.+?\\\]|\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        let math = "";
        let displayMode = false;

        // Extract math content and determine display mode based on delimiters
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          math = part.slice(2, -2);
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          math = part.slice(2, -2);
          displayMode = true;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          math = part.slice(1, -1);
        }

        if (math) {
          const cacheKey = `${displayMode}:${math}`;
          let html = katexCache.get(cacheKey);

          if (!html) {
            try {
              html = katex.renderToString(math, {
                throwOnError: false,
                displayMode
              });

              // Evict cache if it grows too large (simple LRU-ish approach)
              if (katexCache.size >= MAX_CACHE_SIZE) {
                katexCache.clear();
              }
              katexCache.set(cacheKey, html);
            } catch (e) {
              return <span key={i} className="text-red-500">{part}</span>;
            }
          }
          return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
        } else {
          // Handle HTML content or standard text with bolding
          if (part.includes('<') && part.includes('>')) {
            return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
          }
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
};

/**
 * MathText is memoized to skip the entire rendering logic if the text prop remains
 * identical, which is common during parent component re-renders.
 */
export const MathText = React.memo(MathTextComponent);
