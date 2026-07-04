import { describe, expect, it } from "vitest";
import { calculateTaxableCapitalGain } from "./capitalGains";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateTaxableCapitalGain (2025/26)", () => {
  const table = TAX_YEAR_2025_26.capitalGains;

  it("includes 40% of the gain after the annual exclusion for a non-primary-residence disposal", () => {
    // gain = 1 000 000 - 600 000 = 400 000; less 40 000 annual exclusion = 360 000
    const result = calculateTaxableCapitalGain({
      proceeds: 1_000_000,
      baseCost: 600_000,
      isPrimaryResidence: false,
      table,
    });
    expect(result.capitalGain).toBe(400_000);
    expect(result.taxableCapitalGain).toBeCloseTo(0.4 * 360_000, 2);
  });

  it("applies the primary residence exclusion before the annual exclusion", () => {
    // gain = 2 500 000 - 500 000 = 2 000 000; less 2m primary residence
    // exclusion = 0; well under the annual exclusion too
    const result = calculateTaxableCapitalGain({
      proceeds: 2_500_000,
      baseCost: 500_000,
      isPrimaryResidence: true,
      table,
    });
    expect(result.capitalGain).toBe(2_000_000);
    expect(result.taxableCapitalGain).toBe(0);
  });

  it("taxes the portion of a primary residence gain above the exclusion", () => {
    // gain = 3 000 000 - 500 000 = 2 500 000; less 2m primary residence
    // exclusion = 500 000; less 40 000 annual exclusion = 460 000
    const result = calculateTaxableCapitalGain({
      proceeds: 3_000_000,
      baseCost: 500_000,
      isPrimaryResidence: true,
      table,
    });
    expect(result.taxableCapitalGain).toBeCloseTo(0.4 * 460_000, 2);
  });

  it("returns 0 for a disposal at a loss", () => {
    const result = calculateTaxableCapitalGain({
      proceeds: 400_000,
      baseCost: 600_000,
      isPrimaryResidence: false,
      table,
    });
    expect(result.capitalGain).toBe(-200_000);
    expect(result.taxableCapitalGain).toBe(0);
  });

  it("returns 0 when no disposal is entered", () => {
    const result = calculateTaxableCapitalGain({
      proceeds: 0,
      baseCost: 0,
      isPrimaryResidence: false,
      table,
    });
    expect(result.taxableCapitalGain).toBe(0);
  });
});
