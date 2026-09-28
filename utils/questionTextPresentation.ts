/**
 * Removes non-question metadata prefixes from question text before display.
 * The underlying question-bank data is not modified.
 */
export function cleanQuestionText(value: string): string {
  let cleaned = value.trim();

  // Practice-bank metadata is for internal/source labeling only. Never show
  // labels such as "[Practice item 37]" or "[NECO 2024 practice variant]"
  // in the question presented to the learner.
  const metadataPrefix = /^\s*\[(?:Practice\s+item\s+\d+|(?:JAMB|WAEC|NECO)\s+\d{4}\s+practice\s+variant)\]\s*/i;

  while (metadataPrefix.test(cleaned)) {
    cleaned = cleaned.replace(metadataPrefix, "");
  }

  // Also handle legacy unbracketed prefixes.
  cleaned = cleaned.replace(/^\s*Practice\s+item\s+\d+\s*:\s*/i, "");
  cleaned = cleaned.replace(/^\s*For\s+20\d{2}\s+(?:JAMB|WAEC|NECO)\s+revision\s*,\s*/i, "");

  return cleaned.trim();
}
