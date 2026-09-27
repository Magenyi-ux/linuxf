import { ExamType, Question, Subject } from "../types";

const API_BASE = "https://spherelearn.name.ng/api/question-bank";
const MANIFEST_URL = `${API_BASE}/manifest-v1.json`;
const MANIFEST_CACHE = "examply-icn-question-manifest-v1";
const FILE_CACHE = "examply-icn-question-files-v1";

type ManifestEntry = {
  subject: string;
  examType: string;
  examYear: number;
  path: string;
  count: number;
  sha256: string;
};

type Manifest = {
  schemaVersion: number;
  bankVersion: string;
  files: ManifestEntry[];
};

type IcnQuestion = {
  id?: string | number;
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  explanation?: string;
  imageAsset?: string | null;
};

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();

const normalizeSubject = (value: string) =>
  text(value).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();

const normalizeExam = (value: string) => text(value).toUpperCase();

const parseAnswerIndex = (value: unknown): number | null => {
  const answer = text(value).toUpperCase();
  if (/^[A-D]$/.test(answer)) return answer.charCodeAt(0) - 65;
  const numeric = Number(answer);
  return Number.isInteger(numeric) && numeric >= 0 && numeric <= 3 ? numeric : null;
};

const fetchJson = async <T>(url: string, cacheName: string): Promise<T | null> => {
  const cache = typeof caches !== "undefined" ? await caches.open(cacheName) : null;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    });
    if (!response.ok) throw new Error(`ICN question API returned ${response.status}`);
    if (cache) await cache.put(url, response.clone());
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`ICN question API unavailable for ${url}; trying cache.`, error);
    if (!cache) return null;
    try {
      const cached = await cache.match(url);
      if (!cached) return null;
      return (await cached.json()) as T;
    } catch (cacheError) {
      console.warn("Cached ICN question data could not be read.", cacheError);
      return null;
    }
  }
};

const getManifest = async (): Promise<Manifest | null> => {
  const manifest = await fetchJson<Manifest>(MANIFEST_URL, MANIFEST_CACHE);
  if (!manifest || !Array.isArray(manifest.files)) return null;
  return manifest;
};

const getCandidateEntries = (
  manifest: Manifest,
  subject: Subject,
  examType: ExamType,
  year: string
): ManifestEntry[] => {
  const wantedSubject = normalizeSubject(subject);
  const requestedExam = normalizeExam(examType);
  const entries = manifest.files.filter(
    (entry) => normalizeSubject(entry.subject) === wantedSubject
  );
  const examEntries = entries.filter(
    (entry) =>
      requestedExam === "STUDY RAND" ||
      normalizeExam(entry.examType) === requestedExam
  );

  if (year === "Random") return examEntries;

  const requestedYear = Number(year);
  return examEntries.filter((entry) => entry.examYear === requestedYear);
};

const readQuestionSet = async (entry: ManifestEntry): Promise<IcnQuestion[] | null> => {
  const url = `${API_BASE}/${entry.path}`;
  const data = await fetchJson<unknown>(url, FILE_CACHE);
  return Array.isArray(data) ? (data as IcnQuestion[]) : null;
};

const transformQuestions = (
  data: IcnQuestion[],
  subject: Subject,
  count: number
): Question[] => {
  const valid = data.flatMap((item, index) => {
    const options = [
      text(item.optionA),
      text(item.optionB),
      text(item.optionC),
      text(item.optionD),
    ];
    const correctOptionIndex = parseAnswerIndex(item.correctAnswer);
    const questionText = text(item.questionText);
    const explanation = text(item.explanation);

    if (
      !questionText ||
      options.some((option) => !option) ||
      correctOptionIndex === null ||
      explanation.length < 20
    ) return [];

    return [{
      id: item.id ?? `icn_${normalizeSubject(subject).replace(/\s+/g, "_")}_${index}`,
      text: questionText,
      imageUrl: text(item.imageAsset) || undefined,
      imageAlt: "Question illustration",
      options,
      correctOptionIndex,
      explanation,
    }];
  });

  return valid.sort(() => Math.random() - 0.5).slice(0, count);
};

export const getQuestionsFromIcnApi = async (
  examType: ExamType,
  subject: Subject,
  year: string,
  count = 10
): Promise<{ questions: Question[]; sources: string[] } | null> => {
  const manifest = await getManifest();
  if (!manifest) return null;

  const entries = getCandidateEntries(manifest, subject, examType, year);
  if (entries.length === 0) return null;

  const selectedEntries =
    year === "Random" ? [entries[Math.floor(Math.random() * entries.length)]] : [entries[0]];

  const sets = await Promise.all(selectedEntries.map(readQuestionSet));
  const questions = sets.flatMap((set) =>
    set ? transformQuestions(set, subject, count) : []
  );

  if (questions.length === 0) return null;

  return {
    questions: questions.slice(0, count),
    sources: [
      "SphereLearn ICN Question Bank API",
      `ICN bank version ${manifest.bankVersion}`,
    ],
  };
};
