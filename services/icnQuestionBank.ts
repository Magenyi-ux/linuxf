/**
 * Question-bank normalization used by the Examply web/data side.
 *
 * This mirrors the working question decoding rules in the Android app's
 * SeedQuestionLoader without changing the Android repository.
 *
 * Source records in services/questions use:
 *   text + options[] + correctOptionIndex
 *
 * Examply/ICN records use:
 *   questionText + optionA/B/C/D + correctAnswer
 *
 * Keeping this conversion here makes linuxf responsible for producing the
 * same question shape that ICN already knows how to decode.
 */

export type IcnQuestion = {
  id?: string | number;
  subject: string;
  topic: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  questionType: 'MCQ' | 'THEORY';
  markingGuide: string;
  maxScore: number;
  examType: string;
  examYear: number;
  imageAsset?: string | null;
};

type SourceQuestion = {
  id?: string | number;
  subject?: string;
  topic?: string;
  examType?: string;
  year?: string | number;
  examYear?: string | number;
  text?: string;
  question?: string;
  questionText?: string;
  options?: unknown;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correctOptionIndex?: number | string;
  correctAnswer?: string | number;
  answer?: string | number;
  explanation?: string;
  questionType?: string;
  markingGuide?: string;
  maxScore?: number;
  imageAsset?: string;
  imageUrl?: string;
};

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();

const firstNonBlank = (...values: unknown[]): string => {
  for (const value of values) {
    const result = text(value);
    if (result) return result;
  }
  return '';
};

const normalizeOptions = (source: SourceQuestion): string[] => {
  if (Array.isArray(source.options)) {
    return source.options.map(text).filter(Boolean);
  }

  if (source.options && typeof source.options === 'object') {
    const record = source.options as Record<string, unknown>;
    return ['a', 'b', 'c', 'd'].map((key) => text(record[key])).filter(Boolean);
  }

  return [
    firstNonBlank(source.optionA, source.option_a),
    firstNonBlank(source.optionB, source.option_b),
    firstNonBlank(source.optionC, source.option_c),
    firstNonBlank(source.optionD, source.option_d),
  ].filter(Boolean);
};

const normalizeCorrectIndex = (
  source: SourceQuestion,
  optionCount: number
): number => {
  const raw = source.correctOptionIndex ?? source.correctAnswer ?? source.answer;

  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return raw;
  }

  const answer = text(raw).toUpperCase();
  if (answer === 'A' || answer === '0') return 0;
  if (answer === 'B' || answer === '1') return 1;
  if (answer === 'C' || answer === '2') return 2;
  if (answer === 'D' || answer === '3') return 3;

  return optionCount > 0 ? 0 : -1;
};

export function normalizeQuestion(
  source: SourceQuestion,
  defaults: {
    subject?: string;
    examType?: string;
    examYear?: number;
  } = {}
): IcnQuestion | null {
  const options = normalizeOptions(source);
  const questionText = firstNonBlank(
    source.questionText,
    source.text,
    source.question
  );
  const explanation = text(source.explanation);
  const questionType = text(source.questionType || 'MCQ').toUpperCase() === 'THEORY'
    ? 'THEORY'
    : 'MCQ';
  const markingGuide = firstNonBlank(source.markingGuide, explanation);
  const correctIndex = normalizeCorrectIndex(source, options.length);

  const examYear = Number(source.examYear ?? source.year ?? defaults.examYear ?? 2026);
  const subject = firstNonBlank(source.subject, defaults.subject, 'General Study');
  const examType = firstNonBlank(source.examType, defaults.examType, 'WAEC').toUpperCase();

  const validMcq =
    questionType === 'MCQ' &&
    options.length >= 4 &&
    options.slice(0, 4).every(Boolean) &&
    correctIndex >= 0 &&
    correctIndex < 4;

  const validTheory =
    questionType === 'THEORY' &&
    markingGuide.length >= 80;

  // Same quality gate as the working ICN decoder:
  // MCQs require four options and a valid answer; explanations are required.
  if (
    !questionText ||
    explanation.length < 80 ||
    (!validMcq && !validTheory) ||
    !Number.isFinite(examYear)
  ) {
    return null;
  }

  return {
    id: source.id,
    subject,
    topic: firstNonBlank(source.topic, 'General'),
    questionText,
    optionA: options[0] || '',
    optionB: options[1] || '',
    optionC: options[2] || '',
    optionD: options[3] || '',
    correctAnswer: LETTERS[correctIndex],
    explanation,
    questionType,
    markingGuide,
    maxScore: Math.max(1, Number(source.maxScore ?? 1) || 1),
    examType,
    examYear,
    imageAsset: firstNonBlank(source.imageAsset, source.imageUrl) || null,
  };
}

/**
 * Decode one JSON question-set using the same validation/normalization
 * contract expected by ICN.
 */
export function decodeIcnQuestionSet(
  body: string,
  defaults: {
    subject?: string;
    examType?: string;
    examYear?: number;
  } = {}
): IcnQuestion[] {
  const parsed: unknown = JSON.parse(body);
  if (!Array.isArray(parsed)) {
    throw new Error('Question set must be a JSON array');
  }

  return parsed
    .map((item) =>
      item && typeof item === 'object'
        ? normalizeQuestion(item as SourceQuestion, defaults)
        : null
    )
    .filter((question): question is IcnQuestion => question !== null);
}

/**
 * Select one exact subject/board/year set from already-decoded records.
 */
export function selectIcnQuestionSet(
  questions: IcnQuestion[],
  subject: string,
  examType: string,
  examYear: number
): IcnQuestion[] {
  const wantedSubject = subject.trim().toLowerCase();
  const wantedExamType = examType.trim().toUpperCase();

  return questions.filter(
    (question) =>
      question.subject.trim().toLowerCase() === wantedSubject &&
      question.examType.trim().toUpperCase() === wantedExamType &&
      question.examYear === examYear
  );
}
