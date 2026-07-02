import type { TaxYearTable } from "./tax-tables";

export type ProvisionalTaxInput = {
  age: number;
  totalTaxableIncome: number;
  /** Rental, freelance/business or other non-remuneration income (excludes interest) */
  nonRemunerationIncome: number;
  /** Gross interest income, before the interest exemption is applied */
  interestIncome: number;
};

/**
 * Advisory-only heuristic for whether the user's income mix suggests they
 * are a provisional taxpayer (SARS's actual determination depends on
 * further facts). Anyone whose taxable income falls under the tax
 * threshold, or whose only non-salary income is exempt interest, is not a
 * provisional taxpayer.
 */
export function isLikelyProvisionalTaxpayer(
  input: ProvisionalTaxInput,
  table: TaxYearTable,
): boolean {
  const threshold =
    input.age >= 75
      ? table.taxThresholds.age75Plus
      : input.age >= 65
        ? table.taxThresholds.age65to74
        : table.taxThresholds.under65;

  if (input.totalTaxableIncome < threshold) {
    return false;
  }

  if (input.nonRemunerationIncome > 0) {
    return true;
  }

  const interestExemption =
    input.age >= 65 ? table.interestExemption.age65Plus : table.interestExemption.under65;

  return input.interestIncome > interestExemption;
}
