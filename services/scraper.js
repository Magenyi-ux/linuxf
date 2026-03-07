import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY || 'dummy_key';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

const EXAM_TYPES = ['JAMB', 'WAEC', 'NECO'];
const SUBJECTS = [
    'Mathematics',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology',
    'Further Mathematics',
    'Agricultural Science',
    'Geography'
];
const YEARS = ['2021', '2020', '2019', '2018', '2017', '2016', '2015'];

const FALLBACK_DATA_PATH = path.resolve('services/fallbackData.ts');
const MAX_FILE_SIZE = 28 * 1024 * 1024; // 28MB

const SUBJECT_TO_ENUM = {
    'Mathematics': 'MATHEMATICS',
    'English Language': 'ENGLISH',
    'Physics': 'PHYSICS',
    'Chemistry': 'CHEMISTRY',
    'Biology': 'BIOLOGY',
    'Further Mathematics': 'FURTHER_MATHS',
    'Agricultural Science': 'AGRIC_SCIENCE',
    'Geography': 'GEOGRAPHY'
};

const ENUM_TO_SUBJECT = Object.fromEntries(Object.entries(SUBJECT_TO_ENUM).map(([k, v]) => [v, k]));

function getQuestionHash(q) {
    const content = (q.text + (q.options ? q.options.join('|') : '')).toLowerCase().replace(/\s+/g, '');
    return crypto.createHash('md5').update(content).digest('hex');
}

function loadExistingData() {
    if (!fs.existsSync(FALLBACK_DATA_PATH)) {
        return { JAMB: {}, WAEC: {}, NECO: {} };
    }

    const content = fs.readFileSync(FALLBACK_DATA_PATH, 'utf-8');
    const data = { JAMB: {}, WAEC: {}, NECO: {} };

    // Manual parser to extract arrays from the TypeScript file
    const lines = content.split('\n');
    let currentExam = null;
    let currentSubject = null;
    let currentYear = null;
    let jsonBuffer = '';
    let inArray = false;

    for (const line of lines) {
        const examMatch = line.match(/\[ExamType\.(\w+)\]: \{/);
        if (examMatch) {
            currentExam = examMatch[1];
            if (!data[currentExam]) data[currentExam] = {};
            continue;
        }

        const subjectMatch = line.match(/\[Subject\.(\w+)\]: \{/);
        if (subjectMatch) {
            const subjectEnumKey = subjectMatch[1];
            currentSubject = ENUM_TO_SUBJECT[subjectEnumKey] || subjectEnumKey;
            if (currentExam && !data[currentExam][currentSubject]) data[currentExam][currentSubject] = {};
            continue;
        }

        const yearMatch = line.match(/"(\d{4})": \[/);
        if (yearMatch) {
            currentYear = yearMatch[1];
            inArray = true;
            jsonBuffer = '[';
            continue;
        }

        if (inArray) {
            jsonBuffer += line + '\n';
            if (line.trim().startsWith('],')) {
                inArray = false;
                try {
                    let jsonToParse = jsonBuffer.trim();
                    if (jsonToParse.endsWith(',')) jsonToParse = jsonToParse.slice(0, -1);
                    if (currentExam && currentSubject && currentYear) {
                        data[currentExam][currentSubject][currentYear] = JSON.parse(jsonToParse);
                    }
                } catch (e) {
                    // console.error(`Error parsing JSON for ${currentExam} ${currentSubject} ${currentYear}`);
                }
                currentYear = null;
                jsonBuffer = '';
            }
        }
    }
    return data;
}

// Mock generator for fallback when API key is missing
async function mockGenerate(isJson = false, subject = "", count = 1, existingHashes = new Set(), year = "") {
    if (isJson) {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const q = {
                "text": "Sample " + subject + " " + year + " Question #" + (existingHashes.size + 1) + ": What is a key principle in " + subject + "?",
                "options": ["Principle A", "Principle B", "Principle C", "Principle D"],
                "correctOptionIndex": 0,
                "explanation": "This is a detailed pedagogical explanation for " + subject + ". Simplified Method: Focus on the core fundamentals of the topic."
            };
            const hash = getQuestionHash(q);
            if (!existingHashes.has(hash)) {
                questions.push(q);
                existingHashes.add(hash);
            }
        }
        return questions;
    }
    return "This is a rewritten pedagogical explanation. Simplified Method: Use basic principles.";
}

async function improveExplanation(question, subject) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy_key') {
        if (question.explanation && !question.explanation.includes("Simplified Method")) {
            return question.explanation + " Simplified Method: Break down the problem into smaller steps and solve sequentially.";
        }
        return question.explanation;
    }

    const prompt = "The following is a multiple-choice question for " + subject + ".\nQuestion: " + question.text + "\nOptions: " + (question.options ? question.options.join(', ') : '') + "\nCorrect Option Index: " + question.correctOptionIndex + "\nCurrent Explanation: " + question.explanation + "\n\nRewrite this explanation to be more pedagogical, clear, and detailed. \nYou MUST include a \"Simplified Method\" section at the end.\nUse LaTeX for formulas (e.g. \\( x^2 \\)).\nOutput ONLY the new explanation text. No preamble.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error improving explanation:", error.message);
        return question.explanation;
    }
}

