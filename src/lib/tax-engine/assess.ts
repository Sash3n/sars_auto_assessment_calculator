import { calculateGrossTax } from "./brackets";
import { calculateRetirementDeduction, calculateTaxableInterest } from "./deductions";
import { calculateNetRentalIncome, type RentalProperty } from "./rental";
import { isLikelyProvisionalTaxpayer } from "./provisional-tax";
import { calculateMedicalCredit, calculateRebate } from "./rebates";
import { calculateAdditionalMedicalCredit } from "./medical";
import { calculateTaxableTravelReimbursement } from "./travel";
import { summarizePayslips, type MonthlyPayslip } from "./payslips";
import { TAX_YEAR_TABLES, DEFAULT_TAX_YEAR, type TaxYearTable } from "./tax-tables";

const DONATIONS_DEDUCTION_CAP = 0.1; // s18A: capped at 10% of taxable income

export type AssessmentInput = {
  taxYear?: string;
  age: number;
  payslips: MonthlyPayslip[];
  rentalProperties?: RentalProperty[];
  freelanceIncome?: number;
  interestIncome?: number;
  medicalSchemeMembers?: number;
  hasDisability?: boolean;
  /** Total annual medical scheme contributions, for the s6B additional credit */
  annualMedicalContributions?: number;
  /** Qualifying out-of-pocket medical expenses not covered by the scheme */
  outOfPocketMedicalExpenses?: number;
  /** Retirement contributions paid outside payroll (e.g. a personal RA top-up) */
  additionalRetirementContributions?: number;
  donations?: number;
  /** Business km reimbursed by an employer per km (not a fixed monthly allowance) */
  businessKmTravelled?: number;
  /** Rate per km the employer actually paid */
  travelReimbursementRatePerKm?: number;
  /** Manually entered SARS ITA34 tax payable, for the comparison view */
  sarsAssessedTaxPayable?: number;
};

export type AssessmentResult = {
  taxYear: string;
  income: {
    salary: number;
    rentalNet: number;
    freelance: number;
    taxableInterest: number;
    taxableTravelReimbursement: number;
    grossTotal: number;
  };
  deductions: {
    retirementDeductible: number;
    retirementExcess: number;
    donationsDeductible: number;
  };
  taxableIncome: number;
  grossTax: number;
  rebate: number;
  medicalCredit: number;
  additionalMedicalCredit: number;
  taxPayable: number;
  payeAlreadyPaid: number;
  /** Positive = amount owed to SARS, negative = refund due from SARS */
  balance: number;
  isLikelyProvisionalTaxpayer: boolean;
  rental: ReturnType<typeof calculateNetRentalIncome>;
  payslipSummary: ReturnType<typeof summarizePayslips>;
  sarsComparison: { sarsAssessedTaxPayable: number; difference: number } | null;
};

function resolveTaxYearTable(taxYear: string | undefined): TaxYearTable {
  const table = TAX_YEAR_TABLES[taxYear ?? DEFAULT_TAX_YEAR];
  if (!table) {
    throw new Error(`Unknown tax year: ${taxYear}`);
  }
  return table;
}

/**
 * Composes the individual tax-engine modules into a full SARS-style
 * assessment: gross income -> deductions -> taxable income -> tax payable
 * -> less PAYE already withheld -> refund due or amount owed.
 */
export function assessTax(input: AssessmentInput): AssessmentResult {
  const table = resolveTaxYearTable(input.taxYear);

  const payslipSummary = summarizePayslips(input.payslips);
  const rental = calculateNetRentalIncome(input.rentalProperties ?? []);
  const freelanceIncome = input.freelanceIncome ?? 0;
  const taxableInterest = calculateTaxableInterest(
    input.interestIncome ?? 0,
    input.age,
    table.interestExemption,
  );
  const taxableTravelReimbursement = calculateTaxableTravelReimbursement(
    input.businessKmTravelled ?? 0,
    input.travelReimbursementRatePerKm ?? 0,
    table.travelReimbursement,
  );

  const grossTotal =
    payslipSummary.totalGrossSalary +
    rental.netIncome +
    freelanceIncome +
    taxableInterest +
    taxableTravelReimbursement;

  const totalRetirementContributions =
    payslipSummary.totalRetirementContribution +
    (input.additionalRetirementContributions ?? 0);

  const { deductible: retirementDeductible, excess: retirementExcess } =
    calculateRetirementDeduction({
      contributions: totalRetirementContributions,
      incomeBase: Math.max(payslipSummary.totalGrossSalary, grossTotal),
      taxableIncomeBeforeDeduction: Math.max(grossTotal, 0),
      table: table.retirementDeduction,
    });

  const incomeAfterRetirement = grossTotal - retirementDeductible;
  const donations = input.donations ?? 0;
  const donationsDeductible = Math.min(
    donations,
    Math.max(incomeAfterRetirement, 0) * DONATIONS_DEDUCTION_CAP,
  );

  const taxableIncome = Math.max(incomeAfterRetirement - donationsDeductible, 0);

  const grossTax = calculateGrossTax(taxableIncome, table.brackets);
  const rebate = calculateRebate(input.age, table.rebates);
  const medicalCredit = calculateMedicalCredit(
    input.medicalSchemeMembers ?? 0,
    table.medicalCredit,
  );
  const additionalMedicalCredit = calculateAdditionalMedicalCredit({
    age: input.age,
    hasDisability: input.hasDisability ?? false,
    annualContributions: input.annualMedicalContributions ?? 0,
    annualMedicalCredit: medicalCredit,
    outOfPocketExpenses: input.outOfPocketMedicalExpenses ?? 0,
    taxableIncomeBeforeCredit: taxableIncome,
    table: table.additionalMedicalCredit,
  });

  const taxPayable = Math.max(
    grossTax - rebate - medicalCredit - additionalMedicalCredit,
    0,
  );
  const payeAlreadyPaid = payslipSummary.totalPayeDeducted;
  const balance = taxPayable - payeAlreadyPaid;

  const sarsComparison =
    input.sarsAssessedTaxPayable === undefined
      ? null
      : {
          sarsAssessedTaxPayable: input.sarsAssessedTaxPayable,
          difference: taxPayable - input.sarsAssessedTaxPayable,
        };

  return {
    taxYear: table.year,
    income: {
      salary: payslipSummary.totalGrossSalary,
      rentalNet: rental.netIncome,
      freelance: freelanceIncome,
      taxableInterest,
      taxableTravelReimbursement,
      grossTotal,
    },
    deductions: {
      retirementDeductible,
      retirementExcess,
      donationsDeductible,
    },
    taxableIncome,
    grossTax,
    rebate,
    medicalCredit,
    additionalMedicalCredit,
    taxPayable,
    payeAlreadyPaid,
    balance,
    isLikelyProvisionalTaxpayer: isLikelyProvisionalTaxpayer(
      {
        age: input.age,
        totalTaxableIncome: taxableIncome,
        nonRemunerationIncome: rental.netIncome + freelanceIncome,
        interestIncome: input.interestIncome ?? 0,
      },
      table,
    ),
    rental,
    payslipSummary,
    sarsComparison,
  };
}
