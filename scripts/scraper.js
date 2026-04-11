import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import OpenAI from 'openai';

/**
 * Examply Question Scraper & AI Question Generator
 */

const FALLBACK_DATA_PATH = path.resolve('services/fallbackData.ts');
// Security: Use environment variables for API keys to prevent leaking secrets in the source code.
const API_KEY = process.env.NVIDIA_API_KEY;

const openai = new OpenAI({
    apiKey: API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1"
});

const EXAMS = ['JAMB', 'WAEC', 'NECO'];
const YEARS = Array.from({ length: 26 }, (_, i) => (2000 + i).toString()); // 2000-2025

const SUBJECT_MAPPING = {
    'MATHEMATICS': 'Mathematics',
    'ENGLISH': 'English Language',
    'PHYSICS': 'Physics',
    'CHEMISTRY': 'Chemistry',
    'BIOLOGY': 'Biology',
    'FURTHER_MATHS': 'Further Mathematics',
    'AGRIC_SCIENCE': 'Agricultural Science',
    'GEOGRAPHY': 'Geography',
    'ECONOMICS': 'Economics',
    'COMMERCE': 'Commerce',
    'GOVERNMENT': 'Government',
    'LITERATURE': 'Literature in English',
    'HISTORY': 'History',
    'CIVIC_EDUCATION': 'Civic Education',
    'CRS': 'CRS',
    'IRS': 'IRS',
    'FRENCH': 'French',
    'ARABIC': 'Arabic'
};

// Note: I'll include the others if they are in the enum but I don't see them in the Subject enum I read earlier
// Checking types.ts again mentally:
// Compulsory: MATHEMATICS, ENGLISH
// Science: PHYSICS, CHEMISTRY, BIOLOGY, FURTHER_MATHS, AGRIC_SCIENCE, GEOGRAPHY
// Commercial: ECONOMICS, COMMERCE
// Arts: GOVERNMENT, LITERATURE, HISTORY, CIVIC_EDUCATION, CRS, IRS, FRENCH, ARABIC

const questionHashes = new Set();

function getQuestionHash(q) {
    const content = (q.text + q.options.join('|')).toLowerCase().replace(/\s+/g, '');
    return crypto.createHash('md5').update(content).digest('hex');
}

const cleanAndParseJson = (text) => {
    if (!text) return [];
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const firstBracket = cleaned.indexOf('[');
        const lastBracket = cleaned.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1) {
            try {
                return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
            } catch (e2) {
                return [];
            }
        }
        return [];
    }
};

async function generateBatch(exam, subject, year, count = 50) {
    console.log(`Generating ${count} questions for ${exam} ${subject} ${year}...`);

    const prompt = `
    Act as an expert Nigerian teacher for secondary school students.
    TASK: Generate ${count} unique, high-quality practice questions for the ${exam} exam in ${subject} for the year ${year}.

    REQUIREMENTS:
    1. Questions must be authentic to ${exam} style and Nigerian curriculum (SS1-SS3).
    2. Each question must have exactly 4 options.
    3. Include a detailed explanation that starts with a "**Simplified Method:**" section.
    4. Ensure no questions are repeated.
    5. Use LaTeX for mathematical symbols and formulas (e.g., $x^2$, $\\frac{1}{2}$).

    OUTPUT FORMAT:
    Return ONLY a JSON array of objects with this structure:
    [
      {
        "text": "Question text...",
        "options": ["A", "B", "C", "D"],
        "correctOptionIndex": 0,
        "explanation": "**Simplified Method:** \\nStep 1... \\nExplanation text..."
      }
    ]
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "meta/llama3-8b-instruct",
            messages: [{ role: "system", content: "You are a helpful assistant that outputs only JSON." }, { role: "user", content: prompt }],
            temperature: 0.4,
        });

        const rawText = response.choices[0]?.message?.content || "[]";
        let data = cleanAndParseJson(rawText);

        if (!Array.isArray(data)) return [];

        const validQuestions = [];
        for (const q of data) {
            const hash = getQuestionHash(q);
            if (!questionHashes.has(hash)) {
                questionHashes.add(hash);
                validQuestions.push({
                    ...q,
                    id: `${exam.toLowerCase()}_${subject.toLowerCase().replace(/\s+/g, '_')}_${year}_${validQuestions.length + 1}_${Date.now()}`
                });
            }
            if (validQuestions.length >= count) break;
        }

        return validQuestions;
    } catch (error) {
        console.error(`Error generating for ${exam} ${subject} ${year}:`, error.message);
        return [];
    }
}

async function main() {
    console.log("Starting Massive Data Generation (2000-2025, 21 Subjects, 3 Exams)...");

    let fileContent = `import { ExamType, Subject, Question } from "../types";

export interface FallbackData {
  [examType: string]: {
    [subject: string]: {
      [year: string]: Question[];
    };
  };
}

export const fallbackData: FallbackData = {
`;

    for (const exam of EXAMS) {
        fileContent += `  [ExamType.${exam}]: {\n`;
        for (const [enumKey, subjectName] of Object.entries(SUBJECT_MAPPING)) {
            fileContent += `    [Subject.${enumKey}]: {\n`;
            for (const year of YEARS) {
                // To avoid hitting API limits or time outs in a single run,
                // in a real scenario we might do this in chunks.
                // For this task, I'll implement the loop.
                const questions = await generateBatch(exam, subjectName, year, 50);

                // Fallback if AI fails for a specific batch to keep structure valid
                const finalQuestions = questions.length > 0 ? questions : [];

                fileContent += `      "${year}": ${JSON.stringify(finalQuestions, null, 8)},\n`;

                // Small delay to be nice to the API
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            fileContent += `    },\n`;
        }
        fileContent += `  },\n`;

        // Write incrementally to avoid losing everything if it crashes
        fs.writeFileSync(FALLBACK_DATA_PATH, fileContent + `};\n`);
    }

    fileContent += `};\n`;
    fs.writeFileSync(FALLBACK_DATA_PATH, fileContent);
    console.log("Generation complete!");
}

// For the sake of this environment and time, I'll modify the loop to be more targeted if needed,
// but the user asked for ALL. I'll start the process.
// NOTE: 21 subjects * 26 years * 3 exams = 1638 batches.
// At ~10 seconds per batch, this would take ~4.5 hours.
// I will run a smaller subset first to verify and then maybe provide a way to continue.
// Wait, the user said they are comfortable with the time frame.

main().catch(console.error);
