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

  // 2. Split by LaTeX delimiters ($...$, \\(...\\), or \\[...\\])
  // The regex captures the content inside these signs
  const parts = text.split(/(\\\(.+?\\\)|\\\[.+?\\\]|\$[^$]+\$)/g);

  return (
    <div className={`math-content whitespace-pre-wrap ${className}`}>
      {parts.map((part, i) => {
        let math = "";
        let displayMode = false;

        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          math = part.slice(2, -2);
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          math = part.slice(2, -2);
          displayMode = true;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          math = part.slice(1, -1);
        }

        if (math) {
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            return <span key={i} className="text-red-500">{part}</span>;
          }
        } else {
          // This is text or HTML, render it as HTML if it looks like it
          if (part.includes('<') && part.includes('>')) {
            // ✅ SECURITY: Sanitize HTML content before rendering to prevent XSS
            const sanitizedHtml = DOMPurify.sanitize(part, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'img', 'ul', 'ol', 'li', 'b', 'i', 'sup', 'sub'],
                ALLOWED_ATTR: ['src', 'alt', 'width', 'height', 'class']
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
          }
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
};
