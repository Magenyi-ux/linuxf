import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://myschool.ng/classroom';
const TS_DATA_FILE = path.join(__dirname, 'fallbackData.ts');

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY || "AIza_placeholder" });

const SUBJECT_MAP = {
    'mathematics': 'Mathematics',
    'english-language': 'English Language',
    'chemistry': 'Chemistry',
    'physics': 'Physics',
    'biology': 'Biology',
    'geography': 'Geography',
    'literature-in-english': 'Literature in English',
    'economics': 'Economics',
    'commerce': 'Commerce',
    'accounts-principles-of-accounts': 'Accounts',
    'government': 'Government',
    'christian-religious-knowledge-crk': 'CRS',
    'agricultural-science': 'Agricultural Science',
    'islamic-religious-knowledge-irk': 'IRS',
    'history': 'History',
    'further-mathematics': 'Further Mathematics',
    'civic-education': 'Civic Education',
    'french': 'French',
    'arabic': 'Arabic'
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getQuestionHash(text) {
    const normalized = text.replace(/<[^>]*>?/gm, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return crypto.createHash('md5').update(normalized).digest('hex');
}

async function enhanceExplanation(questionText, options, correctOptionIndex, currentExplanation, subject) {
    if (!process.env.API_KEY) return currentExplanation;

    const prompt = `
        Act as an expert tutor for West African exams (WAEC, JAMB, NECO).
        Rewrite the following explanation to be:
        1. Fully accurate and complete.
        2. Easy to understand for a high school student.
        3. Include a "Simplified/Alternative Method" section if the current one is complex.

        QUESTION: ${questionText}
        OPTIONS: ${options.join(', ')}
        CORRECT OPTION: Option ${String.fromCharCode(65 + correctOptionIndex)}
        CURRENT EXPLANATION: ${currentExplanation}
        SUBJECT: ${subject}

        Return ONLY the enhanced HTML explanation. Use <p>, <br>, <strong> for formatting.
    `;

    try {
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        return result.text || currentExplanation;
    } catch (e) {
        return currentExplanation;
    }
}

async function imageToBase64(url) {
    if (!url) return null;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        const buffer = Buffer.from(response.data, 'binary');
        const contentType = response.headers['content-type'];
        return \`data:\${contentType};base64,\${buffer.toString('base64')}\`;
    } catch (e) {
        return null;
    }
}

async function processContentWithImages($, element) {
    if (!element || element.length === 0) return "";
    const images = element.find('img');
    for (let i = 0; i < images.length; i++) {
        const img = $(images[i]);
        const src = img.attr('src');
        if (src && src.startsWith('http')) {
            const base64 = await imageToBase64(src);
            if (base64) img.attr('src', base64);
        }
    }
    return element.html() ? element.html().trim() : "";
}

async function scrapeQuestionsForYear(subjectSlug, examType, year, targetCount = 100, existingHashes = new Set()) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    while (questions.length < targetCount) {
        const url = \`\${BASE_URL}/\${subjectSlug}?exam_type=\${examType.toLowerCase()}&exam_year=\${year}&page=\${page}\`;
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');
            if (questionItems.length === 0) break;

            for (let i = 0; i < questionItems.length && questions.length < targetCount; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');
                if (!link) continue;

                try {
                    const ansRes = await axios.get(link, { timeout: 10000 });
                    const $ans = cheerio.load(ansRes.data);
                    const $qContainer = $ans('#page-content-section');
                    if ($qContainer.length === 0) continue;

                    const $qDesc = $ans('.question-desc').first().clone();
                    $qDesc.find('a, .badge').remove();
                    const questionText = (await processContentWithImages($ans, $qDesc)).trim();
                    const qHash = getQuestionHash(questionText);
                    if (existingHashes.has(qHash)) continue;

                    const options = [];
                    $qContainer.find('ul.list-unstyled li').each((idx, li) => {
                        options.push($ans(li).text().trim().replace(/^[A-E]\.\s*/, ''));
                    });

                    const correctMatch = $ans('h5.text-success').text().match(/Option ([A-E])/i);
                    const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;
                    const rawExp = $ans('h5:contains("Explanation")').length ? await processContentWithImages($ans, $ans('h5:contains("Explanation")').next()) : "";

                    const explanation = await enhanceExplanation(questionText, options, correctIndex, rawExp, subjectName);

                    if (options.length > 0 && questionText.length > 10) {
                        questions.push({
                            id: Date.now() + Math.floor(Math.random() * 100000),
                            text: questionText,
                            options,
                            correctOptionIndex: correctIndex,
                            explanation,
                            subject: subjectName,
                            examType: examTypeUpper,
                            year: year.toString()
                        });
                        existingHashes.add(qHash);
                        process.stdout.write('.');
                    }
                    await sleep(100);
                } catch (e) {}
            }
            page++;
            if (page > 30) break;
        } catch (e) { break; }
    }
    return questions;
}

async function main() {
    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    const years = Array.from({ length: 15 }, (_, i) => (2024 - i).toString());

    if (!fs.existsSync(TS_DATA_FILE)) {
        console.error("Data file missing.");
        return;
    }

    const content = fs.readFileSync(TS_DATA_FILE, 'utf8');
    const match = content.match(/export const fallbackQuestions: FallbackQuestion\[\] =\s*(\[[\s\S]*\]);/);
    let allQuestions = match ? JSON.parse(match[1]) : [];
    const hashes = new Set(allQuestions.map(q => getQuestionHash(q.text)));

    let isFullyDone = true;
    for (const sub of subjects) {
        for (const exam of examTypes) {
            for (const yr of years) {
                const count = allQuestions.filter(q => q.subject === SUBJECT_MAP[sub] && q.examType === exam.toUpperCase() && q.year === yr).length;
                if (count < 100) {
                    isFullyDone = false;
                    const added = await scrapeQuestionsForYear(sub, exam, yr, 100 - count, hashes);
                    if (added.length > 0) {
                        allQuestions = allQuestions.concat(added);
                        fs.writeFileSync(TS_DATA_FILE, content.replace(match[1], JSON.stringify(allQuestions, null, 2)));
                    }
                }
            }
        }
    }

    if (isFullyDone) console.log("done");
}
main();
