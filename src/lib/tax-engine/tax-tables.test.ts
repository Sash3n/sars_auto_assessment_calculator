import { describe, expect, it } from "vitest";
import { TAX_YEAR_2025_26, TAX_YEAR_2026_27, TAX_YEAR_TABLES } from "./tax-tables";

describe.each([
  ["2025/26", TAX_YEAR_2025_26],
  ["2026/27", TAX_YEAR_2026_27],
])("%s tax table", (_label, table) => {
  it("has brackets whose min/max boundaries chain with no gaps", () => {
    for (let i = 1; i < table.brackets.length; i++) {
      expect(table.brackets[i].min).toBe(table.brackets[i - 1].max);
    }
    expect(table.brackets[0].min).toBe(0);
    expect(table.brackets[table.brackets.length - 1].max).toBe(Infinity);
  });

  it("has a cumulative base at each bracket that matches the prior bracket's tax", () => {
    for (let i = 1; i < table.brackets.length; i++) {
      const prior = table.brackets[i - 1];
      const expectedBase = prior.base + prior.rate * (prior.max - prior.min);
      expect(table.brackets[i].base).toBeCloseTo(expectedBase, 6);
    }
  });
});

describe("TAX_YEAR_TABLES", () => {
  it("exposes every table under its own year label", () => {
    expect(TAX_YEAR_TABLES["2025/26"].year).toBe("2025/26");
    expect(TAX_YEAR_TABLES["2026/27"].year).toBe("2026/27");
  });
});