async function generateQuestions(examType, subject, year, count, existingHashes) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy_key') {
        return await mockGenerate(true, subject, count, existingHashes, year);
    }

    const prompt = "Act as an expert teacher in West Africa.\nGenerate " + count + " authentic multiple-choice past questions for the " + examType + " exam in " + subject + " specifically for the year " + year + ".\n\nRequirements:\n1. Questions must be high-quality and relevant to the curriculum.\n2. Each question MUST have exactly 4 options.\n3. The explanation MUST include a \"Simplified Method\" section to help students understand better.\n4. Use LaTeX for mathematical formulas or chemical equations where appropriate (e.g. \\( x^2 \\), \\( H_2O \\)).\n\nOutput format: ONLY a raw JSON array of objects. No markdown formatting.\n[\n  {\n    \"text\": \"Question text...\",\n    \"options\": [\"A\", \"B\", \"C\", \"D\"],\n    \"correctOptionIndex\": 0,\n    \"explanation\": \"Detailed explanation... Simplified Method: ...\"\n  }\n]";

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: { response_mime_type: "application/json" }
        });

        const questions = JSON.parse(result.text);
        const validQuestions = [];
        for (const q of (Array.isArray(questions) ? questions : [])) {
            const hash = getQuestionHash(q);
            if (!existingHashes.has(hash)) {
                validQuestions.push(q);
                existingHashes.add(hash);
            }
        }
        return validQuestions;
    } catch (error) {
        console.error("Error generating questions:", error.message);
        return [];
    }
}

function serializeData(data) {
    let output = 'import { ExamType, Subject, Question } from "../types";\n\nexport interface FallbackData {\n  [examType: string]: {\n    [subject: string]: {\n      [year: string]: Question[];\n    };\n  };\n}\n\nexport const fallbackData: FallbackData = {\n';

    for (const [exam, subjects] of Object.entries(data)) {
        output += '  [ExamType.' + exam + ']: {\n';
        for (const [subject, years] of Object.entries(subjects)) {
            const subjectEnumKey = SUBJECT_TO_ENUM[subject] || subject.toUpperCase().replace(/\s+/g, '_');
            output += '    [Subject.' + subjectEnumKey + ']: {\n';
            for (const [year, questions] of Object.entries(years)) {
                if (questions && questions.length > 0) {
                    output += '      "' + year + '": ' + JSON.stringify(questions, null, 8) + ',\n';
                }
            }
            output += '    },\n';
        }
        output += '  },\n';
    }
    output += '};\n';

    // Original mirroring logic for 2025
    output += '\n// Mirroring the data\nif (fallbackData[ExamType.JAMB]) {\n  if (fallbackData[ExamType.JAMB][Subject.ENGLISH] && fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"]) {\n    fallbackData[ExamType.WAEC] = fallbackData[ExamType.WAEC] || {};\n    fallbackData[ExamType.WAEC][Subject.ENGLISH] = fallbackData[ExamType.WAEC][Subject.ENGLISH] || {};\n    fallbackData[ExamType.WAEC][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];\n    fallbackData[ExamType.NECO] = fallbackData[ExamType.NECO] || {};\n    fallbackData[ExamType.NECO][Subject.ENGLISH] = fallbackData[ExamType.NECO][Subject.ENGLISH] || {};\n    fallbackData[ExamType.NECO][Subject.ENGLISH]["2025"] = fallbackData[ExamType.JAMB][Subject.ENGLISH]["2025"];\n  }\n  if (fallbackData[ExamType.JAMB][Subject.MATHEMATICS] && fallbackData[ExamType.JAMB][Subject.MATHEMATICS]["2025"]) {\n    fallbackData[ExamType.WAEC] = fallbackData[ExamType.WAEC] || {};\n    fallbackData[ExamType.WAEC][Subject.MATHEMATICS] = fallbackData[ExamType.WAEC][Subject.MATHEMATICS] || {};\n    fallbackData[ExamType.WAEC][Subject.MATHEMATICS]["2025"] = fallbackData[ExamType.JAMB][Subject.MATHEMATICS]["2025"];\n    fallbackData[ExamType.NECO] = fallbackData[ExamType.NECO] || {};\n    fallbackData[ExamType.NECO][Subject.MATHEMATICS] = fallbackData[ExamType.NECO][Subject.MATHEMATICS] || {};\n    fallbackData[ExamType.NECO][Subject.MATHEMATICS]["2025"] = fallbackData[ExamType.JAMB][Subject.MATHEMATICS]["2025"];\n  }\n}\n';
    return output;
}

