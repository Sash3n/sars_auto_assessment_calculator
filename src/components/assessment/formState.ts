import { assessTax, type AssessmentResult } from "@/lib/tax-engine/assess";
import type { MonthlyPayslip } from "@/lib/tax-engine/payslips";
import type { RentalProperty } from "@/lib/tax-engine/rental";
import { DEFAULT_TAX_YEAR } from "@/lib/tax-engine/tax-tables";
import { createEmptyPayslips } from "./PayslipStep";

export type FormState = {
  taxYear: string;
  age: number;
  medicalSchemeMembers: number;
  hasDisability: boolean;
  annualMedicalContributions: number;
  outOfPocketMedicalExpenses: number;
  additionalRetirementContributions: number;
  donations: number;
  businessKmTravelled: number;
  travelReimbursementRatePerKm: number;
  homeOfficeAreaSqm: number;
  totalHomeAreaSqm: number;
  monthsHomeOfficeUsed: number;
  totalHomeExpenses: number;
  propertyDisposalProceeds: number;
  propertyDisposalBaseCost: number;
  isPrimaryResidenceDisposal: boolean;
  sarsAssessedTaxPayable: number | undefined;
  payslips: MonthlyPayslip[];
  rentalProperties: RentalProperty[];
  freelanceIncome: number;
  interestIncome: number;
};

export function createInitialFormState(): FormState {
  return {
    taxYear: DEFAULT_TAX_YEAR,
    age: 0,
    medicalSchemeMembers: 0,
    hasDisability: false,
    annualMedicalContributions: 0,
    outOfPocketMedicalExpenses: 0,
    additionalRetirementContributions: 0,
    donations: 0,
    businessKmTravelled: 0,
    travelReimbursementRatePerKm: 0,
    homeOfficeAreaSqm: 0,
    totalHomeAreaSqm: 0,
    monthsHomeOfficeUsed: 0,
    totalHomeExpenses: 0,
    propertyDisposalProceeds: 0,
    propertyDisposalBaseCost: 0,
    isPrimaryResidenceDisposal: false,
    sarsAssessedTaxPayable: undefined,
    payslips: createEmptyPayslips(),
    rentalProperties: [],
    freelanceIncome: 0,
    interestIncome: 0,
  };
}

/** True once the user has entered enough data for a result to be meaningful. */
export function hasAssessmentData(form: FormState): boolean {
  return (
    form.payslips.some((p) => Object.values(p).some((v) => v > 0)) ||
    form.rentalProperties.length > 0 ||
    form.freelanceIncome > 0 ||
    form.interestIncome > 0
  );
}

export function computeAssessmentResult(form: FormState): AssessmentResult {
  return assessTax({
    taxYear: form.taxYear,
    age: form.age,
    payslips: form.payslips,
    rentalProperties: form.rentalProperties,
    freelanceIncome: form.freelanceIncome,
    interestIncome: form.interestIncome,
    medicalSchemeMembers: form.medicalSchemeMembers,
    hasDisability: form.hasDisability,
    annualMedicalContributions: form.annualMedicalContributions,
    outOfPocketMedicalExpenses: form.outOfPocketMedicalExpenses,
    additionalRetirementContributions: form.additionalRetirementContributions,
    donations: form.donations,
    businessKmTravelled: form.businessKmTravelled,
    travelReimbursementRatePerKm: form.travelReimbursementRatePerKm,
    homeOfficeAreaSqm: form.homeOfficeAreaSqm,
    totalHomeAreaSqm: form.totalHomeAreaSqm,
    monthsHomeOfficeUsed: form.monthsHomeOfficeUsed,
    totalHomeExpenses: form.totalHomeExpenses,
    propertyDisposalProceeds: form.propertyDisposalProceeds,
    propertyDisposalBaseCost: form.propertyDisposalBaseCost,
    isPrimaryResidenceDisposal: form.isPrimaryResidenceDisposal,
    sarsAssessedTaxPayable: form.sarsAssessedTaxPayable,
  });
}
