export type HomeOfficeDeductionInput = {
  /** Floor area of the dedicated home office, in square metres */
  officeAreaSqm: number;
  /** Total floor area of the home, in square metres */
  totalHomeAreaSqm: number;
  /** Number of months in the tax year the home office was used for work */
  monthsUsed: number;
  /** Total qualifying home running costs for the year (rent/bond interest, rates, utilities, cleaning) */
  totalHomeExpenses: number;
};

export type HomeOfficeDeductionResult = {
  deductible: number;
  businessUsePercentage: number;
};

/**
 * SARS's home office deduction: qualifying home running costs apportioned
 * by the office's share of the home's floor area, further apportioned by
 * the fraction of the year it was used for work. Does not itself verify
 * the "regularly and exclusively" / "mainly at home" eligibility tests -
 * callers should surface those as a separate advisory.
 */
export function calculateHomeOfficeDeduction({
  officeAreaSqm,
  totalHomeAreaSqm,
  monthsUsed,
  totalHomeExpenses,
}: HomeOfficeDeductionInput): HomeOfficeDeductionResult {
  if (totalHomeAreaSqm <= 0) {
    return { deductible: 0, businessUsePercentage: 0 };
  }

  const areaFraction = Math.min(officeAreaSqm / totalHomeAreaSqm, 1);
  const monthsFraction = Math.min(Math.max(monthsUsed, 0), 12) / 12;
  const businessUsePercentage = areaFraction * monthsFraction;

  return {
    deductible: totalHomeExpenses * businessUsePercentage,
    businessUsePercentage,
  };
}
