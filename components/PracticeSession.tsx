import React, { useEffect, useState } from 'react';
import { MathMarkdown } from './MathMarkdown';
import { Question, Subject, ExamType } from '../types';
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, Lightbulb, HelpCircle, Search, Bookmark, BookmarkCheck, ShieldCheck } from 'lucide-react';
import { MathText } from './MathText';
import { cleanQuestionText } from '../utils/questionTextPresentation';
import { useAuth } from '../contexts/AuthContext';
import { enqueueQuestionAttempt } from '../services/offlineQueue';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface PracticeSessionProps {
  questions: Question[];
  sources?: string[];
  examType: ExamType;
  subject: Subject;
  mode: 'STUDY' | 'TEST';
  onFinish: (score: number, total: number) => void;
  onBack: () => void;
}

export const PracticeSession: React.FC<PracticeSessionProps> = ({
  questions, sources = [], examType, subject, mode, onFinish, onBack
}) => {
  const { user: supabaseUser, session } = useAuth();
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveAnswer, setDeepDiveAnswer] = useState('');
  const [deepDiveError, setDeepDiveError] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [saveNoteError, setSaveNoteError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string | number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [jumpInput, setJumpInput] = useState('1');
  const [questionAccessStatus, setQuestionAccessStatus] = useState<'checking' | 'allowed' | 'blocked' | 'error'>(() => supabaseUser && typeof navigator !== 'undefined' && navigator.onLine ? 'checking' : 'allowed');
  const [accessCheckAttempt, setAccessCheckAttempt] = useState(0);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (!supabaseUser || !isSupabaseConfigured || !currentQuestion || !navigator.onLine) {
      setQuestionAccessStatus('allowed');
      return;
    }
    let cancelled = false;
    setQuestionAccessStatus('checking');
    supabase.rpc('record_distinct_question', { p_question_id: `${String(subject)}:${String(currentQuestion.id)}` })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data || typeof data.allowed !== 'boolean') {
          console.error('Question limit verification failed:', error);
          setQuestionAccessStatus('error');
        } else {
          setQuestionAccessStatus(data.allowed ? 'allowed' : 'blocked');
        }
      })
      .catch(error => {
        if (cancelled) return;
        console.error('Question limit verification failed:', error);
        setQuestionAccessStatus('error');
      });
    return () => { cancelled = true; };
  }, [supabaseUser?.id, session?.access_token, currentQuestion?.id, subject, accessCheckAttempt]);

  const handleOptionSelect = (optionIndex: number) => {
    if (answers[currentQuestion.id] !== undefined) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIndex }));

    if (supabaseUser) {
      const attemptedAt = new Date().toISOString();
      enqueueQuestionAttempt(supabaseUser.id, {
        questionId: String(currentQuestion.id),
        subjectId: String(subject),
        topicId: null,
        answer: String.fromCharCode(65 + optionIndex),
        correct: optionIndex === currentQuestion.correctOptionIndex,
        attemptedAt,
        version: 1,
      });
    }

    if (mode === 'STUDY') setShowExplanation(true);
  };

  const goToQuestion = (questionNumber: number) => {
    if (!Number.isInteger(questionNumber) || questionNumber < 1 || questionNumber > totalQuestions) return;
    const nextIndex = questionNumber - 1;
    setCurrentIndex(nextIndex);
    setDeepDiveAnswer('');
    setDeepDiveError('');
    setNoteSaved(false);
    setSaveNoteError('');
    setJumpInput(String(questionNumber));
    setShowExplanation(answers[questions[nextIndex]?.id] !== undefined);
  };

  const handleJumpSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const questionNumber = Number(jumpInput);
    if (Number.isInteger(questionNumber) && questionNumber >= 1 && questionNumber <= totalQuestions) {
      goToQuestion(questionNumber);
    } else {
      setJumpInput(String(currentIndex + 1));
    }
  };

  const handleNext = () => {
    if (mode === 'TEST' && isAnswered && !showExplanation) {
      setShowExplanation(true);
      return;
    }
    if (currentIndex < totalQuestions - 1) {
      goToQuestion(currentIndex + 2);
    } else {
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctOptionIndex) score++;
      });
      onFinish(score, totalQuestions);
    }
  };

  const handleInstantExplain = () => {
    if (answers[currentQuestion.id] === undefined) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: -1 }));
      setShowExplanation(true);
    } else {
      setShowExplanation(true);
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined;

  const handleSaveDeepDiveNote = async () => {
    if (savingNote || noteSaved || !deepDiveAnswer) return;
    if (!supabaseUser || !session?.access_token || !isSupabaseConfigured) {
      setSaveNoteError('Sign in to save this explanation to your study notes.');
      return;
    }
    setSavingNote(true);
    setSaveNoteError('');
    try {
      const { data, error } = await supabase.from('study_notes').insert({
        user_id: supabaseUser.id,
        title: `Deep Dive: ${cleanQuestionText(currentQuestion.text).slice(0, 120)}`.slice(0, 180),
        subject: String(subject).slice(0, 80) || 'General',
        question: cleanQuestionText(currentQuestion.text).slice(0, 2000),
        content: deepDiveAnswer.slice(0, 20000),
      }).select('id').single();
      if (error) throw error;
      if (!data?.id) throw new Error('The database did not confirm that the note was saved.');
      setNoteSaved(true);
    } catch (error) {
      console.error('Could not save study note:', error);
      setSaveNoteError(error instanceof Error && error.message ? `Could not save this note: ${error.message}` : 'Could not save this note. Please try again later.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeepDive = async () => {
    if (deepDiveLoading) return;
    if (!session?.access_token) {
      setDeepDiveError('Sign in to use Deep Dive & Research.');
      setDeepDiveAnswer('');
      return;
    }
    if (!navigator.onLine) {
      setDeepDiveError('Deep Dive & Research needs an internet connection. Your regular explanation is still available offline.');
      setDeepDiveAnswer('');
      return;
    }

    setDeepDiveLoading(true);
    setDeepDiveError('');
    setDeepDiveAnswer('');
    setNoteSaved(false);
    setSaveNoteError('');
    try {
      const response = await fetch('/api/nvidia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          mode: 'deep-dive',
          stream: true,
          subject: String(subject),
          question: cleanQuestionText(currentQuestion.text),
          options: currentQuestion.options,
          correctAnswer: currentQuestion.options[currentQuestion.correctOptionIndex] ?? '',
          explanation: currentQuestion.explanation,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) throw new Error('Your session may have expired. Sign in again and retry.');
        if (response.status === 429) throw new Error('Too many requests right now. Wait a moment and try again.');
        throw new Error(data?.error || 'Deep Dive could not generate an explanation. Try again shortly.');
      }

      // Keep compatibility with an older deployment that may still return JSON.
      if (!response.headers.get('content-type')?.includes('text/event-stream')) {
        const data = await response.json().catch(() => ({}));
        if (data?.rejected) throw new Error(data.answer || 'This request could not be processed.');
        if (typeof data?.answer !== 'string' || !data.answer.trim()) {
          throw new Error('The AI returned an empty explanation. Please try again.');
        }
        setDeepDiveAnswer(data.answer.trim());
      } else {
        if (!response.body) throw new Error('Streaming is not supported by this connection. Please retry.');
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let streamedAnswer = '';
        let streamError = '';
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
              if (!payload) continue;
              let event: { delta?: unknown; done?: boolean; error?: string };
              try {
                event = JSON.parse(payload);
              } catch {
                continue;
              }
              if (typeof event.error === 'string') {
                streamError = event.error;
                break;
              }
              if (typeof event.delta === 'string' && event.delta) {
                streamedAnswer += event.delta;
                setDeepDiveAnswer(streamedAnswer);
              }
            }
            if (streamError) break;
          }
          if (streamError) throw new Error(streamError);
          buffer += decoder.decode();
          const finalLine = buffer.trim();
          if (finalLine.startsWith('data:')) {
            try {
              const event = JSON.parse(finalLine.slice(5).trim());
              if (typeof event.error === 'string') throw new Error(event.error);
              if (typeof event.delta === 'string' && event.delta) {
                streamedAnswer += event.delta;
                setDeepDiveAnswer(streamedAnswer);
              }
            } catch (error) {
              if (error instanceof Error && error.message !== 'Unexpected end of JSON input') throw error;
            }
          }
          if (!streamedAnswer.trim()) throw new Error('The AI returned an empty explanation. Please try again.');
        } finally {
          reader.releaseLock();
        }
      }
    } catch (error) {
      setDeepDiveAnswer('');
      setDeepDiveError(error instanceof Error ? error.message : 'Unable to reach Deep Dive & Research.');
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const getOptionStyle = (idx: number) => {
    const baseStyle = "w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group relative overflow-hidden";
    if (!isAnswered) return baseStyle + " border-gray-100 hover:border-primary-200 hover:bg-primary-50";
    if (mode === 'TEST') {
      if (showExplanation && idx === currentQuestion.correctOptionIndex) {
        return baseStyle + " border-green-500 bg-green-50 text-green-900";
      }
      if (showExplanation && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex) {
        return baseStyle + " border-red-500 bg-red-50 text-red-900";
      }
      return answers[currentQuestion.id] === idx
        ? baseStyle + " border-primary-500 bg-primary-50 text-primary-900"
        : baseStyle + " border-gray-100 opacity-50";
    }
    if (idx === currentQuestion.correctOptionIndex) return baseStyle + " border-green-500 bg-green-50 text-green-900";
    if (answers[currentQuestion.id] === idx) return baseStyle + " border-red-500 bg-red-50 text-red-900";
    return baseStyle + " border-gray-100 opacity-50";
  };

  if (questionAccessStatus === 'checking') {
    return <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center p-6 text-center"><div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" /><h2 className="text-xl font-bold text-gray-900">Checking study access</h2><p className="mt-2 text-sm text-gray-500">Verifying your lifetime question allowance.</p></div>;
  }
  if (questionAccessStatus === 'blocked' || questionAccessStatus === 'error') {
    const blocked = questionAccessStatus === 'blocked';
    return <div className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center p-6 text-center"><div className="mb-4 rounded-2xl bg-amber-50 p-4 text-amber-700"><ShieldCheck className="h-8 w-8" /></div><h2 className="text-2xl font-black text-gray-900">{blocked ? 'Free question limit reached' : 'Could not verify study access'}</h2><p className="mt-3 text-sm leading-relaxed text-gray-600">{blocked ? 'Your account has used its 200 distinct-question lifetime allowance. Repeated attempts do not use extra slots. Upgrade to premium for continued access.' : 'We could not verify your question allowance. Check your connection and try again.'}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={onBack} className="rounded-xl bg-gray-100 px-5 py-3 text-sm font-bold text-gray-700">Back</button>{!blocked && <button onClick={() => setAccessCheckAttempt(n => n + 1)} className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white">Retry check</button>}</div></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pb-24">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <button onClick={onBack} className="p-2 sm:p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary-600 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center min-w-0">
          <span className="text-[9px] sm:text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-0.5">
            {mode === 'STUDY' ? 'Study Mode' : 'Practice Test'}
          </span>
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5">
            <input
              aria-label="Go to question number"
              type="number"
              min={1}
              max={totalQuestions}
              value={jumpInput}
              onChange={(event) => setJumpInput(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              className="w-16 sm:w-20 bg-white px-2 py-1 sm:py-1.5 rounded-lg border border-gray-200 shadow-sm font-bold text-gray-900 text-center text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
            />
            <span className="text-gray-300 font-bold">/</span>
            <span className="font-bold text-gray-500 text-sm sm:text-base">{totalQuestions}</span>
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-primary-700 transition-colors"
            >
              Go
            </button>
          </form>
        </div>
        <div className="w-9 sm:w-12" />
      </div>

      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-5 sm:mb-8 shadow-inner overflow-hidden">
        <div className="h-full bg-primary-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="mb-5 sm:mb-7 bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-3xl font-bold text-gray-900 leading-snug">
          <MathText text={cleanQuestionText(currentQuestion.text)} />
        </h2>
        {currentQuestion.imageUrl && (
          <div className="mt-4 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex justify-center">
            <img
              src={currentQuestion.imageUrl}
              alt={currentQuestion.imageAlt ?? "Question illustration"}
              className="max-h-[180px] sm:max-h-[240px] md:max-h-[300px] object-contain"
              onError={(e) => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleOptionSelect(idx)}
            disabled={isAnswered}
            className={getOptionStyle(idx)}
          >
            <div className="flex items-center gap-3 sm:gap-4 z-10 relative w-full min-w-0">
              <span className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg sm:rounded-xl text-base sm:text-lg font-bold flex-shrink-0 border-2 transition-all ${
                isAnswered && mode === 'STUDY' && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white shadow-md' :
                isAnswered && mode === 'STUDY' && answers[currentQuestion.id] === idx ? 'bg-red-600 border-red-600 text-white shadow-md' :
                isAnswered && mode === 'TEST' && showExplanation && idx === currentQuestion.correctOptionIndex ? 'bg-green-600 border-green-600 text-white shadow-md' :
                isAnswered && mode === 'TEST' && showExplanation && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex ? 'bg-red-600 border-red-600 text-white shadow-md' :
                isAnswered && mode === 'TEST' && answers[currentQuestion.id] === idx ? 'bg-primary-600 border-primary-600 text-white shadow-md' :
                'bg-gray-50 border-gray-100 text-gray-400 group-hover:border-primary-200 group-hover:text-primary-600'
              }`}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="text-base sm:text-lg font-bold text-left flex-1 min-w-0">
                <MathText text={option} />
              </span>
            </div>
            {isAnswered && (mode === 'STUDY' || showExplanation) && idx === currentQuestion.correctOptionIndex && (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 z-10 shrink-0" />
            )}
            {isAnswered && (mode === 'STUDY' || showExplanation) && answers[currentQuestion.id] === idx && idx !== currentQuestion.correctOptionIndex && (
              <XCircle className="w-6 h-6 sm:w-7 sm:h-7 text-red-600 z-10 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {showExplanation && isAnswered && (
        <div className="mb-28 sm:mb-32 animate-fade-in-up">
          <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-gray-100 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 sm:mb-6 relative z-10">
              <div className="bg-primary-600 p-2 sm:p-2.5 rounded-xl shadow-md">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-widest">
                {mode === 'STUDY' ? 'Explanation' : 'Answer Review'}
              </span>
            </div>
            <div className="text-gray-700 leading-relaxed text-base sm:text-lg font-medium relative z-10 mb-5 sm:mb-6">
              <MathText text={currentQuestion.explanation} />
            </div>
            <button
              onClick={handleDeepDive}
              disabled={deepDiveLoading}
              className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20 active:scale-95 group text-sm sm:text-base disabled:opacity-60 disabled:cursor-wait"
            >
              <Search className={`w-5 h-5 ${deepDiveLoading ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              {deepDiveLoading ? 'Exploring the concept…' : 'Dive Deep & Research'}
            </button>
            {deepDiveError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {deepDiveError}
              </p>
            )}
            {deepDiveAnswer && (
              <section aria-live="polite" className="mt-5 rounded-2xl border border-primary-100 bg-white p-4 sm:p-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-primary-700">Deeper explanation</h3>
                <div className="deep-dive-markdown min-w-0 break-words text-gray-700 text-sm sm:text-base">
                  <MathMarkdown content={deepDiveAnswer} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={handleSaveDeepDiveNote} disabled={savingNote || noteSaved} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60">
                    {noteSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    {savingNote ? 'Saving note…' : noteSaved ? 'Saved to study notes' : 'Save explanation'}
                  </button>
                  {saveNoteError && <p role="alert" className="text-sm text-red-600">{saveNoteError}</p>}
                </div>
                <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-400">
                  AI-generated study guidance. This feature does not perform live web research.
                </p>
              </section>
            )}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 p-3 sm:p-6 z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {mode === 'STUDY' && !isAnswered ? (
            <button
              onClick={handleInstantExplain}
              className="flex-1 py-3 sm:py-4 bg-gray-50 text-gray-500 font-bold rounded-xl hover:bg-gray-100 transition-all flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              Reveal Answer
            </button>
          ) : (
            <div className="flex-1 hidden md:block" />
          )}

          {isAnswered ? (
            <button
              onClick={handleNext}
              className="flex-1 py-3 sm:py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-500/20 transition-all flex items-center justify-center gap-2 sm:gap-3 active:scale-95 text-sm sm:text-base"
            >
              {mode === 'TEST' && isAnswered && !showExplanation ? 'Show Answer' : currentIndex === totalQuestions - 1 ? 'Complete Session' : 'Next Question'}
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          ) : (
            <div className="text-center text-xs sm:text-sm text-gray-400 font-bold tracking-widest uppercase w-full hidden sm:block">
              Choose an option
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
