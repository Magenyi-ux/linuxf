
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://myschool.ng/classroom';
const JSON_DATA_FILE = path.join(__dirname, 'fallbackQuestions.json');
const TS_DATA_FILE = path.join(__dirname, 'fallbackData.ts');

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
    // Normalize text: remove tags, lowercase, remove non-alphanumeric
    const normalized = text.replace(/<[^>]*>?/gm, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return crypto.createHash('md5').update(normalized).digest('hex');
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

async function scrapeQuestionsForYear(subjectSlug, examType, year, targetCount = 100, existingHashes = new Set()) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    console.log(`\n  Targeting: ${subjectName} ${examTypeUpper} ${year} (Need ${targetCount})`);

    while (questions.length < targetCount) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&exam_year=${year}&page=${page}`;
        try {
            const response = await axios.get(url, { timeout: 10000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');

            if (questionItems.length === 0) break;

            let addedInThisPage = 0;
            for (let i = 0; i < questionItems.length && questions.length < targetCount; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');

                if (link) {
                    try {
                        const answerResponse = await axios.get(link, { timeout: 10000 });
                        const $ans = cheerio.load(answerResponse.data);
                        const $questionContainer = $ans('#page-content-section');

                        if ($questionContainer.length === 0) continue;

                        const $qDesc = $ans('.question-desc').first().clone();
                        $qDesc.find('a').remove();
                        $qDesc.find('.badge').remove();

                        const questionText = (await processContentWithImages($ans, $qDesc)).replace(/^(\s*<br>\s*)+/, '').trim();
                        const qHash = getQuestionHash(questionText);

                        if (existingHashes.has(qHash)) {
                            // Duplicate
                            continue;
                        }

                        const options = [];
                        $questionContainer.find('ul.list-unstyled li').each((idx, li) => {
                            let optText = $ans(li).text().trim();
                            optText = optText.replace(/^[A-E]\.\s*/, '');
                            options.push(optText);
                        });

                        const correctAnsText = $ans('h5.text-success').text();
                        const correctMatch = correctAnsText.match(/Option ([A-E])/i);
                        const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;

                        const explanationHeader = $ans('h5:contains("Explanation")');
                        let explanation = "";
                        if (explanationHeader.length > 0) {
                            explanation = await processContentWithImages($ans, explanationHeader.next());
                        }

                        if (options.length > 0 && questionText.length > 10) {
                            questions.push({
                                id: Date.now() + Math.floor(Math.random() * 100000),
                                text: questionText,
                                options,
                                correctOptionIndex: correctIndex,
                                explanation: explanation,
                                subject: subjectName,
                                examType: examTypeUpper,
                                year: year.toString()
                            });
                            existingHashes.add(qHash);
                            addedInThisPage++;
                            process.stdout.write(`.`);
                        }
                        await sleep(100);
                    } catch (err) {
                        // Ignore errors on single questions
                    }
                }
            }

            if (addedInThisPage === 0) break; // No new questions on this page

            console.log(` P${page} done (+${addedInThisPage})`);
            page++;
            if (page > 20) break;
        } catch (err) {
            console.error(`\nError fetching page ${page}: ${err.message}`);
            break;
        }
    }
    return questions;
}

function loadExistingQuestions() {
    if (fs.existsSync(JSON_DATA_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(JSON_DATA_FILE, 'utf8'));
        } catch (e) {
            console.error("Failed to parse JSON file:", e.message);
        }
    }

    if (fs.existsSync(TS_DATA_FILE)) {
        const content = fs.readFileSync(TS_DATA_FILE, 'utf8');
        const exportMatch = content.match(/export const fallbackQuestions: FallbackQuestion\[\] =\s*(\[[\s\S]*\]);/);
        if (exportMatch) {
            try {
                return JSON.parse(exportMatch[1]);
            } catch (e) {
                console.error("Failed to parse TS file content:", e.message);
            }
        }
    }
    return [];
}

function updateTSFile(questions) {
    const tsContent = `import { Question, Subject, ExamType } from '../types';

export interface FallbackQuestion extends Question {
  subject: Subject;
  examType: ExamType;
  year: string;
}

export const fallbackQuestions: FallbackQuestion[] =
${JSON.stringify(questions, null, 2)};
`;
    fs.writeFileSync(TS_DATA_FILE, tsContent);
    console.log(`\nUpdated ${TS_DATA_FILE} with ${questions.length} questions.`);
}

async function main() {
    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    const years = Array.from({ length: 45 }, (_, i) => (2024 - i).toString()); // 2024 down to 1980

    let allQuestions = loadExistingQuestions();
    const existingHashes = new Set(allQuestions.map(q => getQuestionHash(q.text)));

    console.log(`Loaded ${allQuestions.length} existing questions. (${existingHashes.size} unique hashes)`);

    let isFullyDone = true;

    for (const subjectSlug of subjects) {
        const subjectName = SUBJECT_MAP[subjectSlug];
        for (const exam of examTypes) {
            const examUpper = exam.toUpperCase();
            for (const year of years) {
                const count = allQuestions.filter(q => q.subject === subjectName && q.examType === examUpper && q.year === year).length;
                const target = 100;

                if (count >= target) {
                    continue;
                }

                isFullyDone = false;
                const newQuestions = await scrapeQuestionsForYear(subjectSlug, exam, year, target - count, existingHashes);
                if (newQuestions.length > 0) {
                    allQuestions = allQuestions.concat(newQuestions);
                    fs.writeFileSync(JSON_DATA_FILE, JSON.stringify(allQuestions, null, 2));
                    updateTSFile(allQuestions);
                    console.log(`\nTotal questions collected: ${allQuestions.length}`);
                }
            }
        }
    }

    if (isFullyDone) {
        console.log("done");
    } else {
        console.log("\nScraping session finished (partial). Run again to continue.");
    }
}

main();
