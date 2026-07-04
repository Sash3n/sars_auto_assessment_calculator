import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  isoMonthToTaxYearIndex,
  parsePayslipImportJson,
} from "./payslipImportSchema";

describe("isoMonthToTaxYearIndex", () => {
  it("maps March of the start year to index 0 and February of the next year to index 11", () => {
    expect(isoMonthToTaxYearIndex("2025-03", "2025/26")).toBe(0);
    expect(isoMonthToTaxYearIndex("2026-02", "2025/26")).toBe(11);
  });

  it("maps December of the start year to index 9 and January of the next year to index 10", () => {
    expect(isoMonthToTaxYearIndex("2025-12", "2025/26")).toBe(9);
    expect(isoMonthToTaxYearIndex("2026-01", "2025/26")).toBe(10);
  });

  it("returns null for a month outside the given tax year", () => {
    expect(isoMonthToTaxYearIndex("2025-02", "2025/26")).toBeNull(); // belongs to the prior tax year
    expect(isoMonthToTaxYearIndex("2026-03", "2025/26")).toBeNull(); // belongs to the next tax year
  });

  it("returns null for a malformed month or tax year string", () => {
    expect(isoMonthToTaxYearIndex("March 2025", "2025/26")).toBeNull();
    expect(isoMonthToTaxYearIndex("2025-03", "2025-26")).toBeNull();
  });
});

describe("parsePayslipImportJson", () => {
  const taxYear = "2025/26";

  it("parses a valid document into PayslipLineItem[]", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      taxYear,
      lineItems: [
        { month: "2025-03", employer: "Acme Ltd", category: "basic_salary", amount: 20000 },
        { month: "2025-03", employer: "Acme Ltd", category: "paye", amount: 3000 },
      ],
    });

    const result = parsePayslipImportJson(raw, taxYear);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected ok");
    expect(result.lineItems).toHaveLength(2);
    expect(result.lineItems.every((item) => item.month === 0)).toBe(true);
    expect(result.lineItems.every((item) => item.employer === "Acme Ltd")).toBe(true);
  });

  it("groups line items sharing a month+employer under the same block id", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      lineItems: [
        { month: "2025-03", employer: "Acme Ltd", category: "basic_salary", amount: 20000 },
        { month: "2025-03", employer: "Acme Ltd", category: "paye", amount: 3000 },
        { month: "2026-02", employer: "New Co", category: "basic_salary", amount: 28000 },
      ],
    });

    const result = parsePayslipImportJson(raw, taxYear);
    if (!result.ok) throw new Error("expected ok");

    const acmeBlockIds = new Set(
      result.lineItems.filter((i) => i.employer === "Acme Ltd").map((i) => i.id.split(":")[0]),
    );
    expect(acmeBlockIds.size).toBe(1);

    const newCoItem = result.lineItems.find((i) => i.employer === "New Co");
    expect(newCoItem?.id.split(":")[0]).not.toBe([...acmeBlockIds][0]);
  });

  it("sums duplicate month+employer+category entries instead of dropping one", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      lineItems: [
        { month: "2025-03", employer: "Acme Ltd", category: "allowance", amount: 500 },
        { month: "2025-03", employer: "Acme Ltd", category: "allowance", amount: 250 },
      ],
    });

    const result = parsePayslipImportJson(raw, taxYear);
    if (!result.ok) throw new Error("expected ok");
    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0].amount).toBe(750);
  });

  it("passes through optional sarsCode and description", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      lineItems: [
        {
          month: "2025-03",
          employer: "Acme Ltd",
          category: "basic_salary",
          sarsCode: "3601",
          description: "Income - taxable",
          amount: 20000,
        },
      ],
    });

    const result = parsePayslipImportJson(raw, taxYear);
    if (!result.ok) throw new Error("expected ok");
    expect(result.lineItems[0].sarsCode).toBe("3601");
    expect(result.lineItems[0].description).toBe("Income - taxable");
  });

  it("rejects malformed JSON syntax", () => {
    const result = parsePayslipImportJson("{not json", taxYear);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("rejects a document with the wrong schemaVersion", () => {
    const result = parsePayslipImportJson(
      JSON.stringify({ schemaVersion: 2, lineItems: [] }),
      taxYear,
    );
    expect(result.ok).toBe(false);
  });

  it("rejects a document whose taxYear doesn't match the selected tax year", () => {
    const result = parsePayslipImportJson(
      JSON.stringify({ schemaVersion: 1, taxYear: "2026/27", lineItems: [] }),
      taxYear,
    );
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.errors[0]).toMatch(/tax year/i);
  });

  it("collects every validation error across all items, not just the first", () => {
    const raw = JSON.stringify({
      schemaVersion: 1,
      lineItems: [
        { month: "not-a-month", employer: "Acme Ltd", category: "basic_salary", amount: 100 },
        { month: "2025-03", employer: "Acme Ltd", category: "not_a_category", amount: 100 },
        { month: "2025-03", employer: "Acme Ltd", category: "basic_salary", amount: -5 },
      ],
    });

    const result = parsePayslipImportJson(raw, taxYear);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.errors).toHaveLength(3);
  });

  it("rejects a document missing the lineItems array", () => {
    const result = parsePayslipImportJson(JSON.stringify({ schemaVersion: 1 }), taxYear);
    expect(result.ok).toBe(false);
  });
});

describe("schema/payslip-import.example.json fixture", () => {
  it("is accepted by parsePayslipImportJson (keeps the TS parser and the checked-in schema/example in sync)", () => {
    const raw = readFileSync("schema/payslip-import.example.json", "utf-8");
    const example = JSON.parse(raw) as { taxYear: string };

    const result = parsePayslipImportJson(raw, example.taxYear);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(`expected ok, got errors: ${result.errors.join(", ")}`);
    expect(result.lineItems.length).toBeGreaterThan(0);
  });
});
