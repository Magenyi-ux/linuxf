/**
 * Removes non-question metadata prefixes from question text before display.
 * The underlying question-bank data is not modified.
 */
export function cleanQuestionText(value: string): string {
  let cleaned = value.trim();

  // Remove one or more bracketed metadata labels at the beginning, e.g.
  // [Practice item 10] [JAMB 2026 practice variant]
  while (/^\s*\[[^\]]+\]\s*/.test(cleaned)) {
    cleaned = cleaned.replace(/^\s*\[[^\]]+\]\s*/, "");
  }

  // Also handle legacy unbracketed prefixes.
  cleaned = cleaned.replace(/^\s*Practice\s+item\s+\d+\s*:\s*/i, "");
  cleaned = cleaned.replace(/^\s*For\s+20\d{2}\s+(?:JAMB|WAEC|NECO)\s+revision\s*,\s*/i, "");

  return cleaned.trim();
}
