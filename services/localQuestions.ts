import { Subject, Question } from "../types";

// Import all JSON files from the questions directory
const questionFiles = import.meta.glob("./questions/*.json", { eager: true });

interface RawQuestion {
  id: number | string;
  question: string;
  options: {
    a?: string;
    b?: string;
    c?: string;
    d?: string;
    e?: string;
    [key: string]: string | undefined;
  };
  year_id: string;
  correctOptionIndex?: number;
  explanation?: string;
}

const subjectToFilename: Record<string, string> = {
  [Subject.MATHEMATICS]: "mathematics",
  [Subject.ENGLISH]: "english-language",
  [Subject.PHYSICS]: "physics",
  [Subject.CHEMISTRY]: "chemistry",
  [Subject.BIOLOGY]: "biology",
  [Subject.FURTHER_MATHS]: "further-mathematics",
  [Subject.AGRIC_SCIENCE]: "agricultural-science",
  [Subject.GEOGRAPHY]: "geography",
  [Subject.ECONOMICS]: "economics",
  [Subject.COMMERCE]: "commerce",
  [Subject.GOVERNMENT]: "government",
  [Subject.LITERATURE]: "literature-in-english",
  [Subject.HISTORY]: "history",
  [Subject.CIVIC_EDUCATION]: "civic-education",
  [Subject.CRS]: "crs",
  [Subject.IRS]: "irs",
  [Subject.FRENCH]: "french",
  [Subject.ARABIC]: "arabic",
};

/**
 * Loads and adapts questions from local JSON files.
 */
export const getLocalQuestions = (
  subject: Subject,
  year: string,
  count: number = 10
): { questions: Question[]; sources: string[] } | null => {
  const filename = subjectToFilename[subject];
  if (!filename) return null;

  // Try to find the file in the globbed imports
  const filePath = `./questions/${filename}_questions.json`;
  const fileData = (questionFiles[filePath] as any)?.default;

  if (!fileData || !Array.isArray(fileData)) {
    // Try fallback for myschool_economics
    if (subject === Subject.ECONOMICS) {
       const altPath = `./questions/myschool_economics_questions.json`;
       const altData = (questionFiles[altPath] as any)?.default;
       if (altData && Array.isArray(altData)) {
           return processRawData(altData, year, count, subject);
       }
    }
    return null;
  }

  return processRawData(fileData, year, count, subject);
};

const processRawData = (
  data: RawQuestion[],
  year: string,
  count: number,
  subject: Subject
) => {
  // Filter by year if not 'Random'
  let filtered = year === "Random"
    ? data
    : data.filter((q) => q.year_id === year);

  if (filtered.length === 0) {
      // If no questions for specific year, but we have data for the subject,
      // maybe we should return some random ones anyway?
      // The requirement says "prefer these local packs when a year is selected".
      // If the year doesn't exist in the local pack, we might want to return null to fallback to AI.
      return null;
  }

  // Shuffle and pick 'count'
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  const transformed: Question[] = selected.map((q) => {
    // Map options object to array
    const optionsArray: string[] = [];
    if (q.options.a) optionsArray.push(q.options.a);
    if (q.options.b) optionsArray.push(q.options.b);
    if (q.options.c) optionsArray.push(q.options.c);
    if (q.options.d) optionsArray.push(q.options.d);
    if (q.options.e) optionsArray.push(q.options.e);

    return {
      id: `local_${subject.toLowerCase().replace(/\s+/g, '_')}_${q.id}`,
      text: q.question,
      options: optionsArray,
      correctOptionIndex: q.correctOptionIndex ?? 0,
      explanation: q.explanation ?? "",
    };
  });

  return {
    questions: transformed,
    sources: ["Local Question Bank (Vetted)"],
  };
};
