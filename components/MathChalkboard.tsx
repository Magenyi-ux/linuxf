import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eraser, Undo2, Trash2, Pencil, Calculator, X, Pause, Play, Lightbulb, Save, Maximize2, Minimize2, ZoomIn, ZoomOut, Hand } from 'lucide-react';
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
  const [canvasExpanded, setCanvasExpanded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [handMode, setHandMode] = useState(false);
  const panRef = useRef<{ active: boolean; x: number; y: number; originX: number; originY: number }>({ active: false, x: 0, y: 0, originX: 0, originY: 0 });
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
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.translate(panOffset.x, panOffset.y);
      ctx.scale(zoom, zoom);
      paint(ctx, rect.width, rect.height);
    };

    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    redraw();
    return () => observer.disconnect();
  }, [strokes, draft, zoom, panOffset]);

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: (event.clientX - rect.left - panOffset.x) / zoom, y: (event.clientY - rect.top - panOffset.y) / zoom };
  };
  const beginStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (handMode || event.button === 1) {
      panRef.current = { active: true, x: event.clientX, y: event.clientY, originX: panOffset.x, originY: panOffset.y };
      return;
    }
    drawingRef.current = true;
    setDraft({ points: [pointFrom(event)], colour, width: tool === 'eraser' ? 22 : 3.5, erase: tool === 'eraser' });
  };
  const moveStroke = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (panRef.current.active) {
      event.preventDefault();
      setPanOffset({ x: panRef.current.originX + event.clientX - panRef.current.x, y: panRef.current.originY + event.clientY - panRef.current.y });
      return;
    }
    if (!drawingRef.current) return;
    event.preventDefault();
    const nativeEvent = event.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const coalesced = nativeEvent.getCoalescedEvents?.() ?? [nativeEvent];
    const points = coalesced.map(point => {
      const rect = event.currentTarget.getBoundingClientRect();
      return { x: (point.clientX - rect.left - panOffset.x) / zoom, y: (point.clientY - rect.top - panOffset.y) / zoom };
    });
    setDraft(current => current ? { ...current, points: [...current.points, ...points] } : current);
  };
  const endStroke = () => {
    if (panRef.current.active) { panRef.current.active = false; return; }
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
      {!open && <button type="button" onClick={() => setOpen(true)} aria-label="Open maths workspace" aria-expanded={open} className="fixed right-3 top-[42%] z-[70] inline-flex min-h-12 items-center gap-2 rounded-full border border-black/5 bg-[#f5f5f7]/95 px-4 py-3 text-[#1d1d1f] shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
        <Pencil className="h-4 w-4" /><span className="text-sm font-semibold">Maths</span><ArrowLeft className="h-4 w-4" />
      </button>}
      {open && (
        <section aria-label="Examply maths workspace" aria-modal="true" role="dialog" className="fixed inset-0 z-[100] flex h-[100dvh] flex-col overflow-hidden bg-[#f5f5f7] text-[#1d1d1f]">
          <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-black/[0.06] bg-white/85 px-4 py-3 backdrop-blur-2xl sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#1d1d1f] text-white shadow-sm"><Calculator className="h-[18px] w-[18px]" /></div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5"><h2 className="text-sm font-semibold tracking-tight sm:text-base">Maths Workspace</h2><span className="hidden text-[#86868b] sm:inline">/</span><span className="truncate text-xs text-[#6e6e73] sm:text-sm">{subject}</span></div>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#6e6e73]">
                  <span className={'h-1.5 w-1.5 rounded-full ' + (online ? 'bg-[#30a46c]' : 'bg-[#d98b26]')} />
                  {online ? 'Ready to work' : 'Offline · Local tools available'}
                  <span className="text-[#c7c7cc]">·</span>{savedLocally ? 'Saved on this device' : 'Autosave enabled'}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button type="button" onClick={() => { try { localStorage.setItem(storageKey, JSON.stringify({ strokes, expression })); setSavedLocally(true); } catch { setSavedLocally(false); } }} className="hidden items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-2 text-xs font-medium text-[#424245] transition hover:bg-[#f5f5f7] sm:inline-flex" title="Save workings on this device"><Save className="h-3.5 w-3.5" /> Save</button>
              <button type="button" aria-label="Close maths workspace" onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e8e8ed] text-[#424245] transition hover:bg-[#dcdce2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"><X className="h-4 w-4" /></button>
            </div>
          </header>

          <nav aria-label="Drawing tools" className="z-10 flex shrink-0 items-center gap-2 overflow-x-auto border-b border-black/[0.06] bg-white px-3 py-2.5 sm:px-6">
            <div className="flex shrink-0 items-center rounded-full bg-[#f5f5f7] p-1">
              <button type="button" onClick={() => setTool('chalk')} aria-pressed={tool === 'chalk'} className={'inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition ' + (tool === 'chalk' ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/[0.04]' : 'text-[#6e6e73] hover:text-[#1d1d1f]')} title="Chalk"><Pencil className="h-4 w-4" /><span>Draw</span></button>
              <button type="button" onClick={() => setTool('eraser')} aria-pressed={tool === 'eraser'} className={'inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition ' + (tool === 'eraser' ? 'bg-white text-[#1d1d1f] shadow-sm ring-1 ring-black/[0.04]' : 'text-[#6e6e73] hover:text-[#1d1d1f]')} title="Eraser"><Eraser className="h-4 w-4" /><span>Erase</span></button>
            </div>
            <span className="mx-1 h-6 w-px shrink-0 bg-black/10" aria-hidden="true" />
            <div className="flex shrink-0 items-center gap-1.5" aria-label="Chalk colour">
              {CHALK.map(item => <button key={item.value} type="button" onClick={() => { setColour(item.value); setTool('chalk'); }} aria-label={item.name + ' chalk'} aria-pressed={colour === item.value} className={'flex h-8 w-8 items-center justify-center rounded-full border transition ' + (colour === item.value ? 'border-[#0071e3] bg-[#f5f5f7] ring-2 ring-[#0071e3]/15' : 'border-black/[0.07] bg-white hover:bg-[#f5f5f7]')}><span className="h-4 w-4 rounded-full" style={{ backgroundColor: item.value, boxShadow: item.value === '#f8fafc' ? 'inset 0 0 0 1px rgba(0,0,0,.16)' : undefined }} /></button>)}
            </div>
            <span className="mx-1 h-6 w-px shrink-0 bg-black/10" aria-hidden="true" />
            <button type="button" disabled={!strokes.length} onClick={() => { setStrokes(items => { if (!items.length) return items; setRedo(redoItems => [...redoItems, items[items.length - 1]]); return items.slice(0, -1); }); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#424245] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-30" title="Undo last stroke" aria-label="Undo last stroke"><Undo2 className="h-4 w-4" /></button>
            <button type="button" disabled={!redo.length} onClick={() => { setRedo(items => { if (!items.length) return items; setStrokes(previous => [...previous, items[items.length - 1]]); return items.slice(0, -1); }); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#424245] transition hover:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:opacity-30" title="Redo stroke" aria-label="Redo stroke"><ArrowRight className="h-4 w-4" /></button>
            <button type="button" onClick={() => { if (strokes.length && !window.confirm('Clear all chalkboard drawings? Your typed expression will be kept.')) return; setStrokes([]); setRedo([]); setDraft(null); }} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#6e6e73] transition hover:bg-[#fff0f0] hover:text-[#c93434]" title="Clear board" aria-label="Clear board"><Trash2 className="h-4 w-4" /></button>
            <span className="ml-auto hidden shrink-0 pr-1 text-[11px] text-[#86868b] sm:inline">Changes save on this device</span>
          </nav>

          <main className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] lg:overflow-hidden">
            <section className="flex min-h-[70dvh] flex-col border-b border-black/[0.06] p-3 sm:p-5 lg:min-h-0 lg:border-b-0 lg:border-r lg:p-6">
              <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold tracking-tight">Working area</h3><p className="mt-0.5 text-xs text-[#86868b]">Write or sketch your method</p></div>
                <div className="flex items-center gap-1.5">
                  <button type="button" onClick={() => setHandMode(v => !v)} aria-pressed={handMode} title={handMode ? 'Switch to drawing mode' : 'Pan canvas'} className={'flex h-9 w-9 items-center justify-center rounded-full border transition ' + (handMode ? 'border-[#0071e3] bg-[#e5f2ff] text-[#0066cc]' : 'border-black/[0.08] bg-white text-[#424245] hover:bg-[#f5f5f7]')}><Hand className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setZoom(v => Math.max(0.35, Math.round((v - 0.15) * 100) / 100))} aria-label="Zoom out" title="Zoom out" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#424245] hover:bg-[#f5f5f7]"><ZoomOut className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setZoom(1)} title="Reset zoom" className="min-w-12 rounded-full border border-black/[0.08] bg-white px-2 py-2 text-[11px] font-semibold tabular-nums text-[#424245]">{Math.round(zoom * 100)}%</button>
                  <button type="button" onClick={() => setZoom(v => Math.min(3, Math.round((v + 0.15) * 100) / 100))} aria-label="Zoom in" title="Zoom in" className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#424245] hover:bg-[#f5f5f7]"><ZoomIn className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setCanvasExpanded(v => !v)} aria-label={canvasExpanded ? 'Exit full-screen writing area' : 'Maximize writing area'} title={canvasExpanded ? 'Exit full screen' : 'Maximize writing area'} className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#424245] transition hover:bg-[#f5f5f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">{canvasExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
                </div>
              </div>
              <div className={'relative min-h-[34dvh] flex-1 overflow-hidden border border-black/10 bg-[#173322] shadow-[0_10px_28px_rgba(20,38,26,0.12)] lg:min-h-0 ' + (canvasExpanded ? 'fixed inset-0 z-[120] h-[100dvh] min-h-0 rounded-none' : 'rounded-[18px]')}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: 'radial-gradient(rgba(236, 244, 231, 0.12) 0.7px, transparent 0.7px)', backgroundSize: '16px 16px' }} />
                <canvas ref={canvasRef} onPointerDown={beginStroke} onPointerMove={moveStroke} onPointerUp={endStroke} onPointerCancel={endStroke} onLostPointerCapture={endStroke} className={'absolute inset-0 h-full w-full touch-none ' + (handMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair')} aria-label={handMode ? 'Pan the maths canvas' : 'Draw maths with your finger or stylus'} />
                {canvasExpanded && <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-[#101814]/90 p-2 text-white shadow-xl backdrop-blur-xl sm:right-5 sm:top-5">
                  <button type="button" onClick={() => setHandMode(v => !v)} aria-label={handMode ? 'Switch to drawing mode' : 'Pan canvas'} title={handMode ? 'Drawing mode' : 'Pan canvas'} className={'flex h-10 w-10 items-center justify-center rounded-xl ' + (handMode ? 'bg-white text-[#173322]' : 'text-white hover:bg-white/10')}><Hand className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setZoom(v => Math.max(0.35, Math.round((v - 0.15) * 100) / 100))} aria-label="Zoom out" className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"><ZoomOut className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setZoom(1)} aria-label="Reset zoom" className="min-w-12 rounded-xl px-2 py-2 text-xs font-semibold tabular-nums hover:bg-white/10">{Math.round(zoom * 100)}%</button>
                  <button type="button" onClick={() => setZoom(v => Math.min(3, Math.round((v + 0.15) * 100) / 100))} aria-label="Zoom in" className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"><ZoomIn className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setCanvasExpanded(false)} aria-label="Exit full-screen writing area" title="Exit full screen" className="flex h-10 w-10 items-center justify-center rounded-xl text-white hover:bg-white/10"><Minimize2 className="h-4 w-4" /></button>
                </div>}
                {!strokes.length && !draft && <div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="rounded-2xl border border-white/15 bg-black/10 px-5 py-4 text-center text-white/70 backdrop-blur-sm"><Pencil className="mx-auto mb-2 h-5 w-5 opacity-70" /><p className="text-sm font-medium">Start writing here</p><p className="mt-1 text-xs text-white/50">Your working stays on this device</p></div></div>}
              </div>
              <div className="mt-4 shrink-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><label className="text-xs font-semibold text-[#424245]" htmlFor="chalkboard-expression">Calculator & equation solver</label><button type="button" onClick={() => setIncludeQuestion(v => !v)} aria-pressed={includeQuestion} className={'rounded-full px-3 py-1.5 text-[11px] font-medium transition ' + (includeQuestion ? 'bg-[#e5f2ff] text-[#0066cc]' : 'bg-white text-[#6e6e73] ring-1 ring-black/[0.06]')}>Include exam question {includeQuestion ? '✓' : ''}</button></div>
                <input id="chalkboard-expression" value={expression} onChange={event => setExpression(event.target.value)} placeholder="e.g. 2x + 5 = 13 or sqrt(81) + 4^2" className="w-full rounded-[14px] border border-black/[0.09] bg-white px-4 py-3.5 text-sm text-[#1d1d1f] shadow-sm outline-none transition placeholder:text-[#a1a1a6] focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10" />
                {mode === 'STUDY' && result && <div aria-live="polite" className="mt-3 rounded-[16px] border border-[#30a46c]/20 bg-white p-4 shadow-sm"><div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#18794e]"><Calculator className="h-4 w-4" /> Local solution</div>{result.steps.slice(0, revealedSteps).map((step, index) => <p key={index} className="mt-1.5 text-xs leading-relaxed text-[#424245]">{index + 1}. {step}</p>)}{revealedSteps >= result.steps.length ? <div className="mt-3 border-t border-black/[0.06] pt-3 text-base font-semibold text-[#1d1d1f]">Answer: {result.result}</div> : <button type="button" onClick={() => setRevealedSteps(v => Math.min(result.steps.length, v + 1))} className="mt-3 rounded-full bg-[#0071e3] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0077ed]">Show next step</button>}<button type="button" onClick={() => setShowHint(v => !v)} className="ml-2 mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 py-2 text-xs font-medium text-[#424245]"><Lightbulb className="h-3.5 w-3.5" />{showHint ? 'Hide hint' : 'Hint'}</button>{showHint && <p className="mt-3 rounded-xl bg-[#fff7df] p-3 text-xs text-[#70551b]">{result.steps.length > 1 ? result.steps[Math.min(revealedSteps, result.steps.length - 1)] : 'Check the order of operations and verify that your expression is complete.'}</p>}</div>}
                <p className="mt-3 text-[11px] leading-relaxed text-[#86868b]">Scratchpad only — handwriting recognition is not enabled. Supported typed calculations are evaluated locally.</p>
              </div>
            </section>

            <section className="flex min-h-[60dvh] flex-col bg-white p-3 sm:p-5 lg:min-h-0 lg:bg-[#fbfbfd] lg:p-6">
              <div className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div><h3 className="text-sm font-semibold tracking-tight">AI explanation</h3><p className="mt-0.5 text-xs text-[#86868b]">Step-by-step, like a tutor</p></div>
                <div className="flex items-center gap-1 rounded-full bg-[#f0f0f5] p-1"><button type="button" onClick={() => setWriteSpeed(v => Math.max(0.5, v - 0.5))} aria-label="Decrease writing speed" className="flex h-7 w-7 items-center justify-center rounded-full text-[#424245] hover:bg-white">−</button><span className="min-w-9 text-center text-[11px] font-medium text-[#6e6e73]">{writeSpeed}×</span><button type="button" onClick={() => setWriteSpeed(v => Math.min(4, v + 0.5))} aria-label="Increase writing speed" className="flex h-7 w-7 items-center justify-center rounded-full text-[#424245] hover:bg-white">+</button></div>
              </div>
              <div aria-live="polite" className="deep-dive-markdown min-h-[28dvh] flex-1 overflow-y-auto whitespace-pre-wrap break-words rounded-[18px] border border-black/[0.07] bg-white p-4 text-sm leading-relaxed text-[#1d1d1f] shadow-[0_2px_10px_rgba(0,0,0,0.025)] sm:p-5 lg:min-h-0"><MathMarkdown content={aiAnswer} />{aiBusy && <span className="ml-1 inline-block h-3 w-1 animate-pulse rounded-full bg-[#0071e3] align-middle" />}{!aiAnswer && !aiBusy && <div className="flex h-full min-h-32 flex-col items-center justify-center text-center"><p className="text-sm font-medium text-[#424245]">Your explanation will appear here</p><p className="mt-1 max-w-xs text-xs leading-relaxed text-[#86868b]">Ask for the method, intermediate steps, and a checked final answer.</p></div>}</div>
              {aiError && <p role="alert" className="mt-3 rounded-[12px] bg-[#fff0f0] p-3 text-xs text-[#b42318]">{aiError}</p>}
              <div className="mt-4 flex shrink-0 flex-wrap gap-2">
                <button type="button" onClick={explainWithAI} disabled={mode === 'TEST' || (!aiBusy && !online)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0071e3] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0077ed] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">{aiBusy ? (paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />) : null}{aiBusy ? (paused ? 'Resume writing' : 'Pause writing') : mode === 'TEST' ? 'AI disabled in test mode' : 'Explain with AI'}</button>
                <button type="button" onClick={() => { setAiAnswer(''); setAiError(''); }} className="min-h-11 rounded-full border border-black/[0.09] bg-white px-4 py-2.5 text-xs font-medium text-[#424245] transition hover:bg-[#f5f5f7]">Clear</button>
              </div>
              <p className="mt-3 shrink-0 text-[11px] leading-relaxed text-[#86868b]">AI explanations require internet. Drawing and supported calculations work locally. Practice-test mode keeps solution reveals disabled.</p>
            </section>
          </main>
          <div className="shrink-0 border-t border-black/[0.06] bg-white/90 px-4 py-2 text-center text-[10px] text-[#86868b] backdrop-blur-xl sm:hidden" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>Examply · Focus on understanding</div>
        </section>
      )}
    </>
  );
};
