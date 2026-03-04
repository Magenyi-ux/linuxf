
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO'];
const SUBJECTS = [
    'Mathematics',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology'
];
const YEARS = Array.from({ length: 11 }, (_, i) => (2025 - i).toString());

const FALLBACK_DATA_PATH = path.resolve('services/fallbackData.ts');

function getQuestionHash(q) {
    const content = (q.text + q.options.join('|')).toLowerCase().replace(/\s+/g, '');
    return crypto.createHash('md5').update(content).digest('hex');
}

async function generateQuestions(examType, subject, year, count, existingHashes) {
    console.log(`Generating ${count} questions for ${examType} ${subject} ${year}...`);

    const prompt = `
        Act as an expert teacher in West Africa.
        Generate ${count} authentic multiple-choice past questions for the ${examType} exam in ${subject} specifically for the year ${year}.

        Requirements:
        1. Questions must be high-quality and relevant to the curriculum.
        2. Each question MUST have exactly 4 options.
        3. The explanation MUST include a "Simplified Method" section to help students understand better.
        4. Use LaTeX for mathematical formulas or chemical equations where appropriate (e.g. \\( x^2 \\), \\( H_2O \\)).

        Output format: ONLY a raw JSON array of objects. No markdown formatting.
        [
          {
            "text": "Question text...",
            "options": ["A", "B", "C", "D"],
            "correctOptionIndex": 0,
            "explanation": "Detailed explanation... Simplified Method: ..."
          }
        ]
    `;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "You are a helpful assistant that generates educational content in JSON format." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        let questions = JSON.parse(content);

        if (!Array.isArray(questions)) {
            const keys = Object.keys(questions);
            if (keys.length === 1 && Array.isArray(questions[keys[0]])) {
                questions = questions[keys[0]];
            } else {
                console.error("GPT returned non-array JSON:", content);
                return [];
            }
        }

        const validQuestions = [];
        for (const q of questions) {
            const hash = getQuestionHash(q);
            if (!existingHashes.has(hash)) {
                validQuestions.push(q);
                existingHashes.add(hash);
            } else {
                console.log(`Skipped duplicate question: ${q.text.substring(0, 30)}...`);
            }
        }

        return validQuestions;
    } catch (error) {
        if (error.status === 429) {
            console.error("Quota exceeded.");
            process.exit(0);
        }
        console.error(`Error generating questions for ${examType} ${subject} ${year}:`, error.message);
        return [];
    }
}

async function main() {
    let currentData = {
        JAMB: {},
        WAEC: {},
        NECO: {}
    };
    const existingHashes = new Set();

    let totalNewQuestions = 0;
    const TARGET_COUNT = 60;

    for (const exam of EXAM_TYPES) {
        for (const subject of SUBJECTS) {
            for (const year of YEARS) {
                if (!currentData[exam][subject]) currentData[exam][subject] = {};
                if (!currentData[exam][subject][year]) currentData[exam][subject][year] = [];

                let questions = currentData[exam][subject][year];

                while (questions.length < TARGET_COUNT) {
                    const toGenerate = Math.min(20, TARGET_COUNT - questions.length);
                    const newQuestions = await generateQuestions(exam, subject, year, toGenerate, existingHashes);

                    if (newQuestions.length === 0) {
                        console.log("No new questions generated, moving on.");
                        break;
                    }

                    for (const q of newQuestions) {
                        q.id = Date.now() + Math.floor(Math.random() * 1000000);
                        questions.push(q);
                        totalNewQuestions++;
                    }

                    console.log(`Status: ${exam} ${subject} ${year} - ${questions.length}/${TARGET_COUNT} questions.`);

                    // Small delay
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }
    }

    if (totalNewQuestions > 0) {
        saveData(currentData);
    }
    console.log(`Generation complete! Total new questions: ${totalNewQuestions}`);
}

function saveData(data) {
    let output = `
import { ExamType, Subject, Question } from "../types";

export interface FallbackData {
  [examType: string]: {
    [subject: string]: {
      [year: string]: Question[];
    };
  };
}

export const fallbackData: FallbackData = {
`;

    for (const [exam, subjects] of Object.entries(data)) {
        output += `  [ExamType.${exam}]: {\n`;
        for (const [subject, years] of Object.entries(subjects)) {
            const subjectEnumKey = Object.entries({
                'MATHEMATICS': 'Mathematics',
                'ENGLISH': 'English Language',
                'PHYSICS': 'Physics',
                'CHEMISTRY': 'Chemistry',
                'BIOLOGY': 'Biology'
            }).find(([k, v]) => v === subject)?.[0] || subject.toUpperCase().replace(/\s+/g, '_');

            output += `    [Subject.${subjectEnumKey}]: {\n`;
            for (const [year, questions] of Object.entries(years)) {
                output += `      "${year}": ${JSON.stringify(questions, null, 8)},\n`;
            }
            output += `    },\n`;
        }
        output += `  },\n`;
    }

    output += `};\n`;

    fs.writeFileSync(FALLBACK_DATA_PATH, output);
}

main().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
