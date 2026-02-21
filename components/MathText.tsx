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
            // KaTeX output is considered safe, but we still render it carefully
            return <span key={i} dangerouslySetInnerHTML={{ __html: html }} className="mx-1" />;
          } catch (e) {
            return <span key={i} className="text-red-500">{part}</span>;
          }
        } else {
          // This is text or HTML, render it as sanitized HTML if it contains tags
          if (part.includes('<') && part.includes('>')) {
            const sanitized = DOMPurify.sanitize(part, {
              ALLOWED_TAGS: [
                'p', 'br', 'sub', 'sup', 'strong', 'em', 'img', 'div', 'span',
                'ul', 'ol', 'li', 'b', 'i', 'u', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
              ],
              ALLOWED_ATTR: ['src', 'alt', 'class', 'width', 'height', 'colspan', 'rowspan']
            });
            return <span key={i} dangerouslySetInnerHTML={{ __html: sanitized }} />;
          }
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
};
