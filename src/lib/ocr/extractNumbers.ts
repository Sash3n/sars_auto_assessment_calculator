export type ExtractedNumber = {
  /** The matched text as it appeared in the OCR output */
  raw: string;
  /** Parsed numeric value */
  value: number;
  /** The full line the number was found on, for the user to judge what it is */
  context: string;
};

// Requires a 2-decimal-place suffix so we only pick up currency-shaped
// amounts, not page numbers, dates, or other stray integers in OCR text.
const AMOUNT_PATTERN = /R?\s?\d{1,3}(?:[,\s]\d{3})*\.\d{2}/g;

/**
 * Scans OCR'd payslip text for currency-shaped amounts, line by line, so a
 * user can see each candidate number next to the text it came from and
 * decide for themselves which field (if any) it belongs in.
 */
export function extractNumbersFromText(text: string): ExtractedNumber[] {
  const results: ExtractedNumber[] = [];

  for (const line of text.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    const matches = trimmedLine.matchAll(AMOUNT_PATTERN);

    for (const match of matches) {
      const raw = match[0].trim();
      const cleaned = raw.replace(/^R\s?/, "").replace(/[,\s]/g, "");
      const value = Number(cleaned);

      if (Number.isFinite(value) && value > 0) {
        results.push({ raw, value, context: trimmedLine });
      }
    }
  }

  return results;
}
