
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
const FALLBACK_FILE = path.join(__dirname, 'fallbackData.ts');

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

// Initialize Gemini AI
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIza_placeholder" });
const model = "gemini-1.5-flash";

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getMD5(text, options) {
    const combined = text + options.join('|');
    return crypto.createHash('md5').update(combined).digest('hex');
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

async function rewriteExplanation(questionText, options, correctOptionIndex, currentExplanation, subject) {
    if (process.env.GEMINI_API_KEY === "AIza_placeholder" || !process.env.GEMINI_API_KEY) {
        // Mock pedagogical explanation for demonstration if no API key
        if (!currentExplanation || currentExplanation.length < 50) {
            return (currentExplanation || "") + "\n\n<p><strong>Detailed Analysis:</strong> This question tests the fundamental principles of " + subject + ". By analyzing the given options and applying relevant concepts, we can determine the correct answer.</p><p><strong>Simplified Method:</strong> Focus on the key terms in the question and match them with the most scientifically accurate option provided.</p>";
        }
        return currentExplanation;
    }

    const prompt = `
        Act as an expert SS3 Teacher in Nigeria.
        Rewrite the following explanation for a ${subject} question to be more pedagogical and complete.

        QUESTION: ${questionText}
        OPTIONS: ${options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join(', ')}
        CORRECT OPTION: ${String.fromCharCode(65 + correctOptionIndex)}
        CURRENT EXPLANATION: ${currentExplanation}

        YOUR TASK:
        1. Provide a detailed, step-by-step pedagogical explanation.
        2. MUST include a 'Simplified Method' section at the end for quick understanding.
        3. Use LaTeX for mathematical formulas (e.g., \\(x^2\\)).
        4. Return ONLY the enhanced explanation text. No JSON, no markdown code blocks.
    `;

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                temperature: 0.4
            }
        });
        return response.text.trim();
    } catch (e) {
        console.error("Gemini Error:", e.message);
        return currentExplanation;
    }
}

function readFallbackData() {
    if (!fs.existsSync(FALLBACK_FILE)) return [];
    const content = fs.readFileSync(FALLBACK_FILE, 'utf8');
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
}

function writeFallbackData(questions) {
    const header = `import { Question, Subject, ExamType } from '../types';

export interface FallbackQuestion extends Question {
  subject: Subject;
  examType: ExamType;
  year: string;
}

export const fallbackQuestions: FallbackQuestion[] =
`;
    const content = header + JSON.stringify(questions, null, 2) + ";\n";
    fs.writeFileSync(FALLBACK_FILE, content);
}

