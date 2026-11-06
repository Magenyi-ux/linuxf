import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw, Trash2, Search, ChevronDown, ChevronUp } from 'lucide-react';
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
const reviewedKey = (userId?: string | null) => `examply_failure_room_reviewed_v1_${userId || 'guest'}`;
const readReviewedIds = (userId?: string | null): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(reviewedKey(userId)) || '[]') as string[]); } catch { return new Set(); }
};

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
  const reviewed = readReviewedIds(userId);
  reviewed.delete(id);
  try { localStorage.setItem(reviewedKey(userId), JSON.stringify([...reviewed])); } catch { /* storage may be unavailable */ }
  const existing = records.find(record => record.id === id);
  const next: FailedQuestionRecord = existing
    ? records.map(record => record.id === id ? { ...record, question, failedAt: new Date().toISOString(), attempts: record.attempts + 1 } : record)
    : [{ id, question, examType, subject, failedAt: new Date().toISOString(), attempts: 1 }, ...records];
  writeFailedQuestions(next, userId);
};

export const resolveFailedQuestion = (id: string, userId?: string | null) => {
  const reviewed = readReviewedIds(userId);
  reviewed.add(id);
  try { localStorage.setItem(reviewedKey(userId), JSON.stringify([...reviewed])); } catch { /* storage may be unavailable */ }
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
  const [searchQuery, setSearchQuery] = useState('');
  const [examFilter, setExamFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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
        const resolvedIds = new Set<string>();
        const reviewedIds = readReviewedIds(userId);
        for (const [key, latest] of latestByQuestion) {
          const book = availableBooks.find(candidate => String(candidate.subject) === latest.subject_id && candidate.questions.some(question => String(question.id) === latest.question_id));
          const question = book?.questions.find(candidate => String(candidate.id) === latest.question_id);
          if (!book || !question) continue;
          const recordId = `${String(book.examType)}:${String(book.subject)}:${String(question.id)}`;
          if (latest.correct) { resolvedIds.add(recordId); continue; }
          if (reviewedIds.has(recordId)) continue;
          remoteRecords.push({
            id: recordId, question, examType: book.examType, subject: book.subject, failedAt: latest.attempted_at, attempts: wrongCounts.get(key) || 1,
          });
        }

        const merged = new Map<string, FailedQuestionRecord>();
        for (const record of localRecords) if (!resolvedIds.has(record.id) && !reviewedIds.has(record.id)) merged.set(record.id, record);
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

  const metadataFor = (record: FailedQuestionRecord) => {
    const book = Object.values(books).find(candidate =>
      candidate.examType === record.examType &&
      candidate.subject === record.subject &&
      candidate.questions.some(question => String(question.id) === String(record.question.id))
    );
    const year = book?.year && /^20(1[1-9]|2[0-6])$/.test(String(book.year)) ? String(book.year) : '';
    return { year, source: book?.sources?.filter(Boolean).join(', ') || '' };
  };
  const filteredRecords = records.filter(record => {
    const metadata = metadataFor(record);
    const haystack = [record.question.text, record.question.explanation, record.subject, record.examType, metadata.year, metadata.source].join(' ').toLowerCase();
    return haystack.includes(searchQuery.trim().toLowerCase()) &&
      (examFilter === 'all' || String(record.examType) === examFilter) &&
      (yearFilter === 'all' || metadata.year === yearFilter) &&
      (subjectFilter === 'all' || String(record.subject) === subjectFilter);
  });
  const availableYears = [...new Set(records.map(record => metadataFor(record).year).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const availableSubjects = [...new Set(records.map(record => String(record.subject)))].sort();
  const visibleRecords = showAll ? filteredRecords : filteredRecords.slice(0, 3);

  return (
    <section className="rounded-2xl border border-amber-200 bg-white p-5 sm:p-6" aria-label="Failure Room">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-amber-50 p-3 text-amber-700"><AlertCircle className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-extrabold text-slate-900">{compact && !showAll ? "Failure Room" : "Future Room · Exam History"}</h2>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">{records.length} to review</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">Search past mistakes by exam, year, subject or question. Open any record to review its metadata and retry it.</p>
        </div>
      </div>
      {compact && !showAll && records.length > 0 && (
        <button type="button" onClick={() => setShowAll(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
          Open full exam history <ChevronDown className="h-4 w-4" />
        </button>
      )}
      {showAll && records.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <label className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Search question, topic or source…" className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary-500" />
          </label>
          <select aria-label="Filter by exam" value={examFilter} onChange={event => setExamFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All exams</option>{[...new Set(records.map(record => String(record.examType)))].sort().map(exam => <option key={exam} value={exam}>{exam}</option>)}
          </select>
          <select aria-label="Filter by year" value={yearFilter} onChange={event => setYearFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="all">All years</option>{availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <select aria-label="Filter by subject" value={subjectFilter} onChange={event => setSubjectFilter(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm sm:col-span-2">
            <option value="all">All subjects</option>{availableSubjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
          </select>
          <p className="text-xs text-slate-500 sm:col-span-2">Showing {filteredRecords.length} of {records.length} missed questions.</p>
        </div>
      )}
      {records.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          No missed questions yet. Incorrect answers from practice will appear here automatically.
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No exam-history records match these filters.</div>
      ) : (
        <div className="mt-4 space-y-3">
          {visibleRecords.map(record => {
            const metadata = metadataFor(record);
            const expanded = expandedIds.has(record.id);
            return (
              <article key={record.id} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-700">{record.examType} · {record.subject} · {metadata.year || 'Year unknown'}</p>
                    <p className="mt-1 line-clamp-3 text-sm font-semibold text-slate-900">{record.question.text}</p>
                    <p className="mt-1 text-xs text-slate-500">Last missed {new Date(record.failedAt).toLocaleString()} · {record.attempts} {record.attempts === 1 ? 'attempt' : 'attempts'} missed</p>
                  </div>
                  <button type="button" onClick={() => onRetry(record)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-xs font-bold text-white hover:bg-primary-700" aria-label="Retry question">
                    <RotateCcw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-xs text-slate-500">Correct answer: {record.question.options[record.question.correctOptionIndex] || 'See explanation'}</span>
                  <button type="button" onClick={() => setExpandedIds(previous => { const next = new Set(previous); if (next.has(record.id)) next.delete(record.id); else next.add(record.id); return next; })} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700">
                    {expanded ? 'Hide details' : 'Full question & metadata'} {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                  <button type="button" onClick={() => { resolveFailedQuestion(record.id, userId); setRecords(readFailedQuestions(userId)); }} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900" aria-label="Mark reviewed">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark reviewed <Trash2 className="ml-1 h-3.5 w-3.5" />
                  </button>
                </div>
                {expanded && (
                  <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">
                    <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                      <div><dt className="text-slate-500">Exam</dt><dd className="font-semibold text-slate-800">{record.examType}</dd></div>
                      <div><dt className="text-slate-500">Year</dt><dd className="font-semibold text-slate-800">{metadata.year || 'Unknown / not provided'}</dd></div>
                      <div><dt className="text-slate-500">Subject</dt><dd className="font-semibold text-slate-800">{record.subject}</dd></div>
                      <div><dt className="text-slate-500">Topic</dt><dd className="font-semibold text-slate-800">{(record.question as Question & { topic?: string }).topic || 'Not recorded'}</dd></div>
                      <div className="sm:col-span-2"><dt className="text-slate-500">Source metadata</dt><dd className="break-words font-semibold text-slate-800">{metadata.source || 'Source not recorded'}</dd></div>
                    </dl>
                    <p className="whitespace-pre-wrap text-sm font-semibold text-slate-900">{record.question.text}</p>
                    <ol className="space-y-2">{record.question.options.map((option, index) => <li key={record.id + '-option-' + index} className={'rounded-lg border p-2 text-sm ' + (index === record.question.correctOptionIndex ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : index === record.selectedOptionIndex ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-slate-200 bg-white text-slate-700')}><span className="mr-2 font-bold">{String.fromCharCode(65 + index)}.</span>{option}{index === record.selectedOptionIndex ? ' — Your answer' : ''}{index === record.question.correctOptionIndex ? ' — Correct answer' : ''}</li>)}</ol>
                    {record.question.explanation && <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Explanation</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{record.question.explanation}</p></div>}
                  </div>
                )}
              </article>
            );
          })}
          {compact && showAll && <button type="button" onClick={() => setShowAll(false)} className="inline-flex items-center gap-2 text-sm font-bold text-primary-700">Close full exam history <ChevronUp className="h-4 w-4" /></button>}
        </div>
      )}
    </section>
  );
};
