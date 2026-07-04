import { describe, expect, it } from "vitest";
import { calculateTaxableTravelReimbursement } from "./travel";
import { TAX_YEAR_2025_26 } from "./tax-tables";

describe("calculateTaxableTravelReimbursement (2025/26)", () => {
  const table = TAX_YEAR_2025_26.travelReimbursement;

  it("is fully exempt when reimbursed at or below the prescribed rate", () => {
    expect(calculateTaxableTravelReimbursement(10_000, 4.76, table)).toBe(0);
    expect(calculateTaxableTravelReimbursement(10_000, 3, table)).toBe(0);
  });

  it("taxes only the portion of the per-km rate above the prescribed rate", () => {
    // 10 000 km * (6 - 4.76) = 12 400
    expect(calculateTaxableTravelReimbursement(10_000, 6, table)).toBeCloseTo(12_400, 2);
  });

  it("returns 0 for zero business km travelled", () => {
    expect(calculateTaxableTravelReimbursement(0, 6, table)).toBe(0);
  });

  it("rejects negative business km", () => {
    expect(() => calculateTaxableTravelReimbursement(-1, 6, table)).toThrow();
  });
});
