import { describe, expect, it } from "vitest";
import { calculateRebate, calculateMedicalCredit } from "./rebates";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateRebate (2025/26)", () => {
  const rebates = TAX_YEAR_2025_26.rebates;

  it("applies only the primary rebate under 65", () => {
    expect(calculateRebate(40, rebates)).toBe(17_235);
  });

  it("applies primary + secondary rebate from age 65", () => {
    expect(calculateRebate(65, rebates)).toBe(17_235 + 9_444);
  });

  it("applies primary + secondary + tertiary rebate from age 75", () => {
    expect(calculateRebate(75, rebates)).toBe(17_235 + 9_444 + 3_145);
  });

  it("rejects a negative age", () => {
    expect(() => calculateRebate(-1, rebates)).toThrow();
  });
});

describe("calculateMedicalCredit (2025/26)", () => {
  const table = TAX_YEAR_2025_26.medicalCredit;

  it("returns 0 for no members", () => {
    expect(calculateMedicalCredit(0, table)).toBe(0);
  });

  it("credits the main member at the full monthly rate for a year", () => {
    expect(calculateMedicalCredit(1, table)).toBe(364 * 12);
  });

  it("credits the first two members at the full monthly rate", () => {
    expect(calculateMedicalCredit(2, table)).toBe(364 * 2 * 12);
  });

  it("credits additional members beyond two at the lower rate", () => {
    // main member + 3 dependants = 4 total: 2 at full rate, 2 at additional rate
    expect(calculateMedicalCredit(4, table)).toBe((364 * 2 + 246 * 2) * 12);
  });
});
