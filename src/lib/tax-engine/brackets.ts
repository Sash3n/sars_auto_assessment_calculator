import type { TaxBracket } from "./tax-tables";

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

  const bracket = brackets.find(
    (b) => taxableIncome >= b.min && taxableIncome < b.max,
  );

  if (!bracket) {
    throw new Error(`No tax bracket found for income ${taxableIncome}`);
  }

  return bracket.base + bracket.rate * (taxableIncome - bracket.min);
}
