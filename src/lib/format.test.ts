import { describe, expect, it } from "vitest";
import { formatCurrency } from "./format";

// Node's ICU data renders en-ZA currency with non-breaking spaces between
// the symbol and digit groups, so normalize whitespace before asserting.
function normalizeSpaces(value: string): string {
  return value.replace(/\s/g, " ");
}

describe("formatCurrency", () => {
  it("formats a positive amount as South African Rand with no decimals", () => {
    expect(normalizeSpaces(formatCurrency(100_272))).toBe("R 100 272");
  });

  it("formats zero", () => {
    expect(normalizeSpaces(formatCurrency(0))).toBe("R 0");
  });
});
