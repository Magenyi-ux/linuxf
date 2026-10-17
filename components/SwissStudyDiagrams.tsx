import React from 'react';

type DiagramProps = { className?: string };

const DiagramFrame: React.FC<{ label: string; index: string; children: React.ReactNode }> = ({ label, index, children }) => (
  <article className="swiss-card p-4 sm:p-5 min-w-0">
    <div className="flex items-center justify-between gap-3 mb-4">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</span>
      <span className="text-xs tabular-nums text-gray-400">{index}</span>
    </div>
    <div className="swiss-diagram p-3 h-32 flex items-center justify-center overflow-hidden">
      {children}
    </div>
  </article>
);

export const SwissStudyDiagrams: React.FC<DiagramProps> = ({ className = '' }) => (
  <section className={className} aria-label="Examples of learning diagrams">
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500 mb-1">Learn by seeing</p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">Ideas, made clearer.</h2>
      </div>
      <span className="hidden sm:block text-xs text-gray-500">Mathematics · Physics · Chemistry</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <DiagramFrame label="Mathematics" index="01">
        <svg viewBox="0 0 220 110" className="w-full h-full" role="img" aria-label="Coordinate plane with a parabola">
          <g stroke="currentColor" strokeOpacity=".14" strokeWidth="1">
            {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={20 + i * 22} y1="8" x2={20 + i * 22} y2="100" />)}
            {Array.from({ length: 5 }, (_, i) => <line key={`h${i}`} x1="16" y1={15 + i * 21} x2="204" y2={15 + i * 21} />)}
          </g>
          <g stroke="currentColor" strokeWidth="1.5" fill="none">
            <path d="M16 57H207M110 101V7" />
            <path d="M202 53l5 4-5 4M106 12l4-5 4 5" />
          </g>
          <path d="M45 14 Q110 180 175 14" transform="translate(0 0)" fill="none" stroke="#596168" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="110" cy="78" r="3.5" fill="#596168" />
          <text x="194" y="49" fontSize="8" fill="currentColor">x</text>
          <text x="116" y="12" fontSize="8" fill="currentColor">y</text>
        </svg>
      </DiagramFrame>
      <DiagramFrame label="Physics" index="02">
        <svg viewBox="0 0 220 110" className="w-full h-full" role="img" aria-label="Block with force vectors">
          <defs>
            <marker id="force-arrow" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" fill="#596168" /></marker>
          </defs>
          <g stroke="currentColor" strokeOpacity=".14" strokeWidth="1">
            <path d="M12 82H208" />
            {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${18 + i * 20} 79v6`} />)}
          </g>
          <rect x="83" y="48" width="48" height="34" rx="2" fill="#E9EAE8" stroke="#454B50" strokeWidth="1.5" />
          <g stroke="#596168" strokeWidth="2" fill="none" markerEnd="url(#force-arrow)">
            <path d="M107 48V15" />
            <path d="M83 65H34" />
            <path d="M131 65H181" />
          </g>
          <g fill="currentColor" fontSize="9">
            <text x="114" y="20">N</text><text x="36" y="57">F₁</text><text x="166" y="57">F₂</text>
          </g>
        </svg>
      </DiagramFrame>
      <DiagramFrame label="Chemistry" index="03">
        <svg viewBox="0 0 220 110" className="w-full h-full" role="img" aria-label="Simple molecular bond diagram">
          <g stroke="#596168" strokeWidth="2" strokeLinecap="round">
            <path d="M66 56L99 36M99 36L132 56M132 56L165 36M132 56L132 88" />
            <path d="M102 42L135 62" strokeOpacity=".65" />
          </g>
          <g fill="#FFFFFF" stroke="#454B50" strokeWidth="1.5">
            <circle cx="66" cy="56" r="13" /><circle cx="99" cy="36" r="13" /><circle cx="132" cy="56" r="13" /><circle cx="165" cy="36" r="13" /><circle cx="132" cy="88" r="13" />
          </g>
          <g fill="#30363B" fontSize="10" fontWeight="600" textAnchor="middle" dominantBaseline="central">
            <text x="66" y="56">C</text><text x="99" y="36">O</text><text x="132" y="56">C</text><text x="165" y="36">H</text><text x="132" y="88">H</text>
          </g>
        </svg>
      </DiagramFrame>
    </div>
  </section>
);

export default SwissStudyDiagrams;
