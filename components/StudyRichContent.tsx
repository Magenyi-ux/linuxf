import React from 'react';
import { MathMarkdown } from './MathMarkdown';
import {
  CartesianGrid, Line, LineChart, Bar, BarChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';

type ChartSpec = {
  type: 'line' | 'bar';
  title?: string;
  xLabel?: string;
  yLabel?: string;
  data: Array<{ x: string | number; y: number }>;
};
type Atom = { id: string; element: string; x: number; y: number; label?: string };
type MoleculeSpec = { title?: string; formula?: string; atoms: Atom[]; bonds: Array<{ from: string; to: string; order?: number }> };

function parseJson<T>(raw: string): T | null {
  try { return JSON.parse(raw) as T; } catch { return null; }
}

function ChartCard({ spec }: { spec: ChartSpec }) {
  if (!Array.isArray(spec.data) || spec.data.length < 1 || spec.data.length > 80 ||
      !spec.data.every(point => (typeof point.x === 'string' || typeof point.x === 'number') && Number.isFinite(point.y))) return null;
  const data = spec.data;
  return (
    <figure className="my-4 w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      {spec.title && <figcaption className="mb-3 text-sm font-semibold text-slate-800">{spec.title}</figcaption>}
      <div className="h-64 w-full min-w-0" role="img" aria-label={spec.title || 'Interactive study graph'}>
        <ResponsiveContainer width="100%" height="100%">
          {spec.type === 'bar'
            ? <BarChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="y" name={spec.yLabel || 'Value'} fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            : <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="y" name={spec.yLabel || 'Value'} stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>}
        </ResponsiveContainer>
      </div>
      {(spec.xLabel || spec.yLabel) && <p className="mt-2 text-center text-xs text-slate-500">{[spec.xLabel, spec.yLabel].filter(Boolean).join(' · ')}</p>}
    </figure>
  );
}

const ELEMENT_COLORS: Record<string, string> = {
  H: '#f8fafc', C: '#64748b', O: '#ef4444', N: '#3b82f6', S: '#eab308',
  P: '#f97316', F: '#22c55e', Cl: '#16a34a', Na: '#8b5cf6', Mg: '#10b981',
  Ca: '#a855f7', Fe: '#b45309',
};

function MoleculeCard({ spec }: { spec: MoleculeSpec }) {
  if (!Array.isArray(spec.atoms) || !Array.isArray(spec.bonds) || spec.atoms.length < 1 ||
      spec.atoms.length > 40 || spec.bonds.length > 60 ||
      !spec.atoms.every(a => typeof a.id === 'string' && typeof a.element === 'string' && Number.isFinite(a.x) && Number.isFinite(a.y))) return null;
  const atoms = new Map(spec.atoms.map(atom => [atom.id, atom]));
  if (!spec.bonds.every(b => atoms.has(b.from) && atoms.has(b.to) && [1, 2, 3].includes(b.order ?? 1))) return null;
  return (
    <figure className="my-4 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
      {spec.title && <figcaption className="mb-1 text-sm font-semibold text-slate-800">{spec.title}</figcaption>}
      {spec.formula && <p className="mb-2 text-xs text-slate-500">Molecular formula: <span className="font-semibold text-slate-700">{spec.formula}</span></p>}
      <div className="mx-auto w-full max-w-lg">
        <svg viewBox="0 0 320 220" className="h-auto w-full" role="img" aria-label={spec.title || 'Molecular structure diagram'}>
          {spec.bonds.map((bond, i) => {
            const a = atoms.get(bond.from)!; const b = atoms.get(bond.to)!;
            const dx = b.x - a.x; const dy = b.y - a.y; const length = Math.max(1, Math.hypot(dx, dy));
            const ox = (-dy / length) * 4; const oy = (dx / length) * 4;
            const order = bond.order ?? 1;
            return <g key={i} stroke="#64748b" strokeWidth="2.2" strokeLinecap="round">
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
              {order >= 2 && <line x1={a.x + ox} y1={a.y + oy} x2={b.x + ox} y2={b.y + oy} />}
              {order >= 3 && <line x1={a.x - ox} y1={a.y - oy} x2={b.x - ox} y2={b.y - oy} />}
            </g>;
          })}
          {spec.atoms.map(atom => {
            const radius = atom.element.length > 1 ? 17 : 15;
            const color = ELEMENT_COLORS[atom.element] || '#94a3b8';
            const darkText = ['H', 'S', 'C', 'Ca', 'Na', 'Mg'].includes(atom.element);
            return <g key={atom.id}>
              <circle cx={atom.x} cy={atom.y} r={radius} fill={color} stroke={atom.element === 'H' ? '#cbd5e1' : color} strokeWidth="1.2" />
              <text x={atom.x} y={atom.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={darkText ? '#0f172a' : '#ffffff'}>{atom.label || atom.element}</text>
            </g>;
          })}
        </svg>
      </div>
      <p className="mt-1 text-center text-[11px] text-slate-400">Schematic structure; bond layout may be simplified.</p>
    </figure>
  );
}

/** Renders safe, explicitly structured visual blocks alongside standard Markdown and KaTeX. */
export const StudyRichContent: React.FC<{ content: string }> = ({ content }) => {
  const blockPattern = /```examply-(chart|molecule)\s*\n([\s\S]*?)\n```/g;
  const pieces: Array<{ kind: 'markdown' | 'chart' | 'molecule'; value: string }> = [];
  let lastIndex = 0; let match: RegExpExecArray | null;
  while ((match = blockPattern.exec(content)) !== null) {
    if (match.index > lastIndex) pieces.push({ kind: 'markdown', value: content.slice(lastIndex, match.index) });
    pieces.push({ kind: match[1] as 'chart' | 'molecule', value: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < content.length) pieces.push({ kind: 'markdown', value: content.slice(lastIndex) });
  if (!pieces.length) pieces.push({ kind: 'markdown', value: content });
  return <div className="min-w-0 space-y-1">
    {pieces.map((piece, index) => {
      if (piece.kind === 'chart') {
        const spec = parseJson<ChartSpec>(piece.value);
        return spec && (spec.type === 'line' || spec.type === 'bar') ? <ChartCard key={index} spec={spec} /> : <pre key={index} className="overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs">{piece.value}</pre>;
      }
      if (piece.kind === 'molecule') {
        const spec = parseJson<MoleculeSpec>(piece.value);
        return spec ? <MoleculeCard key={index} spec={spec} /> : <pre key={index} className="overflow-x-auto rounded-xl bg-slate-100 p-3 text-xs">{piece.value}</pre>;
      }
      return <div key={index} className="min-w-0"><MathMarkdown content={piece.value} /></div>;
    })}
  </div>;
};
