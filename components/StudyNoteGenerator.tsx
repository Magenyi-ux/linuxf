import React, { useState } from 'react';
import { ArrowLeft, BookOpenText, FileText, LoaderCircle, Save, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { Subject } from '../types';
import { StudyNoteContent } from './StudyNoteContent';

interface StudyNoteGeneratorProps {
  onBack: () => void;
  onSignIn: () => void;
}

const SUBJECT_OPTIONS = ['General', ...Object.values(Subject)];

async function consumeAIStream(response: Response, onDelta: (delta: string) => void): Promise<string> {
  if (!response.ok) {
    let message = 'Could not generate the study note.';
    try { message = (await response.json()).error || message; } catch { /* Keep fallback message. */ }
    throw new Error(message);
  }
  if (!response.body) throw new Error('Streaming is unavailable. Please try again.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let generated = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        let event: any;
        try { event = JSON.parse(payload); } catch { continue; }
        if (event.error) throw new Error(event.error);
        if (typeof event.delta === 'string' && event.delta) {
          generated += event.delta;
          onDelta(event.delta);
        }
      }
    }
  } finally { reader.releaseLock(); }
  if (!generated.trim()) throw new Error('The AI returned an empty note. Please try again.');
  return generated;
}

function sectionLooksComplete(stage: 'foundation' | 'technical' | 'revision', content: string): boolean {
  const text = content.toLowerCase();
  if (content.trim().length < 350) return false;
  if (stage === 'foundation') return /learning objectives/.test(text) && /key terms|definitions/.test(text) && /explanation/.test(text);
  if (stage === 'technical') return /worked example/.test(text) && /formula|principle|classification/.test(text);
  return /summary/.test(text) && /question/.test(text) && /answer/.test(text);
}

