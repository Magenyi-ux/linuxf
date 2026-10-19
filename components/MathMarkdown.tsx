import React from 'react';
import katex from 'katex';
import { Streamdown } from 'streamdown';
import 'katex/dist/katex.min.css';

interface MathMarkdownProps {
  content: string;
}

/**
 * Render Markdown normally while typesetting complete LaTeX expressions with KaTeX.
 * Supports inline $...$ and \( ... \), display $$...$$ and \[...\],
 * plus square-bracket math delimiters commonly HTML-escaped by AI output.
 */
export const MathMarkdown: React.FC<MathMarkdownProps> = ({ content }) => {
  const normalized = content.replace(/&#91;([\s\S]*?)&#93;/gi, (_match, formula: string) => '\\[' + formula + '\\]');
  const expression = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+\$)/g;
  const parts = normalized.split(expression).filter(part => part.length > 0);

  return (
    <>
      {parts.map((part, index) => {
        let formula: string | null = null;
        let displayMode = false;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          formula = part.slice(2, -2);
          displayMode = true;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          formula = part.slice(2, -2);
          displayMode = true;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          formula = part.slice(2, -2);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          formula = part.slice(1, -1);
        }

        if (formula !== null) {
          try {
            const html = katex.renderToString(formula.trim(), {
              displayMode,
              throwOnError: false,
              strict: 'ignore',
            });
            return (
              <span
                key={index}
                className={displayMode ? 'math-display block max-w-full overflow-x-auto py-2 text-center' : 'math-inline'}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <code key={index} className="whitespace-pre-wrap break-words">{part}</code>;
          }
        }

        return <Streamdown key={index}>{part}</Streamdown>;
      })}
    </>
  );
};
