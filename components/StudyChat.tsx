import React, { useState } from 'react';
import { ArrowLeft, BookOpenText, LoaderCircle, MessageCircle, Send, Sparkles } from 'lucide-react';
import { MathMarkdown } from './MathMarkdown';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Subject } from '../types';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

interface StudyChatProps {
  onBack: () => void;
  onSignIn: () => void;
}

const SUBJECT_OPTIONS = ['General', ...Object.values(Subject)];

// Detect strong signs of truncation without continuing normal, complete short answers.
function answerLooksIncomplete(answer: string): boolean {
  const text = answer.trim();
  if (!text) return false;
  const fences = (text.match(/```/g) || []).length;
  if (fences % 2 === 1) return true;
  if (/[=:→+×÷*/\\,;\-]\s*$/.test(text)) return true;
  if (/\b(?:and|or|but|because|which|that|with|for|to|of|including|where|when|at|by|from|is|are|the)\s*$/i.test(text)) return true;
  if (/\b(?:we get|we have|substituting|therefore|hence|for example|the formula is)\s*[:,-]?$/i.test(text)) return true;
  if (/\b(?:MA|F|m|a|η|efficiency)\s*=\s*$/i.test(text)) return true;
  return !/[.!?…)}\]]$/.test(text) && text.length > 180;
}

async function consumeAIStream(response: Response, onDelta: (delta: string) => void): Promise<void> {
  if (!response.ok) {
    let message = 'The AI could not respond. Please try again.';
    try { message = (await response.json()).error || message; } catch { /* Keep fallback message. */ }
    throw new Error(message);
  }
  if (!response.body) throw new Error('Streaming is unavailable. Please try again.');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let receivedText = false;
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
        if (typeof event.delta === 'string' && event.delta) { receivedText = true; onDelta(event.delta); }
      }
    }
  } finally { reader.releaseLock(); }
  if (!receivedText) throw new Error('The AI returned an empty answer. Please retry.');
}

export const StudyChat: React.FC<StudyChatProps> = ({ onBack, onSignIn }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('General');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [continuing, setContinuing] = useState(false);

  const streamRequest = async (accessToken: string, history: ChatMessage[], continueFromPartial = false) => {
    const response = await fetch('/api/nvidia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + accessToken },
      body: JSON.stringify({ mode: 'study-chat', subject, messages: history, stream: true, continueFromPartial }),
    });
    await consumeAIStream(response, delta => {
      setMessages(current => {
        const updated = [...current];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, content: last.content + delta };
        return updated;
      });
    });
  };

  const continueAnswer = async () => {
    if (sending || !user) return;
    const latestAssistantIndex = [...messages].map(message => message.role).lastIndexOf('assistant');
    if (latestAssistantIndex < 0 || !messages[latestAssistantIndex].content.trim()) return;
    setSending(true); setContinuing(true); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      const history = messages.slice(0, latestAssistantIndex + 1);
      history.push({ role: 'user', content: 'Continue the previous explanation from its exact stopping point. Do not repeat existing text. Finish any incomplete sentence, formula, table, worked example, or promised section.' });
      await streamRequest(session.access_token, history, true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not continue the explanation. Your existing answer has been preserved.');
    } finally { setSending(false); setContinuing(false); }
  };

  const sendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    if (!user) { setError('Sign in to chat with the AI.'); return; }
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }, { role: 'assistant', content: '' }];
    setMessages(nextMessages); setInput(''); setSending(true); setContinuing(false); setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');
      await streamRequest(session.access_token, nextMessages.slice(0, -1));
      // Background completeness check: retry at most twice to prevent runaway generation.
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const currentMessages = await new Promise<ChatMessage[]>(resolve => { setMessages(current => { resolve(current); return current; }); });
        const answer = currentMessages[currentMessages.length - 1]?.content ?? '';
        if (!answerLooksIncomplete(answer)) break;
        setContinuing(true);
        const history = currentMessages.slice(0, -1);
        history.push({ role: 'user', content: 'Continue from the exact stopping point of your previous answer. Do not repeat existing text. Complete the unfinished sentence, formula, table, worked example, or section.' });
        await streamRequest(session.access_token, history, true);
      }
    } catch (caught) {
      setMessages(current => { const updated = [...current]; if (updated[updated.length - 1]?.role === 'assistant' && !updated[updated.length - 1].content) updated.pop(); return updated; });
      setInput(text); setError(caught instanceof Error ? caught.message : 'Could not reach the AI. Check your connection and try again.');
    } finally { setSending(false); setContinuing(false); }
  };

  return (
    <section className="mx-auto flex min-h-[68vh] max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 sm:p-5">
        <button type="button" onClick={onBack} aria-label="Back to home" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><MessageCircle className="h-5 w-5" /></div>
        <div><h1 className="font-extrabold text-slate-900">Study Chat</h1><p className="text-xs text-slate-500">A dedicated space to ask questions and understand concepts.</p></div>
      </header>

      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
        <label htmlFor="study-chat-subject" className="mr-3 text-xs font-bold uppercase tracking-wide text-slate-500">Subject</label>
        <select id="study-chat-subject" value={subject} onChange={event => setSubject(event.target.value)} className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary-500">
          {SUBJECT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/50 p-4 sm:p-5" aria-live="polite">
        {messages.length === 0 && <div className="mx-auto max-w-md py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm"><BookOpenText className="h-7 w-7" /></div>
          <h2 className="text-lg font-extrabold text-slate-900">What are you learning today?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Ask questions, request step-by-step explanations, or work through examples. For a complete note with diagrams, open Note Generator separately.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['Explain a difficult concept simply', 'Give me a worked example', 'Test my understanding'].map(prompt => <button key={prompt} type="button" onClick={() => setInput(prompt)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-700">{prompt}</button>)}
          </div>
        </div>}
        {messages.map((message, index) => <article key={index} className={'flex ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div className={'max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[85%] ' + (message.role === 'user' ? 'bg-primary-600 text-white' : 'border border-slate-200 bg-white text-slate-800')}>
            <p className={'mb-2 text-[10px] font-extrabold uppercase tracking-wider ' + (message.role === 'user' ? 'text-white/75' : 'text-primary-700')}>{message.role === 'user' ? 'You' : 'Examply AI'}</p>
            {message.role === 'user' ? <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p> : <div className="deep-dive-markdown min-w-0 break-words text-sm leading-relaxed"><MathMarkdown content={message.content} /></div>}
          </div>
        </article>)}
        {sending && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> {continuing ? "Continuing the explanation…" : "Thinking through your question…"}</div>}
        {!sending && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1].content.trim() && <div className="flex justify-start"><button type="button" onClick={() => void continueAnswer()} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary-300 hover:text-primary-700"><LoaderCircle className="h-3.5 w-3.5" /> Continue explanation</button></div>}
      </div>

      {error && <p role="alert" className="mx-4 mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5">{error}{!user && <button type="button" onClick={onSignIn} className="ml-2 font-bold underline">Sign in</button>}</p>}

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
