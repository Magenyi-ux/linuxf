import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://myschool.ng/classroom';
const DATA_FILE = path.join(__dirname, '..', 'services', 'fallbackData.json');
const TS_FILE = path.join(__dirname, '..', 'services', 'fallbackData.ts');

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

async function imageToBase64(url) {
    if (!url) return null;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
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

async function scrapeQuestions(subjectSlug, examType, maxQuestions = 100) {
    let questions = [];
    let page = 1;
    const examTypeUpper = examType.toUpperCase();
    const subjectName = SUBJECT_MAP[subjectSlug] || subjectSlug;

    console.log(`Starting: ${subjectName} (${examTypeUpper})`);

    while (questions.length < maxQuestions) {
        const url = `${BASE_URL}/${subjectSlug}?exam_type=${examType.toLowerCase()}&page=${page}`;
        try {
            const response = await axios.get(url, { timeout: 15000 });
            const $ = cheerio.load(response.data);
            const questionItems = $('.question-item');

            if (questionItems.length === 0) break;

            for (let i = 0; i < questionItems.length && questions.length < maxQuestions; i++) {
                const item = $(questionItems[i]);
                const link = item.find('a[href*="/classroom/"]').attr('href');

                if (link) {
                    try {
                        const answerResponse = await axios.get(link, { timeout: 15000 });
                        const $ans = cheerio.load(answerResponse.data);
                        const $questionContainer = $ans('#page-content-section');

                        if ($questionContainer.length === 0) continue;

                        let year = "Unknown";
                        $questionContainer.find('.badge').each((idx, b) => {
                            const t = $ans(b).text();
                            const ym = t.match(/\d{4}/);
                            if (ym) year = ym[0];
                        });

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

                        const correctAnsText = $ans('h5.text-success').text();
                        const correctMatch = correctAnsText.match(/Option ([A-E])/i);
                        const correctIndex = correctMatch ? correctMatch[1].toUpperCase().charCodeAt(0) - 65 : 0;

                        const explanationHeader = $ans('h5:contains("Explanation")');
                        let explanation = "";
                        if (explanationHeader.length > 0) {
                            explanation = await processContentWithImages($ans, explanationHeader.next());
                        }

                        if (options.length > 0 && questionText.length > 5) {
                            questions.push({
                                id: Date.now() + Math.floor(Math.random() * 1000000),
                                text: questionText,
                                options,
                                correctOptionIndex: correctIndex,
                                explanation: explanation,
                                subject: subjectName,
                                examType: examTypeUpper,
                                year: year
                            });
                            process.stdout.write(`.`);
                        }
                        await sleep(300);
                    } catch (err) {
                        process.stdout.write(`x`);
                    }
                }
            }
            console.log(`\n  P${page} done (${questions.length})`);
            page++;
            if (page > 50) break;
        } catch (err) {
            console.error(`\n Error on page ${page}: ${err.message}`);
            break;
        }
    }
    return questions;
}

async function main() {
    const subjects = Object.keys(SUBJECT_MAP);
    const examTypes = ['jamb', 'waec', 'neco'];
    let allQuestions = [];

    if (fs.existsSync(DATA_FILE)) {
        try {
            allQuestions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log(`Loaded ${allQuestions.length} existing questions.`);
        } catch (e) {
            console.error("Error loading existing JSON", e);
        }
    }

    for (const subject of subjects) {
        for (const exam of examTypes) {
            const subjectName = SUBJECT_MAP[subject];
            const existing = allQuestions.filter(q => q.subject === subjectName && q.examType === exam.toUpperCase());
            const target = 150; // Increased target

            if (existing.length >= target) {
                console.log(`Skipping ${subjectName} ${exam.toUpperCase()} (${existing.length})`);
                continue;
            }

            const questions = await scrapeQuestions(subject, exam, target - existing.length);
            allQuestions = allQuestions.concat(questions);

            // Save JSON
            fs.writeFileSync(DATA_FILE, JSON.stringify(allQuestions, null, 2));

            // Generate TS file for bundling
            const tsContent = `import { Question, Subject, ExamType } from '../types';

export interface FallbackQuestion extends Question {
  subject: Subject;
  examType: ExamType;
  year: string;
}

export const fallbackQuestions: FallbackQuestion[] = ` + JSON.stringify(allQuestions, null, 2) + `;
`;
            fs.writeFileSync(TS_FILE, tsContent);
            console.log(`Total: ${allQuestions.length}`);
        }
    }
    console.log("Finished all subjects.");
}

main();
