import { describe, expect, it } from "vitest";
import {
  calculateRetirementDeduction,
  calculateTaxableInterest,
} from "./deductions";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateRetirementDeduction (2025/26)", () => {
  const table = TAX_YEAR_2025_26.retirementDeduction;

  it("allows the full contribution when under both caps", () => {
    const result = calculateRetirementDeduction({
      contributions: 50_000,
      incomeBase: 400_000,
      taxableIncomeBeforeDeduction: 400_000,
      table,
    });
    expect(result.deductible).toBe(50_000);
    expect(result.excess).toBe(0);
  });

  it("caps the deduction at 27.5% of income base and carries the rest forward", () => {
    const result = calculateRetirementDeduction({
      contributions: 150_000,
      incomeBase: 400_000, // 27.5% -> 110 000
      taxableIncomeBeforeDeduction: 400_000,
      table,
    });
    expect(result.deductible).toBeCloseTo(110_000, 6);
    expect(result.excess).toBeCloseTo(40_000, 6);
  });

  it("caps the deduction at the annual rand cap when 27.5% exceeds it", () => {
    const result = calculateRetirementDeduction({
      contributions: 400_000,
      incomeBase: 2_000_000, // 27.5% -> 550 000, above the 350 000 cap
      taxableIncomeBeforeDeduction: 2_000_000,
      table,
    });
    expect(result.deductible).toBe(350_000);
    expect(result.excess).toBe(50_000);
  });

  it("never deducts more than taxable income before the deduction", () => {
    const result = calculateRetirementDeduction({
      contributions: 100_000,
      incomeBase: 400_000,
      taxableIncomeBeforeDeduction: 60_000,
      table,
    });
    expect(result.deductible).toBe(60_000);
    expect(result.excess).toBe(40_000);
  });
});

describe("calculateTaxableInterest (2025/26)", () => {
  const exemption = TAX_YEAR_2025_26.interestExemption;

  it("exempts interest below the under-65 threshold", () => {
    expect(calculateTaxableInterest(20_000, 40, exemption)).toBe(0);
  });

  it("taxes only interest above the under-65 threshold", () => {
    expect(calculateTaxableInterest(30_000, 40, exemption)).toBe(
      30_000 - 23_800,
    );
  });

  it("uses the higher over-65 exemption threshold", () => {
    expect(calculateTaxableInterest(30_000, 70, exemption)).toBe(0);
  });
});