export const StudyNoteGenerator: React.FC<StudyNoteGeneratorProps> = ({ onBack, onSignIn }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [extraFocus, setExtraFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [progressKey, setProgressKey] = useState('');
  const [noteComplete, setNoteComplete] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const generateNote = async (event: React.FormEvent) => {
    event.preventDefault();
    const requestedTopic = topic.trim();
    if (!requestedTopic || generating) return;
    if (!user) {
      setError('Sign in to generate and save study notes.');
      return;
    }
    setGenerating(true);
    setError('');
    setNotice('');
    setNoteComplete(false);
    const fullTopic = requestedTopic + (extraFocus.trim() ? '\nAdditional focus: ' + extraFocus.trim() : '');
    const currentProgressKey = subject + '|' + fullTopic;
    const resumeExisting = progressKey === currentProgressKey && completedSections.length > 0;
    let savedSections = resumeExisting ? [...completedSections] : [];
    if (!resumeExisting) {
      setNote('');
      setCompletedSections([]);
      setProgressKey(currentProgressKey);
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      const stages = [
        { id: 'foundation' as const, label: 'Core explanation' },
        { id: 'technical' as const, label: 'Formulas and worked examples' },
        { id: 'revision' as const, label: 'Summary and revision questions' },
      ];
      let completedNote = savedSections.join('\n\n');
      for (const stage of stages.slice(savedSections.length)) {
        let stageCompleted = false;
        let lastError: unknown;
        for (let attempt = 0; attempt < 2 && !stageCompleted; attempt += 1) {
          let stageText = '';
          setNote(completedNote);
          try {
            const response = await fetch('/api/nvidia', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
              body: JSON.stringify({
                mode: 'study-note',
                subject,
                topic: fullTopic,
                noteStage: stage.id,
                previousNote: completedNote,
                stream: true,
              }),
            });
            stageText = await consumeAIStream(response, delta => {
              stageText += delta;
              setNote(completedNote + stageText);
            });
            if (!sectionLooksComplete(stage.id, stageText)) {
              throw new Error(stage.label + ' was incomplete. Retrying this section.');
            }
            savedSections = [...savedSections, stageText.trim()];
            completedNote = savedSections.join('\n\n');
            setCompletedSections(savedSections);
            setNote(completedNote);
            stageCompleted = true;
          } catch (caught) {
            lastError = caught;
            // Discard only this failed attempt; previously completed sections remain intact.
            setNote(completedNote);
          }
        }
        if (!stageCompleted) {
          throw new Error(
            (lastError instanceof Error ? lastError.message : 'AI generation failed') +
            ' Earlier completed sections have been preserved. Select Generate note to try again.'
          );
        }
      }
      const requiredSections = [
        /learning objectives/i,
        /key terms|definitions/i,
        /worked examples/i,
        /common mistakes|misconceptions/i,
        /summary/i,
        /answers to self-check|answer key|answers/i,
      ];
      if (!requiredSections.every(pattern => pattern.test(completedNote))) {
        // Keep the foundation and technical sections, then regenerate only the revision section on retry.
        savedSections = savedSections.slice(0, 2);
        setCompletedSections(savedSections);
        setNote(savedSections.join('\n\n'));
        setNoteComplete(false);
        throw new Error('The final note needs a completeness repair. Select Generate note to retry the revision section.');
      }
      setNoteComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not generate the note. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  };

  const saveNote = async () => {
    if (!user) {
      setError('Sign in to save study notes.');
      return;
    }
    if (!note) return;
    if (!noteComplete) {
      setError('This note is incomplete and cannot be saved yet. Finish generation first.');
      return;
    }
    if (!isSupabaseConfigured) {
      setError('Cloud notes are not configured right now.');
      return;
    }
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const title = note.match(/^#\s+(.+)$/m)?.[1]?.trim().slice(0, 170) || 'Study note: ' + topic.trim();
      const { error: saveError } = await supabase.from('study_notes').insert({
        user_id: user.id,
        title,
        subject: subject.slice(0, 80) || 'General',
        question: topic.trim().slice(0, 2000),
        content: note.slice(0, 20000),
      });
      if (saveError) throw new Error('The note was generated, but could not be saved. Try again.');
      setNotice('Study note saved to your Study notes library.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save the note.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-5">
      <header className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} aria-label="Back to home" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><FileText className="h-5 w-5" /></div>
        <div><h1 className="text-xl font-extrabold text-slate-900">Study Note Generator</h1><p className="text-sm text-slate-500">Create a complete study note with visual diagrams, examples, and review questions.</p></div>
      </header>

      <form onSubmit={generateNote} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Subject
            <select value={subject} onChange={event => setSubject(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-primary-500">
              {SUBJECT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-slate-700">Topic
            <input value={topic} onChange={event => setTopic(event.target.value)} maxLength={180} required placeholder="e.g. Fibre optics, electrolysis, photosynthesis" className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary-500" />
          </label>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">What should the note focus on? <span className="font-normal text-slate-400">Optional</span>
          <textarea value={extraFocus} onChange={event => setExtraFocus(event.target.value)} maxLength={500} rows={2} placeholder="e.g. labelled structure, equations, JAMB-style examples" className="resize-y rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-primary-500" />
        </label>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-xs leading-relaxed text-slate-500"><Sparkles className="mr-1 inline h-3.5 w-3.5" /> Notes use textbook-style explanations and original diagrams. AI-generated content should be checked against trusted class materials.</p>
          <button type="submit" disabled={generating || !topic.trim()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50">
            {generating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BookOpenText className="h-4 w-4" />}{generating ? 'Generating note…' : 'Generate note'}
          </button>
        </div>
      </form>

      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}{!user && <button type="button" onClick={onSignIn} className="ml-2 font-bold underline">Sign in</button>}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {(note || generating) && <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div><p className="text-xs font-bold uppercase tracking-wide text-primary-700">{subject}</p><p className="mt-1 text-xs text-slate-400">Generated study material</p></div>
          <button type="button" onClick={() => void saveNote()} disabled={saving || generating || !noteComplete} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50 disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving…' : !noteComplete ? 'Complete note to save' : 'Save to Study notes'}</button>
        </div>
        <div className="deep-dive-markdown min-w-0 break-words text-sm leading-relaxed text-slate-800">{note ? <StudyNoteContent content={note} /> : <p className="text-sm text-slate-500">Preparing your note…</p>}</div>
      </article>}
    </section>
  );
};
