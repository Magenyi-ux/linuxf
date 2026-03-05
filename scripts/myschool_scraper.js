
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const SUBJECT_MAPPING = {
    'Mathematics': 'mathematics',
    'English Language': 'english-language',
    'Physics': 'physics',
    'Chemistry': 'chemistry',
    'Biology': 'biology',
    'Further Mathematics': 'further-mathematics',
    'Agricultural Science': 'agricultural-science',
    'Geography': 'geography',
    'Economics': 'economics',
    'Commerce': 'commerce',
    'Government': 'government',
    'Literature in English': 'literature-in-english',
    'History': 'history',
    'Civic Education': 'civic-education',
    'CRS': 'christian-religious-knowledge-crk',
    'IRS': 'islamic-religious-knowledge-irk',
    'French': 'french',
    'Arabic': 'arabic'
};

const EXAM_TYPE_MAPPING = {
    'JAMB': 'jamb',
    'WAEC': 'waec',
    'NECO': 'neco'
};

const FALLBACK_DATA_PATH = path.resolve('services/fallbackData.ts');

function getQuestionHash(q) {
    const content = (q.text + q.options.join('|')).toLowerCase().replace(/\s+/g, '');
    return crypto.createHash('md5').update(content).digest('hex');
}

async function getAnswerAndExplanation(detailUrl) {
    try {
        const response = await axios.get(detailUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(response.data);
        const answerText = $('body').text().match(/Correct Answer: Option ([A-D])/);
        const correctOptionIndex = answerText ? (answerText[1].charCodeAt(0) - 65) : 0;

        let explanation = $('.explanation').text().trim() || "Detailed explanation available on myschool.ng";
        if (explanation.length < 10) {
            const bodyText = $('body').text();
            const expMatch = bodyText.match(/Explanation\s+([\s\S]*?)\s+Next/);
            if (expMatch) explanation = expMatch[1].trim();
        }

        return { correctOptionIndex, explanation };
    } catch (e) {
        return { correctOptionIndex: 0, explanation: "Source: myschool.ng" };
    }
}

async function scrapeQuestions(subject, examType, year, existingHashes, targetCount = 60) {
    const urlSubject = SUBJECT_MAPPING[subject];
    const urlExam = EXAM_TYPE_MAPPING[examType];

    if (!urlSubject || !urlExam) return [];

    console.log(`Scraping ${examType} ${subject} ${year}...`);
    const questions = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && questions.length < targetCount) {
        try {
            const url = `https://myschool.ng/classroom/${urlSubject}?exam_type=${urlExam}&exam_year=${year}&page=${page}`;
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 15000
            });
            const $ = cheerio.load(response.data);

            const questionItems = $('.question-item');
            if (questionItems.length === 0) {
                hasMore = false;
                break;
            }

            for (let i = 0; i < questionItems.length; i++) {
                const el = questionItems[i];
                const desc = $(el).find('.question-desc');
                const text = desc.text().trim();

                const options = [];
                const optionsList = $(el).find('ul.list-unstyled li');

                optionsList.each((j, li) => {
                    let optText = $(li).text().trim();
                    optText = optText.replace(/^[A-D]\.\s*/, '').replace(/\s+/g, ' ').trim();
                    options.push(optText);
                });

                const detailLink = $(el).find('a').filter((i, a) => $(a).text().includes('View Answer')).attr('href');

                // Improved Image detection
                let imageUrl = desc.find('img').attr('src');
                if (imageUrl && (imageUrl.includes('storage/serve') || imageUrl.includes('ads'))) {
                    imageUrl = null;
                }
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = 'https://myschool.ng' + imageUrl;
                }

                if (text && options.length === 4 && detailLink) {
                    const tempQ = { text, options };
                    const hash = getQuestionHash(tempQ);

                    if (!existingHashes.has(hash)) {
                        const { correctOptionIndex, explanation } = await getAnswerAndExplanation(detailLink);

                        questions.push({
                            id: Date.now() + Math.floor(Math.random() * 1000000),
                            text,
                            options,
                            correctOptionIndex,
                            explanation: explanation + " Simplified Method: Focused preparation leads to success. Review " + subject + " fundamentals.",
                            imageUrl: imageUrl || undefined
                        });
                        existingHashes.add(hash);
                        process.stdout.write(imageUrl ? 'I' : '.');
                    }
                }
                if (questions.length >= targetCount) break;
            }

            console.log(`\nPage ${page} complete. Total: ${questions.length}`);
            page++;
            if (page > 15) hasMore = false;
            await new Promise(r => setTimeout(r, 200));
        } catch (error) {
            console.error(`\nError page ${page}:`, error.message);
            hasMore = false;
        }
    }
    return questions;
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

async function main() {
    const EXAMS = ['JAMB', 'WAEC'];
    const SCIENCE_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Further Mathematics', 'Agricultural Science', 'Geography'];
    const YEARS = ['2023', '2022', '2021'];

    const currentData = { JAMB: {}, WAEC: {}, NECO: {} };
    const existingHashes = new Set();

    for (const subject of SCIENCE_SUBJECTS) {
        for (const exam of EXAMS) {
            for (const year of YEARS) {
                const questions = await scrapeQuestions(subject, exam, year, existingHashes, 60);
                if (!currentData[exam][subject]) currentData[exam][subject] = {};
                currentData[exam][subject][year] = questions;
            }
            saveData(currentData);
        }
    }

    // Mirror NECO from WAEC
    currentData.NECO = JSON.parse(JSON.stringify(currentData.WAEC));
    saveData(currentData);

    console.log("\nScraping complete!");
}

main();
