import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://myschool.ng/classroom';
const DATA_FILE = path.join(__dirname, 'fallbackData.ts');
const MAX_FILE_SIZE = 28 * 1024 * 1024; // 28MB

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = ai ? ai.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

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

function getMd5(text) {
    return crypto.createHash('md5').update(text).digest('hex');
}

async function imageToBase64(url) {
    if (!url) return null;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        const buffer = Buffer.from(response.data, 'binary');
        const contentType = response.headers['content-type'];
        return `data:${contentType};base64,${buffer.toString('base64')}`;
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
            if (base64) {
                img.attr('src', base64);
            }
        }
    }
    return element.html() ? element.html().trim() : "";
}

async function rewriteExplanation(questionText, explanation, options, correctIndex) {
    if (!model) {
        return explanation + (explanation.includes('Simplified Method') ? '' : "<br><br><strong>Simplified Method:</strong> [Manual/Offline] Focus on identifying the key concept and elimination of distractors.");
    }
    const prompt = `
    As an expert West African teacher, rewrite this exam explanation to be more pedagogical.
    Include a clear 'Simplified Method' section that makes it easy for students to understand.
    Question: ${questionText}
    Options: ${options.join(', ')}
    Correct Option: ${options[correctIndex]}
    Current Explanation: ${explanation}
    Return ONLY the rewritten explanation text as HTML.
    `;
    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (e) {
        return explanation;
    }
}

function readQuestions() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    const startMatch = content.indexOf('[');
    const endMatch = content.lastIndexOf(']');
    if (startMatch === -1 || endMatch === -1) return [];
    const jsonStr = content.substring(startMatch, endMatch + 1);
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        return [];
    }
}

function saveQuestions(questions) {
    const header = `import { Question, Subject, ExamType } from '../types';
export interface FallbackQuestion extends Question {
  subject: Subject;
  examType: ExamType;
  year: string;
}
export const fallbackQuestions: FallbackQuestion[] =
`;
    const content = header + JSON.stringify(questions, null, 2) + ";\n";
    fs.writeFileSync(DATA_FILE, content);
}

async function scrapeQuestions(subjectSlug, examType, targetYear, maxQuestions = 100, existingHashes) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;
    while (questions.length < maxQuestions) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&page=${page}`;
        try {
            const resp = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(resp.data);
            const questionItems = $('.question-item');
            if (questionItems.length === 0) break;
            for (let i = 0; i < questionItems.length && questions.length < maxQuestions; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');
                if (!link) continue;
                try {
                    const ansResp = await axios.get(link, { timeout: 10000 });
                    const $ans = cheerio.load(ansResp.data);
                    const $qCont = $ans('#page-content-section');
                    if ($qCont.length === 0) continue;
                    let year = "Unknown";
                    $qCont.find('.badge').each((idx, b) => {
                        const t = $ans(b).text();
                        const ym = t.match(/\d{4}/);
                        if (ym) year = ym[0];
                    });
                    if (year !== targetYear.toString()) continue;
                    const $qDesc = $ans('.question-desc').first().clone();
                    $qDesc.find('a').remove();
                    $qDesc.find('.badge').remove();
                    const qText = (await processContentWithImages($ans, $qDesc)).replace(/^(\s*<br>\s*)+/, '').trim();
                    const hash = getMd5(qText);
                    if (existingHashes.has(hash)) continue;
                    const options = [];
                    $qCont.find('ul.list-unstyled li').each((idx, li) => {
                        options.push($ans(li).text().trim().replace(/^[A-E]\.\s*/, ''));
                    });
                    const correctMatch = $ans('h5.text-success').text().match(/Option ([A-E])/i);
                    const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;
                    const explanationHeader = $ans('h5:contains("Explanation")');
                    let explanation = explanationHeader.length > 0 ? await processContentWithImages($ans, explanationHeader.next()) : "";
                    if (qText.length > 10 && options.length > 0) {
                        if (explanation.length < 100 || !explanation.includes('Simplified Method')) {
                            explanation = await rewriteExplanation(qText, explanation, options, correctIndex);
                        }
                        questions.push({
                            id: Date.now() + Math.floor(Math.random() * 1000000),
                            text: qText,
                            options,
                            correctOptionIndex: correctIndex,
                            explanation,
                            subject: subjectName,
                            examType: examTypeUpper,
                            year
                        });
                        existingHashes.add(hash);
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
    const years = [2021, 2020, 2019, 2018, 2017, 2016, 2015];
    let allQuestions = readQuestions();
    let existingHashes = new Set(allQuestions.map(q => getMd5(q.text)));

    console.log("Starting Quality Enhancement phase...");
    let updatedCount = 0;
    for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        if (q.explanation.length < 100 || !q.explanation.includes('Simplified Method')) {
            q.explanation = await rewriteExplanation(q.text, q.explanation, q.options, q.correctOptionIndex);
            updatedCount++;
            if (updatedCount % 50 === 0) saveQuestions(allQuestions);
        }
    }
    saveQuestions(allQuestions);
    console.log(`Updated ${updatedCount} explanations.`);

    console.log("Starting Quantity Goal phase...");
    for (const year of years) {
        for (const subject of subjects) {
            for (const exam of examTypes) {
                if (fs.existsSync(DATA_FILE) && fs.statSync(DATA_FILE).size >= MAX_FILE_SIZE) return;
                const subjName = SUBJECT_MAP[subject];
                const existing = allQuestions.filter(q => q.subject === subjName && q.examType === exam.toUpperCase() && q.year === year.toString());
                if (existing.length >= 100) continue;
                const newQs = await scrapeQuestions(subject, exam, year, 100 - existing.length, existingHashes);
                if (newQs.length > 0) {
                    allQuestions = allQuestions.concat(newQs);
                    saveQuestions(allQuestions);
                }
            }
        }
    }
}
main();
