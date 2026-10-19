import React, { useCallback, useEffect, useState } from 'react';
import { Bookmark, BookmarkX, LoaderCircle, Trash2, X } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

type StudyNote = {
  id: string;
  title: string;
  subject: string;
  question: string;
  content: string;
  created_at: string;
};

interface StudyNotesLibraryProps {
  onClose: () => void;
}

export const StudyNotesLibrary: React.FC<StudyNotesLibraryProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotes = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setError('Sign in to access your saved study notes.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    const { data, error: queryError } = await supabase
      .from('study_notes')
      .select('id,title,subject,question,content,created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (queryError) setError('Could not load study notes. Confirm the study_notes SQL migration has been applied.');
    else setNotes((data ?? []) as StudyNote[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { void loadNotes(); }, [loadNotes]);

  const deleteNote = async (id: string) => {
    const { error: deleteError } = await supabase.from('study_notes').delete().eq('id', id);
    if (deleteError) {
      setError('Could not delete this note. Try again.');
      return;
    }
    setNotes(current => current.filter(note => note.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-6" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="study-notes-title" className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-2.5 text-primary-700"><Bookmark className="h-5 w-5" /></div>
            <div>
              <h2 id="study-notes-title" className="text-lg font-black text-gray-900">Saved study notes</h2>
              <p className="text-xs text-gray-500">Synced to your account · up to 100 recent notes</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close study notes" className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
        </header>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50/60 p-4 sm:p-6">
          {loading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500"><LoaderCircle className="h-5 w-5 animate-spin" /> Loading notes…</div>}
          {!loading && error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {!loading && !error && notes.length === 0 && <div className="py-14 text-center"><BookmarkX className="mx-auto mb-3 h-10 w-10 text-gray-300" /><h3 className="font-bold text-gray-800">No saved explanations yet</h3><p className="mt-1 text-sm text-gray-500">Use “Save explanation” after a Deep Dive response.</p></div>}
          {!loading && notes.map(note => (
            <article key={note.id} className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary-700">{note.subject}</p>
                  <h3 className="mt-1 break-words font-bold text-gray-900">{note.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">{new Date(note.created_at).toLocaleString()}</p>
                </div>
                <button type="button" onClick={() => { if (window.confirm('Delete this saved note?')) void deleteNote(note.id); }} title="Delete note" aria-label="Delete note" className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
              <details className="mb-3">
                <summary className="cursor-pointer text-sm font-semibold text-gray-600">Original question</summary>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-600">{note.question}</p>
              </details>
              <div className="deep-dive-markdown min-w-0 break-words text-sm text-gray-700"><MathMarkdown content={note.content} /></div>
            </article>
          ))}
        </div>
        <footer className="border-t border-gray-100 bg-white p-4 text-right sm:px-7"><button onClick={onClose} className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700">Close</button></footer>
      </section>
    </div>
  );
};
