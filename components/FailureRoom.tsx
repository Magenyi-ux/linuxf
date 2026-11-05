import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import type { Book, ExamType, Question, Subject } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

export interface FailedQuestionRecord {
  id: string;
  question: Question;
  examType: ExamType;
  subject: Subject;
  failedAt: string;
  attempts: number;
}

const storageKey = (userId?: string | null) => `examply_failure_room_v1_${userId || 'guest'}`;

export const readFailedQuestions = (userId?: string | null): FailedQuestionRecord[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey(userId)) || '[]') as unknown;
    return Array.isArray(parsed) ? parsed as FailedQuestionRecord[] : [];
  } catch {
    return [];
  }
};

const writeFailedQuestions = (records: FailedQuestionRecord[], userId?: string | null) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('examply:failure-room-updated'));
  } catch (error) {
    console.warn('Failure Room could not save locally:', error);
  }
};

export const saveFailedQuestion = (
  question: Question,
  examType: ExamType,
  subject: Subject,
  userId?: string | null
) => {
  const records = readFailedQuestions(userId);
  const id = `${String(examType)}:${String(subject)}:${String(question.id)}`;
  const existing = records.find(record => record.id === id);
  const next: FailedQuestionRecord = existing
    ? records.map(record => record.id === id ? { ...record, question, failedAt: new Date().toISOString(), attempts: record.attempts + 1 } : record)
    : [{ id, question, examType, subject, failedAt: new Date().toISOString(), attempts: 1 }, ...records];
  writeFailedQuestions(next, userId);
};

export const resolveFailedQuestion = (id: string, userId?: string | null) => {
  writeFailedQuestions(readFailedQuestions(userId).filter(record => record.id !== id), userId);
};

interface FailureRoomProps {
  userId?: string | null;
  onRetry: (record: FailedQuestionRecord) => void;
  compact?: boolean;
  books?: Record<string, Book>;
}

export const FailureRoom: React.FC<FailureRoomProps> = ({ userId, onRetry, compact = false, books = {} }) => {
  const [records, setRecords] = useState<FailedQuestionRecord[]>([]);
  const [showAll, setShowAll] = useState(!compact);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const localRecords = readFailedQuestions(userId);
      if (!userId || !isSupabaseConfigured || !navigator.onLine) {
        if (!cancelled) setRecords(localRecords);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('question_attempts')
          .select('question_id, subject_id, correct, attempted_at')
          .eq('user_id', userId)
          .order('attempted_at', { ascending: false })
          .limit(500);
        if (error) throw error;

        const latestByQuestion = new Map<string, { question_id: string; subject_id: string; correct: boolean; attempted_at: string }>();
        const wrongCounts = new Map<string, number>();
        for (const row of data ?? []) {
          const key = `${String(row.subject_id)}:${String(row.question_id)}`;
          if (!latestByQuestion.has(key)) {
            latestByQuestion.set(key, { question_id: String(row.question_id), subject_id: String(row.subject_id), correct: Boolean(row.correct), attempted_at: String(row.attempted_at) });
          }
          if (!Boolean(row.correct)) wrongCounts.set(key, (wrongCounts.get(key) || 0) + 1);
        }

        const availableBooks = Object.values(books);
        const remoteRecords: FailedQuestionRecord[] = [];
        for (const [key, latest] of latestByQuestion) {
          if (latest.correct) continue;
          const book = availableBooks.find(candidate => String(candidate.subject) === latest.subject_id && candidate.questions.some(question => String(question.id) === latest.question_id));
          const question = book?.questions.find(candidate => String(candidate.id) === latest.question_id);
          if (!book || !question) continue;
          remoteRecords.push({
            id: `${String(book.examType)}:${String(book.subject)}:${String(question.id)}`,
            question, examType: book.examType, subject: book.subject, failedAt: latest.attempted_at, attempts: wrongCounts.get(key) || 1,
          });
        }

        const merged = new Map<string, FailedQuestionRecord>();
        for (const record of localRecords) merged.set(record.id, record);
        for (const record of remoteRecords) {
          const existing = merged.get(record.id);
          merged.set(record.id, existing ? { ...existing, ...record, attempts: Math.max(existing.attempts, record.attempts) } : record);
        }
        const combined = [...merged.values()].sort((a, b) => b.failedAt.localeCompare(a.failedAt));
        if (!cancelled) setRecords(combined);
      } catch (error) {
        console.warn('Could not refresh synced Failure Room attempts; showing local records:', error);
        if (!cancelled) setRecords(localRecords);
      }
    };
    void refresh();
    const onOnline = () => { void refresh(); };
    const onUpdated = () => setRecords(readFailedQuestions(userId));
    window.addEventListener('storage', onUpdated);
    window.addEventListener('examply:failure-room-updated', onUpdated);
    window.addEventListener('online', onOnline);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onUpdated);
      window.removeEventListener('examply:failure-room-updated', onUpdated);
      window.removeEventListener('online', onOnline);
    };
  }, [userId, books]);

  const visibleRecords = showAll ? records : records.slice(0, 3);

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 sm:p-6" aria-label="Failure Room">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-700"><AlertCircle className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-slate-900">Failure Room</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{records.length} to review</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Questions you missed are saved on this device, ready to revisit offline.</p>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No missed questions yet. Incorrect answers from practice will appear here automatically.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleRecords.map(record => (
            <article key={record.id} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{record.examType} · {record.subject}</p>
                  <p className="mt-1 line-clamp-3 text-sm font-semibold text-slate-900">{record.question.text}</p>
                  <p className="mt-1 text-xs text-slate-500">Missed {record.attempts} {record.attempts === 1 ? 'time' : 'times'}</p>
                </div>
                <button type="button" onClick={() => onRetry(record)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700" aria-label="Retry question">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">Answer: {record.question.options[record.question.correctOptionIndex] || 'See explanation'}</span>
                <button type="button" onClick={() => { resolveFailedQuestion(record.id, userId); setRecords(readFailedQuestions(userId)); }} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900" aria-label="Mark reviewed">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Mark reviewed <Trash2 className="ml-1 h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          ))}
          {compact && records.length > 3 && (
            <button type="button" onClick={() => setShowAll(value => !value)} className="text-sm font-bold text-primary-700">
              {showAll ? 'Show less' : `Show all ${records.length} missed questions`}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
