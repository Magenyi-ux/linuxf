
const fs = require('fs');
const path = require('path');

const Subject = {
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

const fileToSubject = {
  'commerce_questions.json': Subject.COMMERCE,
  'economics_questions.json': Subject.ECONOMICS,
  'english-language_questions.json': Subject.ENGLISH,
  'further-mathematics_questions.json': Subject.FURTHER_MATHS,
  'geography_questions.json': Subject.GEOGRAPHY,
  'government_questions.json': Subject.GOVERNMENT,
  'literature-in-english_questions.json': Subject.LITERATURE,
  'mathematics_questions.json': Subject.MATHEMATICS,
  'physics_questions.json': Subject.PHYSICS,
  'myschool_economics_questions.json': Subject.ECONOMICS,
  'deepseek_json_20260503_88e75e.json': Subject.ECONOMICS,
  'deepseek_json_20260503_ba99f5.json': Subject.ECONOMICS
};

// Hardcoded answers for the first batch of Commerce (1-100)
// In a real scenario, we'd have a much larger mapping.
const commerceAnswers = [
  1, 2, 1, 3, 1, 2, 2, 3, 2, 2, // 1-10
  1, 3, 1, 2, 1, 1, 1, 0, 3, 2, // 11-20
  3, 2, 0, 0, 0, 1, 0, 2, 3, 3, // 21-30
  1, 2, 0, 3, 2, 1, 3, 0, 3, 2, // 31-40
  2, 3, 2, 1, 1, 2, 1, 0, 3, 3, // 41-50
  2, 1, 1, 0, 1, 1, 3, 2, 0, 2, // 51-60
  0, 0, 1, 2, 0, 0, 2, 2, 0, 0, // 61-70
  1, 2, 3, 2, 3, 2, 2, 2, 1, 0, // 71-80
  3, 0, 0, 0, 0, 3, 3, 2, 1, 2, // 81-90
  0, 3, 3, 0, 3, 2, 1, 1, 0, 1  // 91-100
];

function normalizeOptions(q) {
  let options = [];
  if (q.options) {
    if (Array.isArray(q.options)) {
      options = q.options;
    } else {
      ['a', 'b', 'c', 'd', 'e'].forEach(key => {
        if (q.options[key]) options.push(q.options[key]);
      });
    }
  } else {
    ['option_a', 'option_b', 'option_c', 'option_d', 'option_e'].forEach(key => {
      if (q[key]) options.push(q[key]);
    });
  }
  return options;
}

function getCorrectIndex(q, options, file, index) {
  if (file === 'commerce_questions.json' && index < commerceAnswers.length) {
    return commerceAnswers[index];
  }
  if (q.correctOptionIndex !== undefined) return q.correctOptionIndex;
  if (q.answer) {
    if (typeof q.answer === 'number') return q.answer;
    const ans = q.answer.toString().toLowerCase();
    if (ans === 'a' || ans === '0') return 0;
    if (ans === 'b' || ans === '1') return 1;
    if (ans === 'c' || ans === '2') return 2;
    if (ans === 'd' || ans === '3') return 3;
    if (ans === 'e' || ans === '4') return 4;
  }
  return 0; // Default
}

const studyRandData = {};

Object.entries(fileToSubject).forEach(([file, subject]) => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(data)) return;

  if (!studyRandData[subject]) studyRandData[subject] = [];

  data.forEach((q, index) => {
    const options = normalizeOptions(q);
    if (options.length === 0) return;

    const correctIdx = getCorrectIndex(q, options, file, index);
    const normalizedQ = {
      id: `rand_${subject}_${file}_${index}`,
      text: q.question || q.text,
      options: options,
      correctOptionIndex: correctIdx,
      explanation: q.explanation || `The correct answer is "${options[correctIdx]}". This is based on standard ${subject} principles.`
    };

    studyRandData[subject].push(normalizedQ);
  });
});

const outputContent = `
import { Question } from "../types";

export const studyRandData: Record<string, Question[]> = ${JSON.stringify(studyRandData, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'services', 'studyRandData.ts'), outputContent);
console.log("Successfully generated services/studyRandData.ts");