async function scrapeQuestions(subjectSlug, examType, yearTarget, maxQuestions = 100, existingHashes = new Set()) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    console.log(`Starting: ${subjectName} (${examTypeUpper}) for ${yearTarget}`);

    while (questions.length < maxQuestions) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&page=${page}&exam_year=${yearTarget}`;
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');

            if (questionItems.length === 0) break;

            for (let i = 0; i < questionItems.length && questions.length < maxQuestions; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');

                if (link) {
                    try {
                        const answerResponse = await axios.get(link, { timeout: 10000 });
                        const $ans = cheerio.load(answerResponse.data);
                        const $questionContainer = $ans('#page-content-section');

                        if ($questionContainer.length === 0) continue;

                        let year = "Unknown";
                        $questionContainer.find('.badge').each((idx, b) => {
                            const t = $ans(b).text();
                            const ym = t.match(/\d{4}/);
                            if (ym) year = ym[0];
                        });

                        if (year !== yearTarget.toString()) continue;

                        const $qDesc = $ans('.question-desc').first().clone();
                        $qDesc.find('a').remove();
                        $qDesc.find('.badge').remove();

                        const questionText = (await processContentWithImages($ans, $qDesc)).replace(/^(\s*<br>\s*)+/, '').trim();

                        const options = [];
                        $questionContainer.find('ul.list-unstyled li').each((idx, li) => {
                            let optText = $ans(li).text().trim();
                            optText = optText.replace(/^[A-E]\.\s*/, '');
                            options.push(optText);
                        });

                        const hash = getMD5(questionText, options);
                        if (existingHashes.has(hash)) {
                            process.stdout.write('s');
                            continue;
                        }

                        const correctAnsText = $ans('h5.text-success').text();
                        const correctMatch = correctAnsText.match(/Option ([A-E])/i);
                        const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;

                        const explanationHeader = $ans('h5:contains("Explanation")');
                        let explanation = "";
                        if (explanationHeader.length > 0) {
                            explanation = await processContentWithImages($ans, explanationHeader.next());
                        }

                        if (options.length > 0 && questionText.length > 10) {
                            // Enhancement: pedagogical rewrite
                            explanation = await rewriteExplanation(questionText, options, correctIndex, explanation, subjectName);

                            questions.push({
                                id: Date.now() + Math.floor(Math.random() * 100000),
                                text: questionText,
                                options,
                                correctOptionIndex: correctIndex,
                                explanation: explanation,
                                subject: subjectName,
                                examType: examTypeUpper,
                                year: year
                            });
                            existingHashes.add(hash);
                            process.stdout.write(`.`);
                        }
                        await sleep(200);
                    } catch (err) {
                        // Ignore errors on single questions
                    }
                }
            }
            console.log(`\n  P${page} done (${questions.length})`);
            page++;
            if (page > 50) break;
        } catch (err) {
            break;
        }
    }
    return questions;
}

async function main() {
    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    const years = ['2021', '2020', '2019', '2018', '2017', '2016', '2015'];

    let allQuestions = readFallbackData();
    const existingHashes = new Set(allQuestions.map(q => getMD5(q.text, q.options)));

    console.log(`Current questions: ${allQuestions.length}`);

    // Part 1: Improve existing short explanations
    console.log("Improving existing short explanations...");
    for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        if (!q.explanation || q.explanation.length < 150 || q.explanation.includes("Option") || q.explanation.includes("Hint:")) {
            if (!q.explanation?.includes("Simplified Method")) {
                console.log(`Rewriting explanation for ${q.subject} ${q.examType} ${q.year} (ID: ${q.id})`);
                q.explanation = await rewriteExplanation(q.text, q.options, q.correctOptionIndex, q.explanation, q.subject);
                // Save periodically
                if (i % 10 === 0) writeFallbackData(allQuestions);
            }
        }
    }
    writeFallbackData(allQuestions);

    // Part 2: Scrape new questions
    const prioritySubjects = ['mathematics', 'english-language', 'chemistry', 'physics', 'biology'];
    const otherSubjects = subjects.filter(s => !prioritySubjects.includes(s));
    const sortedSubjects = [...prioritySubjects, ...otherSubjects];

    for (const year of years) {
        for (const subject of sortedSubjects) {
            for (const exam of examTypes) {
                const subjectName = SUBJECT_MAP[subject];
                const existing = allQuestions.filter(q => q.subject === subjectName && q.examType === exam.toUpperCase() && q.year === year);
                const target = 100;

                if (existing.length >= target) {
                    continue;
                }

                // Check file size
                const stats = fs.statSync(FALLBACK_FILE);
                if (stats.size > 27.5 * 1024 * 1024) { // 27.5MB limit to be safe
                    console.log("Reached file size limit. Stopping.");
                    return;
                }

                const newQuestions = await scrapeQuestions(subject, exam, year, target - existing.length, existingHashes);
                allQuestions = allQuestions.concat(newQuestions);
                writeFallbackData(allQuestions);
                console.log(`Total: ${allQuestions.length} (${(fs.statSync(FALLBACK_FILE).size / 1024 / 1024).toFixed(2)} MB)`);
            }
        }
    }
    console.log("Finished all tasks.");
}

main();
