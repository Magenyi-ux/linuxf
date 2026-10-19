/**
 * Removes source metadata from question text before display.
 * The underlying question-bank data is not modified.
 */
export function cleanQuestionText(value: string): string {
  return value
    .trim()
    .replace(/&#91;/gi, "[")
    .replace(/&#93;/gi, "]")
    .replace(/&amp;/gi, "&")
    // Labels may occur at either end of older question-bank entries.
    .replace(/\[(?:Practice\s+item\s+\d+|(?:JAMB|WAEC|NECO)\s+\d{4}\s+practice\s+variant)\]/gi, " ")
    .replace(/^\s*Practice\s+item\s+\d+\s*:\s*/i, "")
    .replace(/^\s*For\s+20\d{2}\s+(?:JAMB|WAEC|NECO)\s+revision\s*,\s*/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
