
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
const DATA_FILE = path.join(__dirname, 'fallbackData.ts');
const MAX_FILE_SIZE = 28 * 1024 * 1024; // 28MB

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "AIza_placeholder" });

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

/**
 * Generates an MD5 hash of the question text and options for deduplication.
 */
function getMd5(text, options) {
    const content = text + (options ? options.join('|') : '');
    return crypto.createHash('md5').update(content).digest('hex');
}

/**
 * Uses Gemini AI to improve an explanation.
 */
async function improveExplanation(question) {
    if (ai.apiKey === "AIza_placeholder") {
        return question.explanation;
    }

    const prompt = `
    Act as an expert teacher. Improve the following exam question explanation.
    The explanation should be complete, pedagogical, and include a 'Simplified Method' section.

    Question: ${question.text}
    Options: ${question.options.join(', ')}
    Correct Option Index: ${question.correctOptionIndex} (Option ${String.fromCharCode(65 + question.correctOptionIndex)})
    Current Explanation: ${question.explanation}

    Return ONLY the improved explanation text (can include HTML tags like <p>, <br>, <strong>).
    Ensure it contains a section titled 'Simplified Method:'.
    `;

    try {
        // Use the pattern found in fetchExamQuestions in geminiService.ts
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: prompt
        });
        const text = response.text ? response.text.trim() : "";
        return text || question.explanation;
    } catch (e) {
        console.error("Error improving explanation:", e);
        return question.explanation;
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function scrapeQuestions(subjectSlug, examType, targetYear, existingHashes, maxQuestions = 100) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    console.log(`Searching for: ${subjectName} (${examTypeUpper}) Year ${targetYear}`);

    while (questions.length < maxQuestions) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&page=${page}`;
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');

            if (questionItems.length === 0) break;

            for (let i = 0; i < questionItems.length; i++) {
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

                        if (year !== targetYear) continue;

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

                        const hash = getMd5(questionText, options);
                        if (existingHashes.has(hash)) continue;

                        const correctAnsText = $ans('h5.text-success').text();
                        const correctMatch = correctAnsText.match(/Option ([A-E])/i);
                        const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;

                        const explanationHeader = $ans('h5:contains("Explanation")');
                        let explanation = "";
                        if (explanationHeader.length > 0) {
                            explanation = await processContentWithImages($ans, explanationHeader.next());
                        }

                        if (options.length > 0 && questionText.length > 10) {
                            let qObj = {
                                id: Date.now() + Math.floor(Math.random() * 100000),
                                text: questionText,
                                options,
                                correctOptionIndex: correctIndex,
                                explanation: explanation,
                                subject: subjectName,
                                examType: examTypeUpper,
                                year: year
                            };

                            if (!explanation || explanation.length < 100 || !explanation.includes('Simplified Method')) {
                                qObj.explanation = await improveExplanation(qObj);
                            }

                            questions.push(qObj);
                            existingHashes.add(hash);
                            process.stdout.write(`.`);
                            if (questions.length >= maxQuestions) break;
                        }
                        await sleep(200);
                    } catch (err) {
                    }
                }
                if (questions.length >= maxQuestions) break;
            }
            console.log(`\n  P${page} checked`);
            page++;
            if (page > 50) break;
        } catch (err) {
            break;
        }
    }
    return questions;
}

function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    // More robust finding of the array: find the first '[' that is followed by a '{' on a new line or same line
    const arrayStartMatch = content.match(/=\s*\[\s*\{/);
    if (!arrayStartMatch) return [];
    const startIdx = arrayStartMatch.index + arrayStartMatch[0].indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (startIdx === -1 || endIdx === -1) return [];
    try {
        return JSON.parse(content.substring(startIdx, endIdx + 1));
    } catch (e) {
        console.error("Failed to parse data file", e);
        return [];
    }
}

function writeData(questions) {
    const header = `import { Question, Subject, ExamType } from '../types';

export interface FallbackQuestion extends Question {
  subject: Subject;
  examType: ExamType;
  year: string;
}

export const fallbackQuestions: FallbackQuestion[] =
`;
    const footer = `;\n`;
    const content = header + JSON.stringify(questions, null, 2) + footer;
    fs.writeFileSync(DATA_FILE, content);
}

async function main() {
    let allQuestions = readData();
    console.log(`Loaded ${allQuestions.length} existing questions.`);

    const existingHashes = new Set(allQuestions.map(q => getMd5(q.text, q.options)));

    // First, improve existing explanations if they are poor
    let improvedCount = 0;
    for (let i = 0; i < allQuestions.length; i++) {
        const q = allQuestions[i];
        if (!q.explanation || q.explanation.length < 100 || !q.explanation.includes('Simplified Method')) {
            console.log(`Improving explanation for existing question ${q.id} (${q.subject} ${q.year})...`);
            q.explanation = await improveExplanation(q);
            improvedCount++;
            if (improvedCount % 10 === 0) {
                writeData(allQuestions);
            }
            if (improvedCount >= 50) break;
        }
    }
    if (improvedCount > 0) {
        writeData(allQuestions);
        console.log(`Improved ${improvedCount} existing explanations.`);
    }

    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    const years = ['2021', '2020', '2019', '2018', '2017', '2016', '2015'];

    for (const year of years) {
        for (const exam of examTypes) {
            for (const subject of subjects) {
                if (fs.existsSync(DATA_FILE) && fs.statSync(DATA_FILE).size >= MAX_FILE_SIZE) {
                    console.log(`Reached max file size limit of 28MB. Stopping.`);
                    return;
                }

                const subjectName = SUBJECT_MAP[subject];
                const existing = allQuestions.filter(q => q.subject === subjectName && q.examType === exam.toUpperCase() && q.year === year);

                if (existing.length >= 100) {
                    continue;
                }

                const newQuestions = await scrapeQuestions(subject, exam, year, existingHashes, 100 - existing.length);
                if (newQuestions.length > 0) {
                    allQuestions = allQuestions.concat(newQuestions);
                    writeData(allQuestions);
                    console.log(`\nAdded ${newQuestions.length} questions for ${subjectName} ${exam.toUpperCase()} ${year}. Total: ${allQuestions.length}`);
                }
            }
        }
    }
    console.log("Finished.");
}

main();
