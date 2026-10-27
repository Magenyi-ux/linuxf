import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpenText, LoaderCircle, MessageCircle, Plus, Send, Sparkles, Clock3, ImagePlus, X } from 'lucide-react';
import { StudyRichContent } from './StudyRichContent';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { Subject } from '../types';

type ChatMessage = { role: 'user' | 'assistant'; content: string; images?: string[] };
type ChatRow = { id: string; title: string; subject: string; updated_at: string };
type StoredMessage = { id: string; role: 'user' | 'assistant'; content: string; created_at: string; image_paths?: string[] };

interface StudyChatProps { onBack: () => void; onSignIn: () => void; }
const SUBJECT_OPTIONS = ['General', ...Object.values(Subject)];

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

async function prepareStudyImage(file: File): Promise<{ dataUrl: string; blob: Blob }> {
  let source: CanvasImageSource;
  let sourceWidth = 0;
  let sourceHeight = 0;
  let cleanup = () => {};

  try {
    const bitmap = await createImageBitmap(file);
    source = bitmap;
    sourceWidth = bitmap.width;
    sourceHeight = bitmap.height;
    cleanup = () => bitmap.close();
  } catch {
    // Some mobile browsers cannot decode certain image files through createImageBitmap.
    // Try the browser's HTMLImageElement decoder before rejecting the attachment.
    const objectUrl = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.decoding = 'async';
      image.src = objectUrl;
      await image.decode();
      source = image;
      sourceWidth = image.naturalWidth;
      sourceHeight = image.naturalHeight;
      if (!sourceWidth || !sourceHeight) throw new Error('Image has no readable dimensions.');
      cleanup = () => URL.revokeObjectURL(objectUrl);
    } catch {
      URL.revokeObjectURL(objectUrl);
      throw new Error('Examply could not read this image. Try taking a screenshot or saving it as JPG or PNG, then attach it again.');
    }
  }

  try {
    const scale = Math.min(1, 1200 / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not process this image. Please try another picture.');
    context.drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('Could not compress this image. Please try another picture.')), 'image/jpeg', 0.72));
    if (blob.size > 850 * 1024) throw new Error('This image is too detailed to send safely. Crop it closer to the question and try again.');
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this image.'));
      reader.onerror = () => reject(new Error('Could not read this image.'));
      reader.readAsDataURL(blob);
    });
    return { blob, dataUrl };
  } finally {
    cleanup();
  }
}

