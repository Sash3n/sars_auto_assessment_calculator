import type { TaxYearTable } from "./tax-tables";

/**
 * Total annual rebate for a taxpayer of the given age, per SARS's
 * age-banded primary/secondary/tertiary rebate structure.
 */
export function calculateRebate(
  age: number,
  rebates: TaxYearTable["rebates"],
): number {
  if (age < 0) {
    throw new Error("Age cannot be negative");
  }

  let total = rebates.primary;
  if (age >= 65) total += rebates.secondary;
  if (age >= 75) total += rebates.tertiary;
  return total;
}

/**
 * Annual medical scheme fees tax credit: the first two covered members
 * (main member + first dependant) get the full monthly rate, every
 * additional dependant gets the lower rate.
 */
export function calculateMedicalCredit(
  memberCount: number,
  medicalCredit: TaxYearTable["medicalCredit"],
): number {
  if (memberCount <= 0) return 0;

  const fullRateMembers = Math.min(memberCount, 2);
  const additionalMembers = Math.max(memberCount - 2, 0);

  const monthlyCredit =
    fullRateMembers * medicalCredit.firstTwoMembers +
    additionalMembers * medicalCredit.additionalMember;

  return monthlyCredit * 12;
}
