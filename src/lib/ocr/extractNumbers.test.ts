import { describe, expect, it } from "vitest";
import { extractNumbersFromText } from "./extractNumbers";

describe("extractNumbersFromText", () => {
  it("extracts a plain decimal amount with no separators", () => {
    const result = extractNumbersFromText("UIF Contribution 177.12");
    expect(result).toEqual([
      { raw: "177.12", value: 177.12, context: "UIF Contribution 177.12" },
    ]);
  });

  it("extracts an amount with a comma thousands separator and R prefix", () => {
    const result = extractNumbersFromText("Basic Salary R11,978.53");
    expect(result[0].value).toBeCloseTo(11_978.53, 2);
  });

  it("extracts an amount with a space thousands separator", () => {
    const result = extractNumbersFromText("Retirement Annuity - Allan Gray 4 200.00");
    expect(result[0].value).toBeCloseTo(4_200.0, 2);
  });

  it("extracts every amount on its own line with line context", () => {
    const text = ["Pay as you Earn 3 506.27", "Unemployment Insurance Fund 177.12"].join("\n");
    const result = extractNumbersFromText(text);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ value: 3_506.27, context: "Pay as you Earn 3 506.27" });
    expect(result[1]).toMatchObject({
      value: 177.12,
      context: "Unemployment Insurance Fund 177.12",
    });
  });

  it("ignores integers without a decimal portion (page numbers, reference numbers)", () => {
    const result = extractNumbersFromText("Page 2 of 4");
    expect(result).toEqual([]);
  });

  it("returns an empty array for text with no amounts", () => {
    expect(extractNumbersFromText("INCOME\nEarnings\nDeductions")).toEqual([]);
  });

  it("returns multiple amounts found on the same line", () => {
    const result = extractNumbersFromText("Total Deductions 7 883.39 Net Pay 20 116.61");
    expect(result.map((r) => r.value)).toEqual([7_883.39, 20_116.61]);
  });

  it("falls back to the previous line's label when a bordered table splits the amount onto its own line", () => {
    // Wide-gap table layouts (label far left, amount far right) can make
    // OCR emit the label and its amount as separate lines.
    const text = ["Basic Salary", "R18,801.38", "Telephone Allowance", "R6,710.00"].join("\n");
    const result = extractNumbersFromText(text);

    expect(result).toEqual([
      { raw: "R18,801.38", value: 18_801.38, context: "Basic Salary R18,801.38" },
      { raw: "R6,710.00", value: 6_710.0, context: "Telephone Allowance R6,710.00" },
    ]);
  });

  it("does not prepend a previous label line when the amount's own line already has one", () => {
    const text = ["Basic Salary", "PAYE Tax 3,567.16"].join("\n");
    const result = extractNumbersFromText(text);

    expect(result[0].context).toBe("PAYE Tax 3,567.16");
  });

  it("skips bare table-header lines (Quantity, Rate, Balance, Amount) as fallback labels", () => {
    const text = ["Basic Salary", "Quantity Rate", "R18,801.38"].join("\n");
    const result = extractNumbersFromText(text);

    expect(result[0].context).toBe("Basic Salary R18,801.38");
  });

  it("extracts a 4+ digit amount with no thousands separator at all", () => {
    // Real SARS ITA34 printouts sometimes omit the separator, e.g.
    // "Pension fund contributions Fringe Benefit ... 6449.00"
    const result = extractNumbersFromText("Pension fund contributions Fringe Benefit 6449.00");
    expect(result).toEqual([
      {
        raw: "6449.00",
        value: 6_449,
        context: "Pension fund contributions Fringe Benefit 6449.00",
      },
    ]);
  });
});
