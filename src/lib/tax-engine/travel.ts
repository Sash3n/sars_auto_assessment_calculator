import type { TaxYearTable } from "./tax-tables";

/**
 * Reimbursive travel allowance (s8(1)(a)(ii)): reimbursement for business
 * travel at or below SARS's prescribed rate per km is tax-free; only the
 * portion paid above that rate is taxable income.
 *
 * This covers the simple reimbursive case only. A fixed monthly travel
 * allowance claimed against a logbook uses a separate deemed-cost table
 * (based on vehicle value bands) that is out of scope here.
 */
export function calculateTaxableTravelReimbursement(
  businessKm: number,
  ratePerKmPaid: number,
  table: TaxYearTable["travelReimbursement"],
): number {
  if (businessKm < 0) {
    throw new Error("Business km cannot be negative");
  }

  const excessRate = Math.max(ratePerKmPaid - table.prescribedRatePerKm, 0);
  return businessKm * excessRate;
}
