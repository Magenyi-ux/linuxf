import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eraser, Sparkles, Undo2, Trash2, Pencil, Calculator, X, Pause, Play, Minus, Plus, Lightbulb, Save, Wifi, WifiOff } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { useAuth } from '../contexts/AuthContext';

type ChalkColour = { name: string; value: string };
const CHALK: ChalkColour[] = [
  { name: 'White', value: '#f8fafc' },
  { name: 'Yellow', value: '#f4d35e' },
  { name: 'Green', value: '#78d69a' },
  { name: 'Blue', value: '#78b9f2' },
  { name: 'Pink', value: '#f29bc0' },
];

type Point = { x: number; y: number };
type Stroke = { points: Point[]; colour: string; width: number; erase?: boolean };

export function evaluateMath(source: string): { result: string; steps: string[] } | null {
  const input = source.trim().replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/−/g, '-');
  if (!input || input.length > 180 || !/^[0-9a-zA-Z_+\-*/^().,=%\s]+$/.test(input)) return null;
  const tokens = input.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-zA-Z_]+|[=()+\-*/^%,]/gi);
  if (!tokens || tokens.join('').replace(/\s/g, '') !== input.replace(/\s/g, '')) return null;
  let pos = 0;
  const calculationSteps: string[] = [];
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const parsePrimary = (): number => {
    const token = take();
    if (token === undefined) throw new Error('Incomplete expression');
    if (token === '+') return parsePrimary();
    if (token === '-') return -parsePrimary();
    if (token === '(') {
      const value = parseAdd();
      if (take() !== ')') throw new Error('Missing closing bracket');
      return value;
    }
    if (/^\d/.test(token)) return Number(token);
    const name = token.toLowerCase();
    if (name === 'pi') return Math.PI;
    if (name === 'e') return Math.E;
    if (['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs'].includes(name)) {
      if (peek() === '(') take();
      const arg = parseAdd();
      if (peek() === ')') take();
      let value: number;
      if (name === 'sqrt') value = Math.sqrt(arg);
      else if (name === 'abs') value = Math.abs(arg);
      else if (name === 'log') value = Math.log10(arg);
      else if (name === 'ln') value = Math.log(arg);
      else {
        const radians = arg * Math.PI / 180;
        value = name === 'sin' ? Math.sin(radians) : name === 'cos' ? Math.cos(radians) : Math.tan(radians);
      }
      calculationSteps.push(name + '(' + arg + ') = ' + Number(value.toPrecision(10)));
      return value;
    }
    throw new Error('Unknown symbol');
  };
  const parsePower = (): number => {
    let value = parsePrimary();
    if (peek() === '^') {
      take(); const base = value; const exponent = parsePower(); value = Math.pow(base, exponent);
      calculationSteps.push(base + '^' + exponent + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  const parseMul = (): number => {
    let value = parsePower();
    while (['*', '/', '%'].includes(peek())) {
      const op = take(); const right = parsePower(); const left = value;
      if ((op === '/' || op === '%') && right === 0) throw new Error('Division by zero');
      value = op === '*' ? value * right : op === '/' ? value / right : value % right;
      calculationSteps.push(left + ' ' + (op === '*' ? '×' : op === '/' ? '÷' : 'mod') + ' ' + right + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  const parseAdd = (): number => {
    let value = parseMul();
    while (peek() === '+' || peek() === '-') {
      const op = take(); const right = parseMul(); const left = value;
      value = op === '+' ? value + right : value - right;
      calculationSteps.push(left + ' ' + op + ' ' + right + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  try {
    if (input.includes('=')) {
      const sides = input.split('=');
      if (sides.length !== 2 || !sides.every(Boolean)) return null;
      if (!sides.join('').toLowerCase().includes('x')) {
        const left = evaluateMath(sides[0]); const right = evaluateMath(sides[1]);
        if (!left || !right) return null;
        const equal = Number(left.result) === Number(right.result);
        return { result: equal ? 'True — both sides equal ' + left.result : 'False — the sides are ' + left.result + ' and ' + right.result, steps: ['Evaluate the left side: ' + left.result, 'Evaluate the right side: ' + right.result, equal ? 'Both sides are equal.' : 'The two sides are not equal.'] };
      }
      const affine = (expr: string): [number, number] => {
        const parts = expr.match(/[+-]?[^+-]+/g);
        if (!parts) throw new Error('Unsupported equation');
        let a = 0, b = 0;
        for (const raw of parts) {
          const term = raw.trim();
          const sign = term.startsWith('-') ? -1 : 1;
          const body = term.replace(/^[+-]/, '').trim();
          if (body.includes('x')) {
            const coefficient = body.replace(/x/gi, '') || '1';
            const c = coefficient.endsWith('*') ? coefficient.slice(0, -1) : coefficient;
            if (/[*/^()]/.test(c)) throw new Error('Use simple linear equations such as 2x + 5 = 13');
            a += sign * (c ? Number(c) : 1);
          } else {
            const n = Number(body);
            if (!Number.isFinite(n)) throw new Error('Unsupported equation');
            b += sign * n;
          }
        }
        return [a, b];
      };
      const [la, lb] = affine(sides[0]); const [ra, rb] = affine(sides[1]);
      const coefficient = la - ra; const constant = rb - lb;
      if (coefficient === 0) return { result: constant === 0 ? 'Every value of x satisfies this equation.' : 'No solution', steps: ['Collect x terms on one side.', 'Collect constants on the other side.'] };
      const x = constant / coefficient;
      return { result: 'x = ' + Number(x.toPrecision(10)), steps: ['Start with ' + input, 'Collect x terms: ' + coefficient + 'x = ' + constant, 'Divide both sides by ' + coefficient + '.', 'Therefore, x = ' + Number(x.toPrecision(10)) + '.'] };
    }
    const result = parseAdd();
    if (pos !== tokens.length || !Number.isFinite(result)) return null;
    const rounded = Number(result.toPrecision(12));
    return { result: String(rounded), steps: ['Expression: ' + input, ...calculationSteps, 'Result: ' + rounded] };
  } catch { return null; }
}

interface Props { question: string; subject: string; mode: 'STUDY' | 'TEST'; }
export const MathChalkboard: React.FC<Props> = ({ question, subject, mode }) => {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState(45);
  const [colour, setColour] = useState(CHALK[0].value);
  const [tool, setTool] = useState<'chalk' | 'eraser'>('chalk');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redo, setRedo] = useState<Stroke[]>([]);
  const [draft, setDraft] = useState<Stroke | null>(null);
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<{ result: string; steps: string[] } | null>(null);
  const [revealedSteps, setRevealedSteps] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [includeQuestion, setIncludeQuestion] = useState(true);
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [savedLocally, setSavedLocally] = useState(false);
  const [loadedStorageKey, setLoadedStorageKey] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [writeSpeed, setWriteSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const speedRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const storageKey = 'examply-chalkboard:' + encodeURIComponent(subject + ':' + question.slice(0, 100));
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { speedRef.current = writeSpeed; }, [writeSpeed]);
  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => { window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline); };
  }, []);
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as { strokes?: Stroke[]; expression?: string };
        if (Array.isArray(parsed.strokes)) setStrokes(parsed.strokes);
        if (typeof parsed.expression === 'string') setExpression(parsed.expression);
        setSavedLocally(Boolean(saved));
      } else { setStrokes([]); setExpression(''); setSavedLocally(false); }
      setLoadedStorageKey(storageKey);
    } catch { /* Storage can be unavailable in private browsing; board still works in memory. */ setLoadedStorageKey(storageKey); }
  }, [storageKey]);
  useEffect(() => {
    if (loadedStorageKey !== storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ strokes, expression }));
      setSavedLocally(true);
    } catch { setSavedLocally(false); }
  }, [storageKey, loadedStorageKey, strokes, expression]);
  useEffect(() => {
    setResult(null);
    setRevealedSteps(1);
    if (!expression.trim()) return;
    const timeout = window.setTimeout(() => {
      // Run the local validator after typing settles. Unsupported/invalid input has no result.
      const validated = evaluateMath(expression);
      setResult(validated);
      setRevealedSteps(1);
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [expression]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const snapshot = canvas.toDataURL();
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
      image.src = snapshot;
      paint(ctx, rect.width, rect.height);
    };
    const paint = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      [...strokes, ...(draft ? [draft] : [])].forEach(stroke => {
        if (!stroke.points.length) return;
        ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.strokeStyle = stroke.erase ? '#202522' : stroke.colour;
        ctx.lineWidth = stroke.width;
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        if (stroke.points.length === 1) ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
        ctx.stroke();
      });
    };
    const ctx = canvas.getContext('2d');
    if (ctx) paint(ctx, canvas.clientWidth, canvas.clientHeight);
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, [strokes, draft]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const beginStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setDraft({ points: [pointFrom(event)], colour, width: tool === 'eraser' ? 24 : 3, erase: tool === 'eraser' });
  };
  const moveStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = pointFrom(event);
    setDraft(current => current ? { ...current, points: [...current.points, point] } : current);
  };
  const endStroke = () => {
    drawingRef.current = false;
    setDraft(current => { if (current) setStrokes(previous => [...previous, current]); return null; });
    setRedo([]);
  };

  const explainWithAI = async () => {
    if (aiBusy) { setPaused(value => { pausedRef.current = !value; return !value; }); return; }
    if (mode === 'TEST') { setAiError('AI solutions are disabled in practice-test mode. Switch to study mode to reveal worked solutions.'); return; }
    if (!navigator.onLine) { setAiError('AI explanations need internet. The local calculator and chalkboard remain available offline.'); return; }
    if (!session?.access_token) { setAiError('Sign in to use AI step-by-step explanations.'); return; }
    setAiBusy(true); setAiError(''); setAiAnswer(''); setPaused(false);
    try {
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({
          mode: 'deep-dive', stream: true, subject,
          question: 'Explain this maths problem as a careful teacher, in ordinary readable writing and LaTeX notation. Number every step, explain each operation, show intermediate equations, and end with a checked answer. Avoid a giant paragraph. ' + (includeQuestion ? 'Exam question: ' + question + '\\n' : '') + (expression.trim() ? 'Student working or expression: ' + expression : 'Solve the exam question.'),
          options: [], correctAnswer: '', explanation: 'Write in progressive, classroom-style steps suitable for a Nigerian secondary-school student.',
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || 'The AI could not generate a solution. Try again.');
      }
      if (!response.body) throw new Error('Streaming is not supported by this connection.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let animationQueue = '';
      let animating = false;
      const animate = async () => {
        if (animating) return;
        animating = true;
        while (animationQueue.length) {
          if (pausedRef.current) { await new Promise(resolve => setTimeout(resolve, 100)); continue; }
          const count = Math.max(1, Math.round(speedRef.current * 3));
          accumulated += animationQueue.slice(0, count);
          animationQueue = animationQueue.slice(count);
          setAiAnswer(accumulated);
          await new Promise(resolve => setTimeout(resolve, 12));
        }
        animating = false;
      };
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() ?? '';
        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith('data:')) continue;
          const payload = line.slice(5).trim();
          if (!payload || payload === '[DONE]') continue;
          let event: { delta?: string; error?: string };
          try { event = JSON.parse(payload); } catch { continue; }
          if (event.error) throw new Error(event.error);
          if (typeof event.delta === 'string') { animationQueue += event.delta; void animate(); }
        }
      }
      while (animationQueue.length || animating) await new Promise(resolve => setTimeout(resolve, 40));
      if (!accumulated.trim()) throw new Error('The AI returned an empty solution.');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Unable to reach the AI.');
    } finally { setAiBusy(false); setPaused(false); }
  };

  return (
    <>
      {!open && <button type="button" onClick={() => setOpen(true)} aria-label="Open maths chalkboard" className="fixed right-0 top-[45%] z-[70] flex h-16 w-8 items-center justify-center rounded-l-xl border border-r-0 border-slate-600 bg-[#202522] text-white shadow-xl transition hover:w-10"><ArrowLeft className="h-5 w-5" /></button>}
      {open && <>
        <button type="button" aria-label="Close chalkboard backdrop" onClick={() => setOpen(false)} className="fixed inset-0 z-[69] bg-black/15" />
        <section aria-label="Examply maths chalkboard" className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col overflow-hidden rounded-t-2xl border border-[#3c4940] bg-[#202522] text-slate-100 shadow-2xl" style={{ height: height + 'dvh', transition: 'height 180ms ease-out' }}>
          <div onTouchStart={event => { const y = event.touches[0]?.clientY ?? 0; (event.currentTarget as HTMLDivElement).dataset.startY = String(y); }} onTouchEnd={event => { const start = Number((event.currentTarget as HTMLDivElement).dataset.startY); const end = event.changedTouches[0]?.clientY ?? start; if (start && Math.abs(end - start) > 30) setHeight(current => Math.max(28, Math.min(88, current + (start - end) / window.innerHeight * 100))); }} className="flex cursor-ns-resize items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
            <button type="button" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold hover:bg-white/10"><ArrowRight className="h-4 w-4" /> Chalkboard</button>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Smaller chalkboard" onClick={() => setHeight(v => Math.max(28, v - 8))} className="rounded-lg p-2 hover:bg-white/10"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 text-center text-xs text-slate-400">{height}%</span>
              <button type="button" aria-label="Larger chalkboard" onClick={() => setHeight(v => Math.min(88, v + 8))} className="rounded-lg p-2 hover:bg-white/10"><Plus className="h-4 w-4" /></button>
              <button type="button" aria-label="Close chalkboard" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10"><X className="h-4 w-4" /></button>
            </div>
          </div>
          <div className={'flex items-center gap-2 border-b border-white/10 px-3 py-1.5 text-xs ' + (online ? 'text-emerald-300' : 'text-amber-300')} aria-live="polite">{online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{online ? 'Online' : 'Offline — local board and supported calculations remain available'}<span className="ml-auto text-slate-500">{savedLocally ? 'Saved on this device' : 'Not saved'}</span></div>
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-3 py-2">
            <button type="button" onClick={() => setTool('chalk')} aria-pressed={tool === 'chalk'} className={'rounded-lg p-2 ' + (tool === 'chalk' ? 'bg-white/15' : 'hover:bg-white/10')} title="Chalk"><Pencil className="h-4 w-4" /></button>
            <button type="button" onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'} className={'rounded-lg p-2 ' + (tool === 'eraser' ? 'bg-white/15' : 'hover:bg-white/10')} title="Eraser"><Eraser className="h-4 w-4" /></button>
            {CHALK.map(item => <button key={item.value} type="button" onClick={() => { setColour(item.value); setTool('chalk'); }} aria-label={item.name + ' chalk'} aria-pressed={colour === item.value} className={'h-6 w-6 rounded-full border-2 ' + (colour === item.value ? 'border-white' : 'border-transparent')} style={{ backgroundColor: item.value }} />)}
            <button type="button" onClick={() => { setStrokes(items => { if (!items.length) return items; setRedo(redoItems => [...redoItems, items[items.length - 1]]); return items.slice(0, -1); }); }} className="rounded-lg p-2 hover:bg-white/10" title="Undo"><Undo2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => { setRedo(items => { if (!items.length) return items; setStrokes(previous => [...previous, items[items.length - 1]]); return items.slice(0, -1); }); }} className="rounded-lg p-2 hover:bg-white/10" title="Redo"><ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={() => { if (strokes.length && !window.confirm('Clear all chalkboard drawings? Your typed expression will be kept.')) return; setStrokes([]); setRedo([]); setDraft(null); }} className="rounded-lg p-2 hover:bg-white/10" title="Clear board"><Trash2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify({ strokes, expression })); setSavedLocally(true); } catch { setSavedLocally(false); }} className="rounded-lg p-2 hover:bg-white/10" title="Save workings on this device"><Save className="h-4 w-4" /></button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto p-3 md:grid-cols-2">
            <div className="flex min-h-48 flex-col gap-2">
              <canvas ref={canvasRef} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} className="min-h-32 w-full flex-1 touch-none rounded-xl border border-white/10 bg-[#202522]" aria-label="Draw maths with your finger" />
              <div className="flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold text-slate-300" htmlFor="chalkboard-expression">Type a calculation or supported linear equation</label><button type="button" onClick={() => setIncludeQuestion(v => !v)} aria-pressed={includeQuestion} className={'rounded-lg px-2 py-1 text-[11px] ' + (includeQuestion ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/5 text-slate-400')}>Include exam question {includeQuestion ? '✓' : ''}</button></div>
              <input id="chalkboard-expression" value={expression} onChange={event => setExpression(event.target.value)} placeholder="e.g. 2x + 5 = 13 or sqrt(81) + 4^2" className="w-full rounded-xl border border-white/15 bg-[#111613] px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400" />
              {mode === 'STUDY' && result && <div aria-live="polite" className="rounded-xl border border-emerald-400/20 bg-black/20 p-3 text-sm"><div className="mb-1 flex items-center gap-2 font-bold text-emerald-300"><Calculator className="h-4 w-4" /> Local solution</div>{result.steps.slice(0, revealedSteps).map((step, index) => <p key={index} className="mt-1 text-xs leading-relaxed text-slate-300">{index + 1}. {step}</p>)}{revealedSteps >= result.steps.length ? <div className="mt-2 border-t border-white/10 pt-2 text-base font-bold text-white">Answer: {result.result}</div> : <button type="button" onClick={() => setRevealedSteps(v => Math.min(result.steps.length, v + 1))} className="mt-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-[#122018]">Show next step</button>}<button type="button" onClick={() => setShowHint(v => !v)} className="ml-2 mt-2 inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs"><Lightbulb className="h-3.5 w-3.5" />{showHint ? 'Hide hint' : 'Hint'}</button>{showHint && <p className="mt-2 rounded-lg bg-white/5 p-2 text-xs text-amber-100">{result.steps.length > 1 ? result.steps[Math.min(revealedSteps, result.steps.length - 1)] : 'Check the order of operations and verify that your expression is complete.'}</p>}</div>}
              <p className="text-[10px] text-slate-500">Handwriting recognition is not enabled yet; finger drawing is currently a scratchpad.</p>
            </div>
            <div className="flex min-h-48 flex-col rounded-xl border border-white/10 bg-[#191e1b] p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-emerald-300" /> AI live writing</div><div className="flex items-center gap-1"><button type="button" onClick={() => setWriteSpeed(v => Math.max(0.5, v - 0.5))} className="rounded-lg px-2 py-1 text-xs hover:bg-white/10">−</button><span className="text-xs text-slate-400">{writeSpeed}×</span><button type="button" onClick={() => setWriteSpeed(v => Math.min(4, v + 0.5))} className="rounded-lg px-2 py-1 text-xs hover:bg-white/10">+</button></div></div>
              <div aria-live="polite" className="deep-dive-markdown min-h-20 flex-1 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-100"><MathMarkdown content={aiAnswer} />{aiBusy && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-emerald-300 align-middle" />}</div>
              {aiError && <p role="alert" className="mt-2 rounded-lg bg-red-950/60 p-2 text-xs text-red-200">{aiError}</p>}
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={explainWithAI} disabled={mode === 'TEST' || (!aiBusy && !online)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-extrabold text-[#122018] disabled:opacity-50">{aiBusy ? (paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />) : <Sparkles className="h-4 w-4" />}{aiBusy ? (paused ? 'Resume writing' : 'Pause writing') : 'Explain with AI'}</button><button type="button" onClick={() => { setAiAnswer(''); setAiError(''); }} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10">Clear AI</button></div>
              <p className="mt-2 text-[10px] text-slate-500">AI requires internet. Local typed calculations work offline. Practice-test mode keeps solution reveals disabled.</p>
            </div>
          </div>
        </section>
      </>}
    </>
  );
};
