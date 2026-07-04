import type { TaxYearTable } from "./tax-tables";

export type AdditionalMedicalCreditInput = {
  age: number;
  hasDisability: boolean;
  /** Total annual medical scheme contributions */
  annualContributions: number;
  /** The s6A medical scheme fees tax credit already computed for the year */
  annualMedicalCredit: number;
  /** Qualifying out-of-pocket medical expenses not covered by the scheme */
  outOfPocketExpenses: number;
  /** Taxable income before this credit is applied */
  taxableIncomeBeforeCredit: number;
  table: TaxYearTable["additionalMedicalCredit"];
};

/**
 * SARS's s6B Additional Medical Expenses Tax Credit. Taxpayers 65+ or with
 * a disability (or with a disabled spouse/child) use the simplified
 * formula with a lower contribution multiplier, a higher rate, and no
 * taxable-income floor; everyone else uses the standard formula.
 */
export function calculateAdditionalMedicalCredit({
  age,
  hasDisability,
  annualContributions,
  annualMedicalCredit,
  outOfPocketExpenses,
  taxableIncomeBeforeCredit,
  table,
}: AdditionalMedicalCreditInput): number {
  const usesSimplifiedFormula = age >= 65 || hasDisability;

  if (usesSimplifiedFormula) {
    const excessContributions = Math.max(
      annualContributions - table.contributionMultiplierSimplified * annualMedicalCredit,
      0,
    );
    return table.rateSimplified * (excessContributions + outOfPocketExpenses);
  }

  const excessContributions = Math.max(
    annualContributions - table.contributionMultiplierStandard * annualMedicalCredit,
    0,
  );
  const base =
    excessContributions +
    outOfPocketExpenses -
    table.taxableIncomeFloorPercentage * taxableIncomeBeforeCredit;

  return table.rateStandard * Math.max(base, 0);
}
