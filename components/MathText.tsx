import React from 'react';
import katex from 'katex';
import DOMPurify from 'dompurify';

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

  // 2. Split by LaTeX delimiters ($...$, \(...\), \[...\])
  // We use a non-greedy match for content within delimiters
  const parts = text.split(/(\$[^$]+\$|\\\(.+?\\\)|\\\[.+?\\\])/gs);

  return (
    <div className={`math-content whitespace-pre-wrap break-words ${className}`}>
      {parts.map((part, i) => {
        const isInlineMath = (part.startsWith('$') && part.endsWith('$')) || (part.startsWith('\\(') && part.endsWith('\\)'));
        const isBlockMath = part.startsWith('\\[') && part.endsWith('\\]');

        if (isInlineMath || isBlockMath) {
          // This is a math segment
          const math = isInlineMath
            ? (part.startsWith('$') ? part.slice(1, -1) : part.slice(2, -2))
            : part.slice(2, -2);
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: isBlockMath
            });

            // Sanitize KaTeX output as it uses SVG/HTML
            const sanitizedHtml = DOMPurify.sanitize(html, {
              USE_PROFILES: { html: true, svg: true },
              ADD_ATTR: ['style', 'd', 'viewBox', 'fill', 'stroke', 'points', 'transform', 'width', 'height']
            });

            return <span key={i} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="mx-1 inline-block align-middle" />;
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
