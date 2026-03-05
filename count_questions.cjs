const fs = require('fs');

const Subject = {
  PHYSICS: 'Physics',
  CHEMISTRY: 'Chemistry',
  BIOLOGY: 'Biology',
  MATHEMATICS: 'Mathematics',
  ENGLISH: 'English Language',
  ECONOMICS: 'Economics',
  GOVERNMENT: 'Government',
  COMMERCE: 'Commerce',
  LITERATURE: 'Literature',
  AGRIC_SCIENCE: 'Agricultural Science',
  GEOGRAPHY: 'Geography',
  FURTHER_MATHS: 'Further Mathematics'
};

const ExamType = { JAMB: 'JAMB', WAEC: 'WAEC', NECO: 'NECO' };

const fileContent = fs.readFileSync('services/fallbackData.ts', 'utf-8');

const idCountResults = {};
let currentExam = null;
let currentSubject = null;
let currentYear = null;

const lines = fileContent.split('\n');
for (let line of lines) {
    const examMatch = line.match(/\[ExamType\.(\w+)\]: \{/);
    if (examMatch) { currentExam = ExamType[examMatch[1]]; idCountResults[currentExam] = {}; continue; }

    const subjectMatch = line.match(/\[Subject\.(\w+)\]: \{/);
    if (subjectMatch) { currentSubject = Subject[subjectMatch[1]] || subjectMatch[1]; idCountResults[currentExam][currentSubject] = {}; continue; }

    const yearMatch = line.match(/"(\d{4})": \[/);
    if (yearMatch) { currentYear = yearMatch[1]; idCountResults[currentExam][currentSubject][currentYear] = 0; continue; }

    if (line.includes('"id":') && currentYear) {
        idCountResults[currentExam][currentSubject][currentYear]++;
    }
}

console.log(JSON.stringify(idCountResults, null, 2));
