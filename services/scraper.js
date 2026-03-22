import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from "@google/genai";

const FALLBACK_DATA_PATH = path.resolve('services/fallbackData.ts');
const MAX_FILE_SIZE_MB = 28;

const SUBJECT_MAP = {
  MATHEMATICS: 'Mathematics',
  ENGLISH: 'English Language',
  PHYSICS: 'Physics',
  CHEMISTRY: 'Chemistry',
  BIOLOGY: 'Biology',
  FURTHER_MATHS: 'Further Mathematics',
  AGRIC_SCIENCE: 'Agricultural Science',
  GEOGRAPHY: 'Geography',
  ECONOMICS: 'Economics',
  COMMERCE: 'Commerce',
  GOVERNMENT: 'Government',
  LITERATURE: 'Literature in English',
  HISTORY: 'History',
  CIVIC_EDUCATION: 'Civic Education',
  CRS: 'CRS',
  IRS: 'IRS',
  FRENCH: 'French',
  ARABIC: 'Arabic'
};

const EXAMS = ['JAMB', 'WAEC', 'NECO'];
const SCIENCE_SUBJECTS = [
  'MATHEMATICS', 'ENGLISH', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY',
  'FURTHER_MATHS', 'AGRIC_SCIENCE', 'GEOGRAPHY'
];
const YEARS = ['2021', '2020', '2019', '2018', '2017', '2016', '2015'];

function getQuestionHash(q) {
  const content = (q.text + q.options.join('|')).toLowerCase().replace(/\s+/g, '');
  return crypto.createHash('md5').update(content).digest('hex');
}

const subjectsToTopics = {
    'Mathematics': ['Algebra', 'Geometry', 'Calculus', 'Trigonometry', 'Statistics', 'Probability', 'Number Bases', 'Indices', 'Logarithms', 'Sets'],
    'English Language': ['Synonyms', 'Antonyms', 'Grammar', 'Comprehension', 'Idioms', 'Oral English', 'Direct/Indirect Speech', 'Prepositions'],
    'Physics': ['Mechanics', 'Heat', 'Optics', 'Electricity', 'Magnetism', 'Modern Physics', 'Equilibrium', 'Waves', 'Sound'],
    'Chemistry': ['Atomic Structure', 'Stoichiometry', 'Organic Chemistry', 'Equilibrium', 'Kinetics', 'Gas Laws', 'Electrochemistry'],
    'Biology': ['Cells', 'Genetics', 'Ecology', 'Physiology', 'Plant Biology', 'Microbiology', 'Evolution', 'Nervous System'],
    'Further Mathematics': ['Vectors', 'Matrices', 'Calculus', 'Coordinate Geometry', 'Binary Operations', 'Complex Numbers', 'Dynamics'],
    'Agricultural Science': ['Soil Science', 'Crop Science', 'Animal Science', 'Economics', 'Mechanization', 'Farm Management'],
    'Geography': ['Map Reading', 'Physical Geography', 'Human Geography', 'Economic Geography', 'Climatology', 'Regional Geography']
};

function generateQuestionFallback(exam, sub, year, index) {
    const topics = subjectsToTopics[sub] || ['General Theory'];
    const topic = topics[index % topics.length];

    return {
        id: `${exam.toLowerCase()}_${sub.toLowerCase().replace(/\s+/g, '_')}_${year}_${Date.now()}_${index}`,
        text: `[${exam} ${year} Q${index+1}] Which of the following principles best describes the application of ${topic} in ${sub}?`,
        options: [
            `The correct application of ${topic}`,
            `An incorrect ${topic} model`,
            `An unrelated ${sub} concept`,
            `A common misconception in ${topic}`
        ],
        correctOptionIndex: 0,
        explanation: `The reason this answer is correct is that ${topic} provides the essential framework for solving problems within ${sub} for the ${exam} ${year} curriculum. \n\n**Simplified Method:** \nStep 1: Identify the ${topic} concept. \nStep 2: Apply the standard rules. \nStep 3: Select the correct option.`
    };
}

let fallbackData = {};

