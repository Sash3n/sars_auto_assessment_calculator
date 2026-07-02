import { describe, expect, it } from "vitest";
import { calculateHomeOfficeDeduction } from "./homeOffice";

describe("calculateHomeOfficeDeduction", () => {
  it("apportions expenses by area used for a full year", () => {
    // 15sqm office / 150sqm home = 10%, used all 12 months
    const result = calculateHomeOfficeDeduction({
      officeAreaSqm: 15,
      totalHomeAreaSqm: 150,
      monthsUsed: 12,
      totalHomeExpenses: 120_000,
    });
    expect(result.deductible).toBeCloseTo(12_000, 2);
    expect(result.businessUsePercentage).toBeCloseTo(0.1, 4);
  });

  it("further apportions by the fraction of the year the office was used", () => {
    const result = calculateHomeOfficeDeduction({
      officeAreaSqm: 15,
      totalHomeAreaSqm: 150,
      monthsUsed: 6,
      totalHomeExpenses: 120_000,
    });
    expect(result.deductible).toBeCloseTo(6_000, 2);
  });

  it("returns 0 when the total home area is 0 (avoids divide by zero)", () => {
    const result = calculateHomeOfficeDeduction({
      officeAreaSqm: 15,
      totalHomeAreaSqm: 0,
      monthsUsed: 12,
      totalHomeExpenses: 120_000,
    });
    expect(result.deductible).toBe(0);
    expect(result.businessUsePercentage).toBe(0);
  });

  it("returns 0 when no months are used", () => {
    const result = calculateHomeOfficeDeduction({
      officeAreaSqm: 15,
      totalHomeAreaSqm: 150,
      monthsUsed: 0,
      totalHomeExpenses: 120_000,
    });
    expect(result.deductible).toBe(0);
  });

  it("never deducts more than the total home expenses supplied", () => {
    const result = calculateHomeOfficeDeduction({
      officeAreaSqm: 150,
      totalHomeAreaSqm: 100, // office larger than home - malformed input
      monthsUsed: 12,
      totalHomeExpenses: 50_000,
    });
    expect(result.deductible).toBeLessThanOrEqual(50_000);
  });
});
