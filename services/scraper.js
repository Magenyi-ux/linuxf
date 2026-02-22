
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://myschool.ng/classroom';
const FALLBACK_DATA_FILE = path.join(__dirname, 'fallbackData.ts');

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

function getHash(text, options) {
    const content = text + (options ? options.join('|') : '');
    return crypto.createHash('md5').update(content).digest('hex');
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

async function scrapeQuestions(subjectSlug, examType, year, targetCount = 100, existingHashes = new Set()) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    console.log(`Scraping: ${subjectName} (${examTypeUpper}) ${year}`);

    while (questions.length < targetCount) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&exam_year=${year}&page=${page}`;
        try {
            const response = await axios.get(url, { timeout: 15000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');

            if (questionItems.length === 0) break;

            for (let i = 0; i < questionItems.length && questions.length < targetCount; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');

                if (link) {
                    try {
                        const answerResponse = await axios.get(link, { timeout: 15000 });
                        const $ans = cheerio.load(answerResponse.data);
                        const $questionContainer = $ans('#page-content-section');

                        if ($questionContainer.length === 0) continue;

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

                        const hash = getHash(questionText, options);
                        if (existingHashes.has(hash)) {
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
                            const newQuestion = {
                                id: Date.now() + Math.floor(Math.random() * 100000),
                                text: questionText,
                                options,
                                correctOptionIndex: correctIndex,
                                explanation: explanation,
                                subject: subjectName,
                                examType: examTypeUpper,
                                year: year.toString()
                            };
                            questions.push(newQuestion);
                            existingHashes.add(hash);
                            process.stdout.write(`.`);
                        }
                        await sleep(100);
                    } catch (err) {
                        // Ignore
                    }
                }
            }
            console.log(`\n  Page ${page} done (${questions.length} new)`);
            page++;
            if (page > 20) break; // Safety break
        } catch (err) {
            console.error(`Error on page ${page}: ${err.message}`);
            break;
        }
    }
    return questions;
}

function loadExistingQuestions() {
    if (!fs.existsSync(FALLBACK_DATA_FILE)) return [];
    const content = fs.readFileSync(FALLBACK_DATA_FILE, 'utf8');
    const match = content.match(/=\s*\[/);
    if (!match) return [];
    const startIdx = match.index + match[0].indexOf('[');
    const endIdx = content.lastIndexOf(']');
    if (endIdx === -1) return [];

    const jsonStr = content.substring(startIdx, endIdx + 1);
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse existing fallbackData.ts");
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

export const fallbackQuestions: FallbackQuestion[] = `;

    const footer = `;\n`;
    const content = header + JSON.stringify(questions, null, 2) + footer;
    fs.writeFileSync(FALLBACK_DATA_FILE, content);
}

async function main() {
    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];

    let allQuestions = loadExistingQuestions();
    console.log(`Loaded ${allQuestions.length} existing questions.`);

    const existingHashes = new Set(allQuestions.map(q => getHash(q.text, q.options)));

    // Prioritize subjects with fewer questions
    const subjectStats = subjects.map(slug => {
        const name = SUBJECT_MAP[slug];
        const count = allQuestions.filter(q => q.subject === name).length;
        return { slug, name, count };
    }).sort((a, b) => a.count - b.count);

    for (const { slug: subjectSlug, name: subjectName } of subjectStats) {
        for (const exam of examTypes) {
            const examTypeUpper = exam.toUpperCase();
            for (const year of years) {
                const count = allQuestions.filter(q => q.subject === subjectName && q.examType === examTypeUpper && q.year === year).length;

                if (count >= 100) {
                    console.log(`${subjectName} ${examTypeUpper} ${year}: done`);
                    continue;
                }

                const newQuestions = await scrapeQuestions(subjectSlug, exam, year, 100 - count, existingHashes);
                if (newQuestions.length > 0) {
                    allQuestions = allQuestions.concat(newQuestions);
                    saveQuestions(allQuestions);
                    console.log(`Saved. Total questions: ${allQuestions.length}`);
                } else {
                    console.log(`No more questions found for ${subjectName} ${examTypeUpper} ${year}.`);
                }
            }
        }
    }
    console.log("Scraping finished.");
}

main();
