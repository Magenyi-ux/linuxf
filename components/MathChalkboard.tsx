import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eraser, Sparkles, Undo2, Trash2, Pencil, Calculator, X, Pause, Play, Minus, Plus, Lightbulb, Save, Wifi, WifiOff } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { evaluateMath } from './mathEvaluator';
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

export { evaluateMath } from './mathEvaluator';



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

    const paint = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.clearRect(0, 0, width, height);
      [...strokes, ...(draft ? [draft] : [])].forEach(stroke => {
        if (!stroke.points.length) return;
        ctx.globalCompositeOperation = stroke.erase ? 'destination-out' : 'source-over';
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = stroke.colour;
        ctx.lineWidth = stroke.width;
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        stroke.points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
        if (stroke.points.length === 1) {
          ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
        }
        ctx.stroke();
      });
      ctx.globalCompositeOperation = 'source-over';
    };

    const redraw = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      paint(ctx, rect.width, rect.height);
    };

    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    redraw();
    return () => observer.disconnect();
  }, [strokes, draft]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const beginStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    setDraft({ points: [pointFrom(event)], colour, width: tool === 'eraser' ? 22 : 3.5, erase: tool === 'eraser' });
  };
  const moveStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    event.preventDefault();
    const nativeEvent = event.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const coalesced = nativeEvent.getCoalescedEvents?.() ?? [nativeEvent];
    const points = coalesced.map(point => {
      const rect = event.currentTarget.getBoundingClientRect();
      return { x: point.clientX - rect.left, y: point.clientY - rect.top };
    });
    setDraft(current => current ? { ...current, points: [...current.points, ...points] } : current);
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
      {!open && <button type="button" onClick={() => setOpen(true)} aria-label="Open maths chalkboard" aria-expanded={open} className="fixed right-0 top-[42%] z-[70] flex min-h-16 items-center gap-2 rounded-l-2xl border border-r-0 border-[#a6b9a6]/40 bg-[#1b2a21] px-2.5 py-3 text-[#f4f1df] shadow-[0_8px_28px_rgba(0,0,0,0.35)] transition hover:bg-[#26392c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8d1a0]"><Pencil className="h-4 w-4" /><span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold tracking-[0.12em]">CHALKBOARD</span><ArrowLeft className="h-4 w-4" /></button>}
      {open && <>
        <button type="button" aria-label="Close chalkboard backdrop" onClick={() => setOpen(false)} className="fixed inset-0 z-[69] bg-black/15" />
        <section aria-label="Examply maths chalkboard" aria-modal="true" role="dialog" className="fixed bottom-0 left-0 right-0 z-[70] flex flex-col overflow-hidden rounded-t-[1.4rem] border border-[#6e806e]/60 bg-[#17231b] text-[#f1efdf] shadow-[0_-16px_55px_rgba(0,0,0,0.45)]" style={{ height: height + 'dvh', maxHeight: '88dvh', transition: 'height 180ms ease-out', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div onTouchStart={event => { const y = event.touches[0]?.clientY ?? 0; (event.currentTarget as HTMLDivElement).dataset.startY = String(y); }} onTouchEnd={event => { const start = Number((event.currentTarget as HTMLDivElement).dataset.startY); const end = event.changedTouches[0]?.clientY ?? start; if (start && Math.abs(end - start) > 30) setHeight(current => Math.max(30, Math.min(88, current + (start - end) / window.innerHeight * 100))); }} className="flex cursor-ns-resize flex-col items-center gap-1 border-b border-[#9cae91]/20 bg-[#203126] px-3 pb-2 pt-2">
            <div aria-hidden="true" className="mb-1 h-1 w-10 rounded-full bg-[#a9b79b]/70" />
            <div className="flex w-full items-center justify-between gap-2">
            <button type="button" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-bold hover:bg-white/10"><ArrowRight className="h-4 w-4" /> Examply <span className="font-normal text-[#b6c4ad]">/ Maths board</span></button>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Smaller chalkboard" onClick={() => setHeight(v => Math.max(28, v - 8))} className="rounded-lg p-2 hover:bg-white/10"><Minus className="h-4 w-4" /></button>
              <span className="min-w-10 text-center text-xs text-slate-400">{height}%</span>
              <button type="button" aria-label="Larger chalkboard" onClick={() => setHeight(v => Math.min(88, v + 8))} className="rounded-lg p-2 hover:bg-white/10"><Plus className="h-4 w-4" /></button>
              <button type="button" aria-label="Close chalkboard" onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8d1a0]"><X className="h-4 w-4" /></button>
            </div>
            </div>
          </div>
          <div className={'flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#9cae91]/20 px-4 py-2 text-[11px] sm:text-xs ' + (online ? 'text-[#c4e4c6]' : 'text-[#f1d38b]')} aria-live="polite">{online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}{online ? 'Online' : 'Offline — local board and supported calculations remain available'}<span className="ml-auto text-slate-500">{savedLocally ? 'Saved on this device' : 'Not saved'}</span></div>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#9cae91]/20 bg-[#1c2b21] px-3 py-2.5">
            <button type="button" onClick={() => setTool('chalk')} aria-pressed={tool === 'chalk'} className={'flex min-h-10 items-center gap-2 rounded-xl border px-3 ' + (tool === 'chalk' ? 'border-[#d8d1a0]/70 bg-[#d8d1a0]/15 text-[#f5efc6]' : 'border-transparent text-[#d3ddcd] hover:bg-white/10')} title="Chalk"><Pencil className="h-4 w-4" /><span className="text-xs font-semibold">Chalk</span></button>
            <button type="button" onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'} className={'flex min-h-10 items-center gap-2 rounded-xl border px-3 ' + (tool === 'eraser' ? 'border-[#d8d1a0]/70 bg-[#d8d1a0]/15 text-[#f5efc6]' : 'border-transparent text-[#d3ddcd] hover:bg-white/10')} title="Eraser"><Eraser className="h-4 w-4" /><span className="text-xs font-semibold">Erase</span></button>
            <span className="mx-1 hidden h-7 w-px bg-white/15 sm:block" aria-hidden="true" />
            {CHALK.map(item => <button key={item.value} type="button" onClick={() => { setColour(item.value); setTool('chalk'); }} aria-label={item.name + ' chalk'} aria-pressed={colour === item.value} className={'h-8 w-8 rounded-full border-[3px] shadow-sm transition-transform active:scale-90 ' + (colour === item.value ? 'border-[#f1efdf] ring-2 ring-[#d8d1a0]/50' : 'border-[#314333]')} style={{ backgroundColor: item.value }} />)}
            <button type="button" disabled={!strokes.length} onClick={() => { setStrokes(items => { if (!items.length) return items; setRedo(redoItems => [...redoItems, items[items.length - 1]]); return items.slice(0, -1); }); }} className="rounded-xl p-2.5 text-[#d3ddcd] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" title="Undo last stroke" aria-label="Undo last stroke"><Undo2 className="h-4 w-4" /></button>
            <button type="button" disabled={!redo.length} onClick={() => { setRedo(items => { if (!items.length) return items; setStrokes(previous => [...previous, items[items.length - 1]]); return items.slice(0, -1); }); }} className="rounded-xl p-2.5 text-[#d3ddcd] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30" title="Redo stroke" aria-label="Redo stroke"><ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={() => { if (strokes.length && !window.confirm('Clear all chalkboard drawings? Your typed expression will be kept.')) return; setStrokes([]); setRedo([]); setDraft(null); }} className="rounded-lg p-2 hover:bg-white/10" title="Clear board"><Trash2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify({ strokes, expression })); setSavedLocally(true); } catch { setSavedLocally(false); }}} className="rounded-lg p-2 hover:bg-white/10" title="Save workings on this device"><Save className="h-4 w-4" /></button>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto bg-[#152019] p-3 sm:p-4 md:grid-cols-2">
            <div className="flex min-h-[18rem] flex-col gap-3">
              <div className="flex items-center justify-between gap-2 px-1"><span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#b8c8af]">Your working</span><span className="text-[10px] text-[#80917f]">Draw with your finger</span></div>
              <canvas ref={canvasRef} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} onLostPointerCapture={endStroke} className="min-h-48 w-full flex-1 touch-none rounded-xl border border-[#72866d]/45 shadow-inner" style={{ backgroundColor: '#1b2a20', backgroundImage: 'radial-gradient(rgba(224, 231, 210, 0.055) 0.8px, transparent 0.8px)', backgroundSize: '10px 10px' }} aria-label="Draw maths with your finger" />
              <div className="flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold text-slate-300" htmlFor="chalkboard-expression">Type a calculation or supported linear equation</label><button type="button" onClick={() => setIncludeQuestion(v => !v)} aria-pressed={includeQuestion} className={'rounded-lg px-2 py-1 text-[11px] ' + (includeQuestion ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/5 text-slate-400')}>Include exam question {includeQuestion ? '✓' : ''}</button></div>
              <input id="chalkboard-expression" value={expression} onChange={event => setExpression(event.target.value)} placeholder="e.g. 2x + 5 = 13 or sqrt(81) + 4^2" className="w-full rounded-xl border border-[#71856d]/50 bg-[#0f1711] px-3 py-3 text-sm text-[#f1efdf] outline-none placeholder:text-[#778675] focus:border-[#d8d1a0] focus:ring-2 focus:ring-[#d8d1a0]/15" />
              {mode === 'STUDY' && result && <div aria-live="polite" className="rounded-xl border border-emerald-400/20 bg-black/20 p-3 text-sm"><div className="mb-1 flex items-center gap-2 font-bold text-emerald-300"><Calculator className="h-4 w-4" /> Local solution</div>{result.steps.slice(0, revealedSteps).map((step, index) => <p key={index} className="mt-1 text-xs leading-relaxed text-slate-300">{index + 1}. {step}</p>)}{revealedSteps >= result.steps.length ? <div className="mt-2 border-t border-white/10 pt-2 text-base font-bold text-white">Answer: {result.result}</div> : <button type="button" onClick={() => setRevealedSteps(v => Math.min(result.steps.length, v + 1))} className="mt-2 rounded-lg bg-emerald-400 px-3 py-2 text-xs font-bold text-[#122018]">Show next step</button>}<button type="button" onClick={() => setShowHint(v => !v)} className="ml-2 mt-2 inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-2 text-xs"><Lightbulb className="h-3.5 w-3.5" />{showHint ? 'Hide hint' : 'Hint'}</button>{showHint && <p className="mt-2 rounded-lg bg-white/5 p-2 text-xs text-amber-100">{result.steps.length > 1 ? result.steps[Math.min(revealedSteps, result.steps.length - 1)] : 'Check the order of operations and verify that your expression is complete.'}</p>}</div>}
              <p className="rounded-lg border border-[#8c9c7e]/15 bg-[#1c2b21] px-3 py-2 text-[10px] leading-relaxed text-[#aab9a2]">Drawing is a scratchpad; handwriting recognition is not enabled. Typed calculations are evaluated locally when supported.</p>
            </div>
            <div className="flex min-h-[18rem] flex-col rounded-xl border border-[#71856d]/35 bg-[#1c2a20] p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2 text-sm font-bold"><Sparkles className="h-4 w-4 text-[#d8d1a0]" /> AI live writing</div><div className="flex items-center gap-1"><button type="button" onClick={() => setWriteSpeed(v => Math.max(0.5, v - 0.5))} className="rounded-lg px-2 py-1 text-xs hover:bg-white/10">−</button><span className="text-xs text-slate-400">{writeSpeed}×</span><button type="button" onClick={() => setWriteSpeed(v => Math.min(4, v + 0.5))} className="rounded-lg px-2 py-1 text-xs hover:bg-white/10">+</button></div></div>
              <div aria-live="polite" className="deep-dive-markdown min-h-28 flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-[#71856d]/20 bg-[#121b15] p-3 text-sm leading-relaxed text-[#f1efdf]"><MathMarkdown content={aiAnswer} />{aiBusy && <span className="ml-1 inline-block h-3 w-1 animate-pulse bg-emerald-300 align-middle" />}</div>
              {aiError && <p role="alert" className="mt-2 rounded-lg bg-red-950/60 p-2 text-xs text-red-200">{aiError}</p>}
              <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={explainWithAI} disabled={mode === 'TEST' || (!aiBusy && !online)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-3 py-2 text-xs font-extrabold text-[#122018] disabled:opacity-50">{aiBusy ? (paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />) : <Sparkles className="h-4 w-4" />}{aiBusy ? (paused ? 'Resume writing' : 'Pause writing') : 'Explain with AI'}</button><button type="button" onClick={() => { setAiAnswer(''); setAiError(''); }} className="rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold hover:bg-white/10">Clear AI</button></div>
              <p className="mt-2 text-[10px] leading-relaxed text-[#94a28d]">AI requires internet. Typed calculations and the drawing board remain local. Practice-test mode keeps solution reveals disabled.</p>
            </div>
          </div>
        </section>
      </>}
    </>
  );
};
