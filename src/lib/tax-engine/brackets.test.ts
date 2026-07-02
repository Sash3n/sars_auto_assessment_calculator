import { describe, expect, it } from "vitest";
import { calculateGrossTax } from "./brackets";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateGrossTax (2025/26)", () => {
  const brackets = TAX_YEAR_2025_26.brackets;

  it("returns 0 for zero taxable income", () => {
    expect(calculateGrossTax(0, brackets)).toBe(0);
  });

  it("taxes income within the first bracket at 18%", () => {
    expect(calculateGrossTax(100_000, brackets)).toBeCloseTo(18_000, 2);
  });

  it("matches the published cumulative base exactly at a bracket boundary", () => {
    expect(calculateGrossTax(237_100, brackets)).toBeCloseTo(42_678, 2);
  });

  it("taxes income in the second bracket correctly", () => {
    // 42 678 + 26% of (300 000 - 237 100)
    expect(calculateGrossTax(300_000, brackets)).toBeCloseTo(59_032, 2);
  });

  it("taxes income in the top bracket correctly", () => {
    // 644 489 + 45% of (2 000 000 - 1 817 000)
    expect(calculateGrossTax(2_000_000, brackets)).toBeCloseTo(726_839, 2);
  });

  it("rejects negative taxable income", () => {
    expect(() => calculateGrossTax(-1, brackets)).toThrow();
  });
});
