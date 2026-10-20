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

export const StudyNoteGenerator: React.FC<StudyNoteGeneratorProps> = ({ onBack, onSignIn }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('Physics');
  const [topic, setTopic] = useState('');
  const [extraFocus, setExtraFocus] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
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
    setNote('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ mode: 'study-note', subject, topic: requestedTopic + (extraFocus.trim() ? '\nAdditional focus: ' + extraFocus.trim() : '') }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not generate the study note.');
      const content = typeof result.answer === 'string' ? result.answer.trim() : '';
      if (!content) throw new Error('The AI returned an empty note. Please try again.');
      setNote(content);
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

      {note && <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div><p className="text-xs font-bold uppercase tracking-wide text-primary-700">{subject}</p><p className="mt-1 text-xs text-slate-400">Generated study material</p></div>
          <button type="button" onClick={() => void saveNote()} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-50 disabled:opacity-50">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Saving…' : 'Save to Study notes'}</button>
        </div>
        <div className="deep-dive-markdown min-w-0 break-words text-sm leading-relaxed text-slate-800"><StudyNoteContent content={note} /></div>
      </article>}
    </section>
  );
};
