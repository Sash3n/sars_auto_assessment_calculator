import type { TaxYearTable } from "./tax-tables";

export type RetirementDeductionInput = {
  /** Total retirement fund contributions made in the tax year */
  contributions: number;
  /** The greater of remuneration or taxable income before this deduction */
  incomeBase: number;
  /** Taxable income before allowing this deduction */
  taxableIncomeBeforeDeduction: number;
  table: TaxYearTable["retirementDeduction"];
};

export type RetirementDeductionResult = {
  /** Amount deductible this tax year */
  deductible: number;
  /** Contributions above the cap, carried forward to future tax years */
  excess: number;
};

/**
 * SARS s11F retirement fund contribution deduction: the lesser of the
 * annual rand cap, 27.5% of the income base, or taxable income itself.
 */
export function calculateRetirementDeduction({
  contributions,
  incomeBase,
  taxableIncomeBeforeDeduction,
  table,
}: RetirementDeductionInput): RetirementDeductionResult {
  const cap = Math.min(
    table.annualCap,
    table.percentageOfIncome * incomeBase,
    taxableIncomeBeforeDeduction,
  );

  const deductible = Math.min(contributions, Math.max(cap, 0));
  const excess = contributions - deductible;

  return { deductible, excess };
}

/**
 * Applies the annual interest exemption (age-banded) to gross interest
 * income, returning the portion still subject to tax.
 */
export function calculateTaxableInterest(
  grossInterest: number,
  age: number,
  exemption: TaxYearTable["interestExemption"],
): number {
  const threshold = age >= 65 ? exemption.age65Plus : exemption.under65;
  return Math.max(grossInterest - threshold, 0);
}