function saveData(data) {
    fs.writeFileSync(FALLBACK_DATA_PATH, serializeData(data));
}

async function main() {
    console.log("Loading existing data...");
    const currentData = loadExistingData();
    const existingHashes = new Set();
    for (const exam of Object.values(currentData)) {
        for (const subject of Object.values(exam)) {
            for (const yearQuestions of Object.values(subject)) {
                if (Array.isArray(yearQuestions)) {
                    for (const q of yearQuestions) existingHashes.add(getQuestionHash(q));
                }
            }
        }
    }
    console.log("Loaded " + existingHashes.size + " unique questions.");

    console.log("Starting quality improvement pass...");
    for (const [examName, subjects] of Object.entries(currentData)) {
        for (const [subjectName, years] of Object.entries(subjects)) {
            for (const [year, questions] of Object.entries(years)) {
                if (Array.isArray(questions)) {
                    for (let i = 0; i < questions.length; i++) {
                        const q = questions[i];
                        if (!q.explanation || q.explanation.length < 100 || !q.explanation.includes("Simplified Method")) {
                            q.explanation = await improveExplanation(q, subjectName);
                        }
                    }
                    saveData(currentData);
                    if (GEMINI_API_KEY === 'dummy_key') break;
                }
            }
            if (GEMINI_API_KEY === 'dummy_key') break;
        }
        if (GEMINI_API_KEY === 'dummy_key') break;
    }

    const TARGET_COUNT = 100;
    let totalNew = 0;
    for (const exam of EXAM_TYPES) {
        for (const subject of SUBJECTS) {
            for (const year of YEARS) {
                if (!currentData[exam]) currentData[exam] = {};
                if (!currentData[exam][subject]) currentData[exam][subject] = {};
                if (!currentData[exam][subject][year]) currentData[exam][subject][year] = [];
                let questions = currentData[exam][subject][year];

                while (questions.length < TARGET_COUNT) {
                    if (Buffer.byteLength(serializeData(currentData)) >= MAX_FILE_SIZE) {
                        console.log("Reached 28MB limit.");
                        saveData(currentData);
                        return;
                    }
                    const toGen = Math.min(20, TARGET_COUNT - questions.length);
                    const newQs = await generateQuestions(exam, subject, year, toGen, existingHashes);
                    if (!newQs || newQs.length === 0) break;
                    for (const q of newQs) {
                        q.id = Date.now() + Math.floor(Math.random() * 1000000);
                        questions.push(q);
                        totalNew++;
                    }
                    console.log("Status: " + exam + " " + subject + " " + year + " - " + questions.length + "/" + TARGET_COUNT);
                    saveData(currentData);
                    if (GEMINI_API_KEY === 'dummy_key') break;
                    await new Promise(r => setTimeout(r, 500));
                }
            }
        }
    }
    saveData(currentData);
    console.log("Generation complete! Total new questions: " + totalNew);
}

main().catch(err => { console.error("FATAL ERROR:", err); process.exit(1); });
