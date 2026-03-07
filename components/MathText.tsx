import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
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

  // 2. Split by LaTeX delimiters ($...$ or \(...\))
  const parts = text.split(/(\\\(.+?\\\)|(?<!\\)\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        let isMath = false;
        let math = '';

        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          isMath = true;
          math = part.slice(2, -2);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          isMath = true;
          math = part.slice(1, -1);
        }

        if (isMath) {
          // This is a math segment
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false
            });
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
};
