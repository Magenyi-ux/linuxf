const fs = require('fs');

let content = fs.readFileSync('services/fallbackData.ts', 'utf8');

const waecStart = content.indexOf('[ExamType.WAEC]: {');
const necoStart = content.indexOf('[ExamType.NECO]: {');

if (waecStart !== -1 && necoStart !== -1) {
    // Find the matching closing brace for WAEC
    let openBraces = 0;
    let waecEnd = -1;
    for (let i = waecStart + '[ExamType.WAEC]: '.length; i < content.length; i++) {
        if (content[i] === '{') openBraces++;
        if (content[i] === '}') openBraces--;
        if (openBraces === 0) {
            waecEnd = i + 1;
            break;
        }
    }

    if (waecEnd !== -1) {
        const waecData = content.substring(waecStart + '[ExamType.WAEC]: '.length, waecEnd);

        // Find the end of the whole object
        const lastBrace = content.lastIndexOf('};');
        const necoBlock = `  [ExamType.NECO]: ${waecData}`;

        content = content.substring(0, necoStart) + necoBlock + content.substring(lastBrace);
        fs.writeFileSync('services/fallbackData.ts', content);
        console.log("NECO data mirrored properly.");
    }
}
