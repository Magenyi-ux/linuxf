import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookmarkPlus, BookOpenText, LoaderCircle, MessageCircle, Send, Sparkles } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { Subject } from '../types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface StudyChatProps {
  onBack: () => void;
  onSignIn: () => void;
}

const SUBJECT_OPTIONS = ['General', ...Object.values(Subject)];

export const StudyChat: React.FC<StudyChatProps> = ({ onBack, onSignIn }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('General');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [creatingNote, setCreatingNote] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const firstQuestion = useMemo(() => messages.find(message => message.role === 'user')?.content || '', [messages]);

  const sendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    if (!user) {
      setError('Sign in to chat with the AI and save notes to your account.');
      return;
    }
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    setError('');
    setNotice('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ mode: 'study-chat', subject, messages: nextMessages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'The AI could not respond. Please try again.');
      setMessages(current => [...current, { role: 'assistant', content: String(result.answer || '').trim() }]);
    } catch (caught) {
      setMessages(current => current.filter((message, index) => !(index === current.length - 1 && message.role === 'user' && message.content === text)));
      setInput(text);
      setError(caught instanceof Error ? caught.message : 'Could not reach the AI. Check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const createNote = async () => {
    if (!user) {
      setError('Sign in to save study notes.');
      return;
    }
    if (!messages.some(message => message.role === 'assistant')) {
      setError('Chat with the AI first, then create a note from the discussion.');
      return;
    }
    setCreatingNote(true);
    setError('');
    setNotice('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      const transcript = messages.map(message => `${message.role === 'user' ? 'Student' : 'Examply AI'}: ${message.content}`).join('\n\n');
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ mode: 'study-note', subject, transcript }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not prepare the study note.');
      const content = String(result.answer || '').trim();
      if (!content) throw new Error('The AI returned an empty note. Try again.');
      const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim().slice(0, 170) || `Study note: ${subject}`;
      if (!isSupabaseConfigured) throw new Error('Cloud notes are not configured right now.');
      const { error: saveError } = await supabase.from('study_notes').insert({
        user_id: user.id,
        title,
        subject: subject.slice(0, 80) || 'General',
        question: firstQuestion.slice(0, 2000) || 'Study chat discussion',
        content: content.slice(0, 20000),
      });
      if (saveError) throw new Error('The note was generated, but could not be saved. Confirm the study_notes database migration is applied.');
      setNotice('Study note created and saved to your Study notes library.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the note. Please try again.');
    } finally {
      setCreatingNote(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[68vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} aria-label="Back to home" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><MessageCircle className="h-5 w-5" /></div>
          <div><h1 className="font-extrabold text-slate-900">Study Chat</h1><p className="text-xs text-slate-500">Learn through conversation. Turn it into a study note.</p></div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void createNote()} disabled={creatingNote || sending || messages.length < 2} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-3 py-2 text-sm font-bold text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-50">
            {creatingNote ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />}
            Create note
          </button>
        </div>
      </header>

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <label htmlFor="study-chat-subject" className="mr-3 text-xs font-bold uppercase tracking-wide text-slate-500">Subject</label>
        <select id="study-chat-subject" value={subject} onChange={event => setSubject(event.target.value)} className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500">
          {SUBJECT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5" aria-live="polite">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md py-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm"><BookOpenText className="h-7 w-7" /></div>
            <h2 className="text-lg font-extrabold text-slate-900">What are you learning today?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Ask a question, explore a topic, or work through an example. When you are ready, create a structured note with definitions, explanations, worked examples, a summary, and self-test questions.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {['Explain a difficult concept simply', 'Give me a worked example', 'Test my understanding'].map(prompt => <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-700">{prompt}</button>)}
            </div>
          </div>
        )}
        {messages.map((message, index) => (
          <article key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] ${message.role === 'user' ? 'bg-primary-600 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
              <p className={`mb-2 text-[10px] font-extrabold uppercase tracking-wider ${message.role === 'user' ? 'text-white/75' : 'text-primary-700'}`}>{message.role === 'user' ? 'You' : 'Examply AI'}</p>
              {message.role === 'user'
                ? <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
                : <div className="deep-dive-markdown min-w-0 break-words text-sm leading-relaxed"><MathMarkdown content={message.content} /></div>}
            </div>
          </article>
        ))}
        {sending && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Thinking through your question…</div>}
      </div>

      {error && <p role="alert" className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5">{error}{!user && <button type="button" onClick={onSignIn} className="ml-2 font-bold underline">Sign in</button>}</p>}
      {notice && <p role="status" className="mx-4 mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:mx-5">{notice}</p>}

      <form onSubmit={sendMessage} className="border-t border-slate-100 bg-white p-3 sm:p-4">
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-primary-400 focus-within:ring-2 focus-within:ring-primary-100">
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} maxLength={2000} placeholder={user ? 'Ask an academic question…' : 'Sign in to start chatting…'} aria-label="Your message" className="max-h-32 min-h-11 flex-1 resize-y bg-transparent px-2 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400" />
          <button type="submit" disabled={sending || !input.trim()} aria-label="Send message" className="mb-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 px-1 text-[11px] text-slate-400"><Sparkles className="mr-1 inline h-3 w-3" /> AI can make mistakes. Check important facts against your class notes or trusted textbooks.</p>
      </form>
    </section>
  );
};
