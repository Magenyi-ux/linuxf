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

let content = fs.readFileSync('services/fallbackData.ts', 'utf8');

// Use a regex to extract the WAEC part and replace NECO part
const waecMatch = content.match(/\[ExamType\.WAEC\]: (\{[\s\S]*?\}),?\s+\[ExamType\.NECO\]/);
if (waecMatch) {
    const waecData = waecMatch[1];
    content = content.replace(/\[ExamType\.NECO\]: \{[\s\S]*?\}(?=\s+\};)/, `[ExamType.NECO]: ${waecData}`);
    fs.writeFileSync('services/fallbackData.ts', content);
    console.log("NECO data mirrored from WAEC successfully.");
} else {
    console.error("Could not find WAEC data block.");
}
