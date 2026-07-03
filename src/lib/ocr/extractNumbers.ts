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
// The integer part is either grouped with thousands separators (11,978 /
// 4 200) or, since some real payslip printouts omit the separator
// entirely, one plain run of digits (6449) — either is accepted.
const AMOUNT_PATTERN = /R?\s?(?:\d{1,3}(?:[,\s]\d{3})+|\d+)\.\d{2}/g;

/**
 * Scans OCR'd payslip text for currency-shaped amounts, line by line, so a
 * user can see each candidate number next to the text it came from and
 * decide for themselves which field (if any) it belongs in.
 */
// A line needs at least this many letters to count as carrying its own
// label, rather than just the "R" in a currency amount.
const MIN_LABEL_LETTERS = 3;

// Bare table column headers that show up on their own OCR line and would
// otherwise wrongly overwrite the real item label as the fallback context.
const TABLE_HEADER_WORDS = new Set([
  "quantity",
  "rate",
  "balance",
  "amount",
  "year",
  "units",
  "unit",
]);

function isTableHeaderLine(line: string): boolean {
  const words = line
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  return words.length > 0 && words.every((word) => TABLE_HEADER_WORDS.has(word));
}

export function extractNumbersFromText(text: string): ExtractedNumber[] {
  const results: ExtractedNumber[] = [];
  let lastLabelLine = "";

  for (const line of text.split(/\r?\n/)) {
    const trimmedLine = line.trim();
    const letterCount = (trimmedLine.match(/[a-zA-Z]/g) ?? []).length;
    const hasOwnLabel = letterCount >= MIN_LABEL_LETTERS;

    // Bordered/tabular payslips can put a label and its amount so far apart
    // that OCR emits them as separate lines; fall back to the last labelled
    // line so the user still sees what the number belongs to.
    const context = hasOwnLabel
      ? trimmedLine
      : [lastLabelLine, trimmedLine].filter(Boolean).join(" ");

    const matches = trimmedLine.matchAll(AMOUNT_PATTERN);

    for (const match of matches) {
      const raw = match[0].trim();
      const cleaned = raw.replace(/^R\s?/, "").replace(/[,\s]/g, "");
      const value = Number(cleaned);

      if (Number.isFinite(value) && value > 0) {
        results.push({ raw, value, context });
      }
    }

    if (hasOwnLabel && !isTableHeaderLine(trimmedLine)) lastLabelLine = trimmedLine;
  }

  return results;
}