export const StudyChat: React.FC<StudyChatProps> = ({ onBack, onSignIn }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('General');
  const [input, setInput] = useState('');
  const [pendingImages, setPendingImages] = useState<Array<{ file: File; preview: string }>>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<ChatRow[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!user) { setConversations([]); setActiveChatId(null); setMessages([]); return; }
    setLoadingHistory(true);
    const { data, error: loadError } = await supabase.from('study_chat_conversations')
      .select('id,title,subject,updated_at').eq('user_id', user.id)
      .order('updated_at', { ascending: false }).limit(50);
    setLoadingHistory(false);
    if (loadError) {
      setSaveNotice('Chat history sync is not enabled yet. Your current conversation remains available in this session.');
      return;
    }
    setConversations((data ?? []) as ChatRow[]);
    setSaveNotice('');
  }, [user]);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    if (sending) return;
    setActiveChatId(null); setMessages([]); setSubject('General'); setInput('');
    pendingImages.forEach(image => URL.revokeObjectURL(image.preview)); setPendingImages([]);
    setError(''); setSaveNotice(''); setHistoryOpen(false);
  };

  const openConversation = async (conversation: ChatRow) => {
    if (sending) return;
    setLoadingHistory(true); setError('');
    const { data, error: queryError } = await supabase.from('study_chat_messages')
      .select('id,role,content,created_at,image_paths').eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });
    setLoadingHistory(false);
    if (queryError) { setError('Could not load this conversation. Please try again.'); return; }
    setActiveChatId(conversation.id);
    setSubject(conversation.subject || 'General');
    const stored = (data ?? []) as StoredMessage[];
    const restored = await Promise.all(stored.map(async row => {
      const paths = row.image_paths ?? [];
      const signed = await Promise.all(paths.map(async path => {
        const { data: signedData } = await supabase.storage.from('study-chat-images').createSignedUrl(path, 3600);
        return signedData?.signedUrl ?? '';
      }));
      return { role: row.role, content: row.content, images: signed.filter(Boolean) } as ChatMessage;
    }));
    setMessages(restored);
    setHistoryOpen(false);
  };

  const persistMessage = async (conversationId: string, role: ChatMessage['role'], content: string, imagePaths: string[] = []) => {
    const { error: insertError } = await supabase.from('study_chat_messages').insert({
      conversation_id: conversationId, user_id: user!.id, role, content, image_paths: imagePaths,
    });
    if (insertError) throw insertError;
  };

  const sendMessage = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const text = input.trim();
    if ((!text && pendingImages.length === 0) || sending) return;
    if (!user) { setError('Sign in to chat with Examply and save your conversation to your account.'); return; }

    setInput(''); setSending(true); setError(''); setSaveNotice('');
    let conversationId = activeChatId;
    let userSaved = false;
    let assistantContent = '';
    const questionText = text || 'Please explain the attached image(s).';
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: questionText, images: pendingImages.map(image => image.preview) }];
    setMessages(nextMessages);

    try {
      if (!conversationId) {
        const titleSource = text || 'Image question';
        const title = titleSource.length > 64 ? titleSource.slice(0, 61) + '…' : titleSource;
        const { data, error: createError } = await supabase.from('study_chat_conversations')
          .insert({ user_id: user.id, title, subject }).select('id,title,subject,updated_at').single();
        if (createError || !data) throw new Error('Could not create a saved chat. Check that chat history has been enabled.');
        conversationId = data.id;
        setActiveChatId(data.id);
        setConversations(current => [data as ChatRow, ...current.filter(item => item.id !== data.id)]);
      }

      const uploadedImages: Array<{ dataUrl: string; path: string }> = [];
      for (const image of pendingImages) {
        const prepared = await prepareStudyImage(image.file);
        const path = `${user.id}/${conversationId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage.from('study-chat-images').upload(path, prepared.blob, { contentType: 'image/jpeg', upsert: false });
        if (uploadError) throw new Error('Could not upload the image. Please retry with a smaller picture.');
        uploadedImages.push({ dataUrl: prepared.dataUrl, path });
      }
      const imagePaths = uploadedImages.map(image => image.path);
      const displayImages = await Promise.all(uploadedImages.map(async image => {
        const { data: signedData } = await supabase.storage.from('study-chat-images').createSignedUrl(image.path, 3600);
        return signedData?.signedUrl ?? image.dataUrl;
      }));
      setMessages(current => current.map((message, index) => index === current.length - 1 && message.role === 'user' ? { ...message, images: displayImages } : message));
      await persistMessage(conversationId, 'user', questionText, imagePaths);
      pendingImages.forEach(image => URL.revokeObjectURL(image.preview)); setPendingImages([]);
      userSaved = true;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your session has expired. Sign in again.');

      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
        body: JSON.stringify({ mode: 'study-chat', subject, messages: [...messages, { role: 'user', content: questionText, images: uploadedImages.map(image => image.dataUrl) }], stream: true }),
      });
      setMessages(current => [...current, { role: 'assistant', content: '' }]);
      await consumeAIStream(response, delta => {
        assistantContent += delta;
        setMessages(current => {
          const updated = [...current];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') updated[updated.length - 1] = { ...last, content: last.content + delta };
          return updated;
        });
      });

      await persistMessage(conversationId, 'assistant', assistantContent);
      const updatedAt = new Date().toISOString();
      const { error: updateError } = await supabase.from('study_chat_conversations')
        .update({ updated_at: updatedAt }).eq('id', conversationId).eq('user_id', user.id);
      if (updateError) throw updateError;
      setConversations(current => current.map(item => item.id === conversationId ? { ...item, updated_at: updatedAt } : item)
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send or save this message. Check your connection and try again.');
      if (!userSaved) setInput(text);
      if (assistantContent && conversationId) {
        const { error: recoveryError } = await supabase.from('study_chat_messages').insert({
          conversation_id: conversationId, user_id: user.id, role: 'assistant', content: assistantContent,
        });
        if (!recoveryError) setSaveNotice('The partial answer was saved to your chat history.');
      } else if (userSaved) setSaveNotice('Your question was saved. The answer may not have completed; reopen this chat to continue.');
    } finally { setSending(false); void loadConversations(); }
  };

  return (
    <section className="relative mx-auto flex h-[calc(100dvh-4rem)] min-h-[30rem] w-full max-w-5xl flex-col overflow-hidden bg-white sm:h-[calc(100dvh-2rem)]">
      <header className="z-10 flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white/95 px-3 py-3 backdrop-blur sm:px-5">
        <button type="button" onClick={onBack} aria-label="Back to home" className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"><ArrowLeft className="h-5 w-5" /></button>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-700"><MessageCircle className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1"><h1 className="font-extrabold tracking-tight text-slate-900">Study Chat</h1><p className="truncate text-xs text-slate-500">{user ? 'Your questions, saved to your account' : 'Sign in to save your chat history'}</p></div>
        <button type="button" onClick={() => setHistoryOpen(value => !value)} disabled={!user || sending} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"><Clock3 className="mr-1 inline h-4 w-4" /> History</button>
        <button type="button" onClick={startNewChat} disabled={sending} aria-label="Start a new chat" className="inline-flex items-center gap-1 rounded-xl bg-primary-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-primary-700 disabled:opacity-40"><Plus className="h-4 w-4" /><span className="hidden sm:inline">New chat</span></button>
      </header>

      <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 bg-white px-4 py-2.5 sm:px-5">
        <label htmlFor="study-chat-subject" className="text-xs font-bold text-slate-500">SUBJECT</label>
        <select id="study-chat-subject" value={subject} onChange={event => setSubject(event.target.value)} className="min-w-0 max-w-[75%] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100">
          {SUBJECT_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      {historyOpen && <aside className="absolute inset-x-3 top-24 z-20 mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-8 sm:top-28 sm:w-96" aria-label="Chat history">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><h2 className="font-bold text-slate-900">Your conversations</h2><button type="button" onClick={() => setHistoryOpen(false)} className="text-sm text-slate-500 hover:text-slate-900">Close</button></div>
        <div className="max-h-72 overflow-y-auto p-2">
          {loadingHistory && <p className="p-4 text-sm text-slate-500">Loading history…</p>}
          {!loadingHistory && conversations.length === 0 && <p className="p-4 text-sm text-slate-500">Your saved chats will appear here.</p>}
          {conversations.map(conversation => <button key={conversation.id} type="button" onClick={() => void openConversation(conversation)} className={'block w-full rounded-xl px-3 py-3 text-left transition hover:bg-slate-50 ' + (activeChatId === conversation.id ? 'bg-primary-50' : '')}><span className="block truncate text-sm font-semibold text-slate-800">{conversation.title}</span><span className="mt-1 block text-xs text-slate-500">{conversation.subject} · {new Date(conversation.updated_at).toLocaleDateString()}</span></button>)}
        </div>
      </aside>}

      {saveNotice && <p role="status" className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-800 sm:px-5">{saveNotice}</p>}
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-white px-3 py-5 sm:px-8 sm:py-7" aria-live="polite">
        {messages.length === 0 && <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center py-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white text-primary-700 shadow-sm"><BookOpenText className="h-8 w-8" /></div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">What are you learning today?</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">Ask a question, request a worked example, or practise explaining a difficult concept. Your saved chats stay with your account.</p>
          <div className="mt-6 grid w-full max-w-md gap-2">
            {['Explain a difficult concept simply', 'Give me a worked example', 'Test my understanding'].map((prompt, index) => <button key={prompt} type="button" onClick={() => setInput(prompt)} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-primary-300 hover:bg-primary-50/50"><span>{prompt}</span><span className="text-primary-600">{index === 0 ? 'Explain' : index === 1 ? 'Practise' : 'Quiz me'} →</span></button>)}
          </div>
        </div>}
        {messages.map((message, index) => <article key={index} className={'flex ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}>
          <div className={'min-w-0 px-0 py-2 ' + (message.role === 'user' ? 'max-w-[90%] rounded-3xl rounded-br-lg bg-slate-100 px-4 py-3 text-slate-900 sm:max-w-[82%] sm:px-5' : 'w-full max-w-[96%] bg-transparent text-slate-800 sm:max-w-[92%]')}>
            <p className={'mb-2 text-[10px] font-extrabold uppercase tracking-wider ' + (message.role === 'user' ? 'text-slate-500' : 'text-slate-500')}>{message.role === 'user' ? 'You' : 'Examply AI'}</p>
            {message.images?.length ? <div className="mb-3 flex flex-wrap gap-2">{message.images.map((src, imageIndex) => <img key={imageIndex} src={src} alt={`Attachment ${imageIndex + 1}`} className="max-h-64 max-w-full rounded-xl border border-slate-200 object-contain" loading="lazy" />)}</div> : null}
            {message.role === 'user' ? <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p> : <div className="deep-dive-markdown min-w-0 break-words text-sm leading-7"><StudyRichContent content={message.content || (sending ? 'Thinking through your question…' : '')} /></div>}
          </div>
        </article>)}
        {sending && messages[messages.length - 1]?.role !== 'assistant' && <div className="flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" /> Thinking through your question…</div>}
      </div>

      {error && <p role="alert" className="mx-3 mt-2 shrink-0 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-5">{error}{!user && <button type="button" onClick={onSignIn} className="ml-2 font-bold underline">Sign in</button>}</p>}
      <form onSubmit={sendMessage} className="z-10 shrink-0 bg-white px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-8 sm:pt-4">
        {pendingImages.length > 0 && <div className="mb-3 flex flex-wrap gap-2">{pendingImages.map((image, index) => <div key={image.preview} className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200"><img src={image.preview} alt={`Selected attachment ${index + 1}`} className="h-full w-full object-cover" /><button type="button" aria-label="Remove image" onClick={() => { URL.revokeObjectURL(image.preview); setPendingImages(current => current.filter((_, itemIndex) => itemIndex !== index)); }} className="absolute right-1 top-1 rounded-full bg-slate-900/80 p-1 text-white"><X className="h-3 w-3" /></button></div>)}</div>}
        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" aria-label="Attach images" onChange={event => { const files = Array.from(event.target.files ?? []).filter(file => file.type.startsWith('image/')).slice(0, 3 - pendingImages.length); const tooLarge = files.find(file => file.size > 12 * 1024 * 1024); if (tooLarge) { setError('Each image must be smaller than 12 MB.'); event.target.value = ''; return; } setPendingImages(current => [...current, ...files].slice(0, 3).map((file, index) => index < current.length ? current[index] : { file, preview: URL.createObjectURL(file) })); event.target.value = ''; }} />
        <div className="flex items-end gap-2 rounded-[1.75rem] border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-slate-400 focus-within:shadow-md">
          <button type="button" disabled={sending || pendingImages.length >= 3 || !user} onClick={() => imageInputRef.current?.click()} aria-label="Attach a picture" title="Attach a picture" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"><ImagePlus className="h-5 w-5" /></button>
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} maxLength={2000} placeholder={user ? 'Ask a question or attach a picture…' : 'Sign in to start chatting…'} aria-label="Your message" className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400" />
          <button type="submit" disabled={sending || (!input.trim() && pendingImages.length === 0) || !user} aria-label="Send message" className="mb-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"><Send className="h-4 w-4" /></button>
        </div>
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-[10px] text-slate-400"><Sparkles className="h-3 w-3 shrink-0" /> AI can make mistakes. Verify important facts with trusted study materials.</p>
      </form>
    </section>
  );
};
