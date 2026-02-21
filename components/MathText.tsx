import React from 'react';
import katex from 'katex';

/**
 * Sanitizes HTML string to prevent XSS while allowing safe educational tags.
 */
const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') return html;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allowed = ['P','BR','SUB','SUP','STRONG','EM','IMG','DIV','SPAN','UL','OL','LI','B','I','U','TABLE','THEAD','TBODY','TR','TH','TD'];
  const clean = (el: Element) => {
    Array.from(el.children).forEach(clean);
    [...el.attributes].forEach(a => {
      const name = a.name.toLowerCase();
      const allowedAttrs = ['src', 'alt', 'class', 'width', 'height', 'colspan', 'rowspan'];
      if (name.startsWith('on') || !allowedAttrs.includes(name) || (name === 'src' && /javascript:/i.test(a.value))) el.removeAttribute(a.name);
    });
    if (!allowed.includes(el.tagName)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'NOSCRIPT'].includes(el.tagName)) el.remove();
      else el.replaceWith(...Array.from(el.childNodes));
    }
  };
  Array.from(doc.body.children).forEach(clean);
  return doc.body.innerHTML;
};

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  const processBold = (input: string) => {
    const parts = input.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
  };

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
          if (part.includes('<') && part.includes('>')) {
            // SECURITY: Sanitize HTML segments to prevent XSS from AI-generated content
            return <span key={i} dangerouslySetInnerHTML={{ __html: sanitizeHtml(part) }} />;
          }
          return <span key={i}>{processBold(part)}</span>;
        }
      })}
    </div>
  );
};