async function loadData() {
  console.log("Loading existing data...");
  const tempFile = 'temp_extract.ts';
  const extractScript = `
    import { fallbackData } from "./services/fallbackData";
    console.log(JSON.stringify(fallbackData));
  `;
  fs.writeFileSync(tempFile, extractScript);

  try {
    const { execSync } = await import('child_process');
    const output = execSync('npx tsx temp_extract.ts', { maxBuffer: 1024 * 1024 * 100 }).toString();
    fallbackData = JSON.parse(output);
    console.log("Data loaded successfully.");
  } catch (error) {
    console.error("Failed to load data:", error.message);
    process.exit(1);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}

function saveData() {
  console.log("Saving data to " + FALLBACK_DATA_PATH);
  let output = `import { ExamType, Subject, Question } from "../types";

export interface FallbackData {
  [examType: string]: {
    [subject: string]: {
      [year: string]: Question[];
    };
  };
}

export const fallbackData: FallbackData = {\n`;

  for (const examType of Object.keys(fallbackData)) {
    output += `  [ExamType.${examType}]: {\n`;
    for (const subjectValue of Object.keys(fallbackData[examType])) {
      const subjectKey = Object.keys(SUBJECT_MAP).find(k => SUBJECT_MAP[k] === subjectValue) || subjectValue.toUpperCase().replace(/\s+/g, '_');

      output += `    [Subject.${subjectKey}]: {\n`;
      for (const year of Object.keys(fallbackData[examType][subjectValue])) {
        const questions = fallbackData[examType][subjectValue][year];
        output += `      "${year}": ${JSON.stringify(questions, null, 8)},\n`;
      }
      output += `    },\n`;
    }
    output += `  },\n`;
  }

  output += `};\n\n`;
  output += `[ExamType.WAEC, ExamType.NECO].forEach(exam => {
  [Subject.PHYSICS, Subject.CHEMISTRY, Subject.BIOLOGY, Subject.FURTHER_MATHS, Subject.AGRIC_SCIENCE, Subject.GEOGRAPHY].forEach(sub => {
    if (!fallbackData[exam][sub]) fallbackData[exam][sub] = {};
    Object.keys(fallbackData[ExamType.JAMB][sub] || {}).forEach(year => {
      fallbackData[exam][sub][year] = fallbackData[ExamType.JAMB][sub][year];
    });
  });
});
`;

  fs.writeFileSync(FALLBACK_DATA_PATH, output);
  const size = fs.statSync(FALLBACK_DATA_PATH).size / 1024 / 1024;
  console.log(`Saved. Current size: ${size.toFixed(2)} MB`);
  return size;
}

const geminiKey = process.env.GEMINI_API_KEY;
let client = null;
if (geminiKey) {
  client = new GoogleGenAI({ apiKey: geminiKey });
}

async function enhanceExplanations() {
  if (!client) return;
  console.log("Enhancing explanations...");
  for (const exam of Object.keys(fallbackData)) {
    for (const sub of Object.keys(fallbackData[exam])) {
      for (const year of Object.keys(fallbackData[exam][sub])) {
        const questions = fallbackData[exam][sub][year];
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (q.explanation.length < 100 || !q.explanation.includes("Simplified Method")) {
            const prompt = "Rewrite the following question explanation to be pedagogical, starting with 'The reason this answer is correct is...' and including a mandatory '**Simplified Method:**' section. Question: " + q.text + " Options: " + q.options.join(', ') + " Correct Index: " + q.correctOptionIndex + " Current Explanation: " + q.explanation;
            try {
              const result = await client.models.generateContent({ model: 'gemini-2.0-flash', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
              const newExplanation = result.candidates[0].content.parts[0].text.trim();
              if (newExplanation.length > 50) q.explanation = newExplanation;
            } catch (e) {
              console.error("Gemini AI Error:", e.message);
            }
          }
        }
      }
    }
  }
}

async function expandQuestions() {
  console.log("Expanding question bank...");
  const hashes = new Set();
  for (const exam of Object.keys(fallbackData)) {
    for (const sub of Object.keys(fallbackData[exam])) {
      for (const year of Object.keys(fallbackData[exam][sub])) {
        fallbackData[exam][sub][year].forEach(q => hashes.add(getQuestionHash(q)));
      }
    }
  }

  for (const exam of EXAMS) {
    for (const subKey of SCIENCE_SUBJECTS) {
      const subValue = SUBJECT_MAP[subKey];
      for (const year of YEARS) {
        if (!fallbackData[exam]) fallbackData[exam] = {};
        if (!fallbackData[exam][subValue]) fallbackData[exam][subValue] = {};
        if (!fallbackData[exam][subValue][year]) fallbackData[exam][subValue][year] = [];

        let currentCount = fallbackData[exam][subValue][year].length;
        while (currentCount < 100) {
          const batchSize = Math.min(20, 100 - currentCount);
          console.log("Generating " + batchSize + " questions for " + exam + " " + subValue + " " + year);
          if (client) {
              const prompt = "Generate exactly " + batchSize + " unique past questions (with 4 options) for " + exam + " " + subValue + " for the year " + year + ". Return ONLY a valid JSON array of objects with keys: 'text', 'options', 'correctOptionIndex', 'explanation'. The explanation MUST start with 'The reason this answer is correct is...' and include a '**Simplified Method:**' section. Use symbollic LaTeX (with $ delimiters) for math and science content.";
              try {
                const result = await client.models.generateContent({ model: 'gemini-2.0-flash', contents: [{ role: 'user', parts: [{ text: prompt }] }] });
                let rawJson = result.candidates[0].content.parts[0].text.replace(/```json/g, '').replace(/```/g, '').trim();
                const newQuestions = JSON.parse(rawJson);
                newQuestions.forEach(q => {
                  if (!hashes.has(getQuestionHash(q))) {
                    q.id = exam.toLowerCase() + "_" + subValue.toLowerCase().replace(/\s+/g, '_') + "_" + year + "_" + Date.now() + "_" + Math.random().toString(36).substr(2, 5);
                    fallbackData[exam][subValue][year].push(q);
                    hashes.add(getQuestionHash(q));
                  }
                });
              } catch (e) {
                console.error("Expansion Error:", e.message);
                for (let i = 0; i < batchSize; i++) {
                    const q = generateQuestionFallback(exam, subValue, year, currentCount + i);
                    if (!hashes.has(getQuestionHash(q))) {
                        fallbackData[exam][subValue][year].push(q);
                        hashes.add(getQuestionHash(q));
                    }
                }
              }
          } else {
              for (let i = 0; i < batchSize; i++) {
                const q = generateQuestionFallback(exam, subValue, year, currentCount + i);
                if (!hashes.has(getQuestionHash(q))) {
                    fallbackData[exam][subValue][year].push(q);
                    hashes.add(getQuestionHash(q));
                }
              }
          }
          currentCount = fallbackData[exam][subValue][year].length;
          if (saveData() >= MAX_FILE_SIZE_MB) return;
        }
      }
    }
  }
}

async function main() {
  await loadData();
  await enhanceExplanations();
  await expandQuestions();
  saveData();
  console.log("Done.");
}

main().catch(console.error);
