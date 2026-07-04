import type { TaxBracket } from "./tax-tables";

/**
 * Finds the index of the bracket that `taxableIncome` falls into, or -1 if
 * none match (only possible with a malformed/incomplete bracket table).
 */
export function findBracketIndex(taxableIncome: number, brackets: TaxBracket[]): number {
  return brackets.findIndex((b) => taxableIncome >= b.min && taxableIncome < b.max);
}

/**
 * Computes gross (pre-rebate) tax payable on taxable income using SARS's
 * progressive bracket table: base + rate * (income - bracket.min).
 */
export function calculateGrossTax(
  taxableIncome: number,
  brackets: TaxBracket[],
): number {
  if (taxableIncome < 0) {
    throw new Error("Taxable income cannot be negative");
  }

  const bracketIndex = findBracketIndex(taxableIncome, brackets);
  const bracket = brackets[bracketIndex];

  if (!bracket) {
    throw new Error(`No tax bracket found for income ${taxableIncome}`);
  }

  return bracket.base + bracket.rate * (taxableIncome - bracket.min);
}
