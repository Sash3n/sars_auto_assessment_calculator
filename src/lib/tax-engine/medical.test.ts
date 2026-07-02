import { describe, expect, it } from "vitest";
import { calculateAdditionalMedicalCredit } from "./medical";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateAdditionalMedicalCredit (2025/26)", () => {
  const table = TAX_YEAR_2025_26.additionalMedicalCredit;
  const annualMedicalCredit = 8_736; // 2 members at R364/month for a year

  it("returns 0 when the standard-formula base is fully absorbed by the taxable-income floor", () => {
    const result = calculateAdditionalMedicalCredit({
      age: 40,
      hasDisability: false,
      annualContributions: 40_000,
      annualMedicalCredit,
      outOfPocketExpenses: 10_000,
      taxableIncomeBeforeCredit: 400_000,
      table,
    });
    expect(result).toBe(0);
  });

  it("applies the 25% standard formula with the 7.5%-of-income floor for under-65, no disability", () => {
    // excess contributions = 40 000 - 4*8 736 = 5 056
    // base = 5 056 + 10 000 - 7.5% * 100 000 (7 500) = 7 556
    const result = calculateAdditionalMedicalCredit({
      age: 40,
      hasDisability: false,
      annualContributions: 40_000,
      annualMedicalCredit,
      outOfPocketExpenses: 10_000,
      taxableIncomeBeforeCredit: 100_000,
      table,
    });
    expect(result).toBeCloseTo(0.25 * 7_556, 2);
  });

  it("applies the simplified 33.3% formula with no income floor for age 65+", () => {
    // excess contributions = 40 000 - 3*8 736 = 13 792
    const result = calculateAdditionalMedicalCredit({
      age: 70,
      hasDisability: false,
      annualContributions: 40_000,
      annualMedicalCredit,
      outOfPocketExpenses: 10_000,
      taxableIncomeBeforeCredit: 100_000,
      table,
    });
    expect(result).toBeCloseTo((1 / 3) * (13_792 + 10_000), 2);
  });

  it("applies the simplified 33.3% formula for a taxpayer with a disability regardless of age", () => {
    const under65Disabled = calculateAdditionalMedicalCredit({
      age: 30,
      hasDisability: true,
      annualContributions: 40_000,
      annualMedicalCredit,
      outOfPocketExpenses: 10_000,
      taxableIncomeBeforeCredit: 100_000,
      table,
    });
    expect(under65Disabled).toBeCloseTo((1 / 3) * (13_792 + 10_000), 2);
  });

  it("never returns a negative credit", () => {
    const result = calculateAdditionalMedicalCredit({
      age: 40,
      hasDisability: false,
      annualContributions: 0,
      annualMedicalCredit: 0,
      outOfPocketExpenses: 0,
      taxableIncomeBeforeCredit: 500_000,
      table,
    });
    expect(result).toBe(0);
  });
});
