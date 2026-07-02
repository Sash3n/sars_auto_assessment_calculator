import { describe, expect, it } from "vitest";
import { isLikelyProvisionalTaxpayer } from "./provisional-tax";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("isLikelyProvisionalTaxpayer (2025/26)", () => {
  const table = TAX_YEAR_2025_26;

  it("is false for a taxpayer with salary income only", () => {
    expect(
      isLikelyProvisionalTaxpayer(
        { age: 35, totalTaxableIncome: 400_000, nonRemunerationIncome: 0, interestIncome: 0 },
        table,
      ),
    ).toBe(false);
  });

  it("is false when total taxable income is below the tax threshold", () => {
    expect(
      isLikelyProvisionalTaxpayer(
        { age: 35, totalTaxableIncome: 80_000, nonRemunerationIncome: 20_000, interestIncome: 0 },
        table,
      ),
    ).toBe(false);
  });

  it("is false when the only non-remuneration income is exempt interest", () => {
    expect(
      isLikelyProvisionalTaxpayer(
        {
          age: 35,
          totalTaxableIncome: 400_000,
          nonRemunerationIncome: 0,
          interestIncome: 20_000, // below the under-65 R23 800 exemption
        },
        table,
      ),
    ).toBe(false);
  });

  it("is true when the taxpayer has rental/freelance income above the threshold", () => {
    expect(
      isLikelyProvisionalTaxpayer(
        {
          age: 35,
          totalTaxableIncome: 500_000,
          nonRemunerationIncome: 100_000,
          interestIncome: 0,
        },
        table,
      ),
    ).toBe(true);
  });

  it("is true when interest income exceeds the age-based exemption", () => {
    expect(
      isLikelyProvisionalTaxpayer(
        {
          age: 70,
          totalTaxableIncome: 500_000,
          nonRemunerationIncome: 0,
          interestIncome: 40_000, // above the 65+ R34 500 exemption
        },
        table,
      ),
    ).toBe(true);
  });
});
