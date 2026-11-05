import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import type { ExamType, Question, Subject } from '../types';

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
}

export const FailureRoom: React.FC<FailureRoomProps> = ({ userId, onRetry, compact = false }) => {
  const [records, setRecords] = useState<FailedQuestionRecord[]>([]);
  const [showAll, setShowAll] = useState(!compact);

  useEffect(() => {
    const refresh = () => setRecords(readFailedQuestions(userId));
    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener('examply:failure-room-updated', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('examply:failure-room-updated', refresh);
    };
  }, [userId]);

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
