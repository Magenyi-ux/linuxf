import React from 'react';
import { MathMarkdown } from './MathMarkdown';

interface StudyNoteContentProps {
  content: string;
}

const Diagram: React.FC<{ source: string }> = ({ source }) => {
  const rows = source.split(/\r?\n/).map(line => line.trim()).filter(Boolean).slice(0, 8);
  const parsed = rows.map(row => row.split(/\s*(?:->|→|=>)\s*/).map(label => label.trim()).filter(Boolean).slice(0, 6));
  const maxNodes = Math.max(1, ...parsed.map(row => row.length));
  const nodeWidth = 140;
  const nodeHeight = 48;
  const gap = 30;
  const rowGap = 22;
  const width = Math.max(280, maxNodes * nodeWidth + (maxNodes - 1) * gap + 32);
  const height = Math.max(90, parsed.length * (nodeHeight + rowGap) + 16);

  return (
    <div className="my-5 overflow-x-auto rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3" role="img" aria-label={'Concept diagram: ' + rows.join('; ')}>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-800">Visual guide</p>
      <svg viewBox={'0 0 ' + width + ' ' + height} width={width} height={height} className="mx-auto max-w-none" xmlns="http://www.w3.org/2000/svg">
        <defs><marker id="study-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#2563eb" /></marker></defs>
        {parsed.map((nodes, rowIndex) => {
          const y = 8 + rowIndex * (nodeHeight + rowGap);
          const rowWidth = nodes.length * nodeWidth + Math.max(0, nodes.length - 1) * gap;
          const startX = (width - rowWidth) / 2;
          return <g key={rowIndex}>
            {nodes.map((label, index) => {
              const x = startX + index * (nodeWidth + gap);
              return <g key={rowIndex + '-' + index}>
                {index > 0 && <line x1={x - gap + 2} y1={y + nodeHeight / 2} x2={x - 8} y2={y + nodeHeight / 2} stroke="#2563eb" strokeWidth="2" markerEnd="url(#study-arrow)" />}
                <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx="10" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.5" />
                <foreignObject x={x + 5} y={y + 3} width={nodeWidth - 10} height={nodeHeight - 6}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'12px',fontWeight:600,lineHeight:1.2,textAlign:'center',color:'#1e3a8a',overflowWrap:'anywhere'}}>{label}</div>
                </foreignObject>
              </g>;
            })}
          </g>;
        })}
      </svg>
    </div>
  );
};

export const StudyNoteContent: React.FC<StudyNoteContentProps> = ({ content }) => {
  const fence = new RegExp('(\\x60\\x60\\x60diagram\\s*[\\s\\S]*?\\x60\\x60\\x60)', 'g');
  const blocks = content.split(fence);
  const diagramBlock = new RegExp('^\\x60\\x60\\x60diagram\\s*\\n?([\\s\\S]*?)\\n?\\x60\\x60\\x60$');
  return <>{blocks.map((block, index) => {
    const match = block.match(diagramBlock);
    if (match) return <Diagram key={index} source={match[1]} />;
    if (!block) return null;
    return <MathMarkdown key={index} content={block} />;
  })}</>;
};
