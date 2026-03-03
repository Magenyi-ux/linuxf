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
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false
            });

            // Sanitize the generated HTML to prevent XSS while allowing KaTeX's SVG-based output
            const sanitizedHtml = DOMPurify.sanitize(html, {
              ALLOWED_TAGS: ['svg', 'use', 'path', 'span', 'i', 'b', 'strong', 'em', 'small', 'sub', 'sup'],
              ALLOWED_ATTR: ['style', 'd', 'viewBox', 'fill', 'class', 'aria-hidden', 'role', 'width', 'height', 'x', 'y', 'xlink:href', 'preserveAspectRatio']
            });

            return <span key={i} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className="mx-1" />;
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
