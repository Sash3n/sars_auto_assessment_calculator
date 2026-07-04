import { describe, expect, it } from "vitest";
import { assessTax } from "./assess";
import type { PayslipLineItem } from "./payslips";

function flatSalaryPayslips(annualGross: number, annualPaye = 0): PayslipLineItem[] {
  const items: PayslipLineItem[] = [];
  for (let month = 0; month < 12; month++) {
    items.push({
      id: `${month}-basic_salary`,
      month,
      employer: "Employer",
      category: "basic_salary",
      amount: annualGross / 12,
    });
    if (annualPaye > 0) {
      items.push({
        id: `${month}-paye`,
        month,
        employer: "Employer",
        category: "paye",
        amount: annualPaye / 12,
      });
    }
  }
  return items;
}

describe("assessTax (2025/26 golden values)", () => {
  it("computes tax payable for a salary-only taxpayer with no PAYE withheld", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(500_000),
    });

    // Bracket 3: 77 362 + 31% * (500 000 - 370 500) = 117 507
    expect(result.taxableIncome).toBeCloseTo(500_000, 2);
    expect(result.grossTax).toBeCloseTo(117_507, 2);
    expect(result.rebate).toBe(17_235);
    expect(result.taxPayable).toBeCloseTo(100_272, 2);
    expect(result.balance).toBeCloseTo(100_272, 2); // owes SARS
    expect(result.payeAlreadyPaid).toBe(0);
  });

  it("returns a refund when PAYE withheld exceeds actual tax payable", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(500_000, 150_000),
    });

    expect(result.taxPayable).toBeCloseTo(100_272, 2);
    expect(result.balance).toBeCloseTo(100_272 - 150_000, 2);
    expect(result.balance).toBeLessThan(0); // refund due
  });

  it("splits interest exemption out as a distinct line item", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      interestIncome: 50_000, // under-65 exemption is R23 800
    });

    expect(result.income.grossIncome).toBeCloseTo(450_000, 2);
    expect(result.income.exemptions).toBeCloseTo(23_800, 2);
    expect(result.income.taxableInterest).toBeCloseTo(26_200, 2);
    expect(result.income.grossTotal).toBeCloseTo(426_200, 2);
  });

  it("nets rental income/loss into taxable income", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      rentalProperties: [
        { income: 120_000, expenses: 50_000, areaLetFraction: 1, monthsLetFraction: 1 },
      ],
    });

    expect(result.income.rentalNet).toBe(70_000);
    expect(result.taxableIncome).toBeCloseTo(470_000, 2);
  });

  it("caps the retirement deduction and carries the excess forward", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      additionalRetirementContributions: 150_000, // 27.5% of 400 000 = 110 000
    });

    expect(result.deductions.retirementDeductible).toBeCloseTo(110_000, 2);
    expect(result.deductions.retirementExcess).toBeCloseTo(40_000, 2);
    expect(result.taxableIncome).toBeCloseTo(290_000, 2);
  });

  it("flags a likely provisional taxpayer with rental income above the threshold", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      rentalProperties: [
        { income: 120_000, expenses: 20_000, areaLetFraction: 1, monthsLetFraction: 1 },
      ],
    });

    expect(result.isLikelyProvisionalTaxpayer).toBe(true);
  });

  it("produces a SARS comparison delta when an assessed figure is supplied", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(500_000),
      sarsAssessedTaxPayable: 95_000,
    });

    expect(result.sarsComparison).not.toBeNull();
    expect(result.sarsComparison?.difference).toBeCloseTo(100_272 - 95_000, 2);
  });

  it("has a null sarsCodeComparison when no SARS-assessed line items are supplied", () => {
    const result = assessTax({ age: 35, payslips: flatSalaryPayslips(500_000) });
    expect(result.sarsCodeComparison).toBeNull();
  });

  it("produces a code-by-code comparison when SARS-assessed line items are supplied", () => {
    const payslips: PayslipLineItem[] = [
      { id: "1", month: 0, employer: "Old Co", category: "basic_salary", sarsCode: "3601", amount: 47_365 },
    ];

    const result = assessTax({
      age: 35,
      payslips,
      sarsAssessedLineItems: [{ sarsCode: "3601", amount: 45_000 }],
    });

    expect(result.sarsCodeComparison).toEqual([
      { sarsCode: "3601", yourAmount: 47_365, sarsAmount: 45_000, difference: 2_365 },
    ]);
  });

  it("never produces a negative taxable income or tax payable", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(50_000),
      donations: 1_000_000,
    });

    expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    expect(result.taxPayable).toBeGreaterThanOrEqual(0);
  });

  it("adds the taxable excess of a reimbursive travel allowance to income", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      businessKmTravelled: 10_000,
      travelReimbursementRatePerKm: 6, // 1.24 above the 4.76 prescribed rate
    });

    expect(result.income.taxableTravelReimbursement).toBeCloseTo(12_400, 2);
    expect(result.taxableIncome).toBeCloseTo(412_400, 2);
  });

  it("subtracts the additional medical expenses credit from tax payable for age 65+", () => {
    const withCredit = assessTax({
      age: 70,
      payslips: flatSalaryPayslips(400_000),
      medicalSchemeMembers: 2,
      annualMedicalContributions: 40_000,
      outOfPocketMedicalExpenses: 10_000,
    });
    const withoutCredit = assessTax({
      age: 70,
      payslips: flatSalaryPayslips(400_000),
      medicalSchemeMembers: 2,
    });

    expect(withCredit.additionalMedicalCredit).toBeGreaterThan(0);
    expect(withCredit.taxPayable).toBeLessThan(withoutCredit.taxPayable);
  });

  it("deducts the apportioned home office expense from taxable income", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      homeOfficeAreaSqm: 15,
      totalHomeAreaSqm: 150,
      monthsHomeOfficeUsed: 12,
      totalHomeExpenses: 120_000,
    });

    // 15/150 * 12/12 * 120 000 = 12 000
    expect(result.deductions.homeOfficeDeductible).toBeCloseTo(12_000, 2);
    expect(result.taxableIncome).toBeCloseTo(388_000, 2);
    expect(result.hasHomeOfficeDeduction).toBe(true);
  });

  it("does not flag a home office deduction when none was entered", () => {
    const result = assessTax({ age: 35, payslips: flatSalaryPayslips(400_000) });
    expect(result.deductions.homeOfficeDeductible).toBe(0);
    expect(result.hasHomeOfficeDeduction).toBe(false);
  });

  it("adds the taxable portion of a property disposal capital gain to income", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      propertyDisposalProceeds: 1_000_000,
      propertyDisposalBaseCost: 600_000,
      isPrimaryResidenceDisposal: false,
    });

    // gain 400 000 - 40 000 annual exclusion = 360 000; * 40% = 144 000
    expect(result.income.taxableCapitalGain).toBeCloseTo(144_000, 2);
    expect(result.taxableIncome).toBeCloseTo(544_000, 2);
  });

  it("adds employer fringe benefits to income, and counts the retirement fringe benefit toward the s11F contribution base", () => {
    // Regression fixture reproducing a real SARS ITA34: employer pension
    // fund contribution (3817-style) is both taxable income AND a deemed
    // employee retirement contribution; general fringe benefits (3801-style)
    // are taxable but not a retirement contribution.
    const payslips: PayslipLineItem[] = [
      { id: "1", month: 0, employer: "Acme Ltd", category: "basic_salary", amount: 300_000 },
      {
        id: "2",
        month: 0,
        employer: "Acme Ltd",
        category: "employer_retirement_fringe_benefit",
        amount: 6_449,
      },
      {
        id: "3",
        month: 0,
        employer: "Acme Ltd",
        category: "general_fringe_benefit",
        amount: 367,
      },
    ];

    const result = assessTax({ age: 35, payslips });

    expect(result.income.grossIncome).toBeCloseTo(300_000 + 6_449 + 367, 2);
    expect(result.deductions.retirementDeductible).toBeCloseTo(6_449, 2);
  });

  it("excludes a primary residence disposal gain under the R2m exclusion", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(400_000),
      propertyDisposalProceeds: 2_500_000,
      propertyDisposalBaseCost: 500_000,
      isPrimaryResidenceDisposal: true,
    });

    expect(result.income.taxableCapitalGain).toBe(0);
    expect(result.taxableIncome).toBeCloseTo(400_000, 2);
  });
});
