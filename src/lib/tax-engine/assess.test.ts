import { describe, expect, it } from "vitest";
import { assessTax } from "./assess";
import type { MonthlyPayslip } from "./payslips";

function flatSalaryPayslips(annualGross: number, annualPaye = 0): MonthlyPayslip[] {
  return Array.from({ length: 12 }, () => ({
    grossSalary: annualGross / 12,
    payeDeducted: annualPaye / 12,
    uif: 0,
    retirementContribution: 0,
  }));
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

  it("never produces a negative taxable income or tax payable", () => {
    const result = assessTax({
      age: 35,
      payslips: flatSalaryPayslips(50_000),
      donations: 1_000_000,
    });

    expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
    expect(result.taxPayable).toBeGreaterThanOrEqual(0);
  });
});
