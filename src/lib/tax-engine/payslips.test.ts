import { describe, expect, it } from "vitest";
import {
  summarizePayslips,
  summarizeLineItems,
  monthlyPayslipsToLineItems,
  type PayslipLineItem,
} from "./payslips";

describe("summarizePayslips", () => {
  const flatYear = Array.from({ length: 12 }, () => ({
    grossSalary: 30_000,
    payeDeducted: 5_000,
    uif: 177.12,
    retirementContribution: 1_500,
  }));

  it("sums gross salary, PAYE and retirement contributions across all months", () => {
    const result = summarizePayslips(flatYear);
    expect(result.totalGrossSalary).toBe(360_000);
    expect(result.totalPayeDeducted).toBe(60_000);
    expect(result.totalRetirementContribution).toBe(18_000);
  });

  it("flags no anomalies when income is flat across the year", () => {
    const result = summarizePayslips(flatYear);
    expect(result.anomalousMonths).toEqual([]);
  });

  it("flags a month that deviates more than 25% from the year's average", () => {
    const months = [...flatYear];
    months[11] = { ...months[11], grossSalary: 90_000 }; // December bonus
    const result = summarizePayslips(months);
    expect(result.anomalousMonths).toContain(11);
  });

  it("throws if fewer than 1 or more than 12 months are provided", () => {
    expect(() => summarizePayslips([])).toThrow();
    expect(() => summarizePayslips(Array(13).fill(flatYear[0]))).toThrow();
  });

  it("handles a partial (fewer than 12 month) tax year without false anomalies", () => {
    const result = summarizePayslips(flatYear.slice(0, 6));
    expect(result.anomalousMonths).toEqual([]);
    expect(result.totalGrossSalary).toBe(180_000);
  });
});

describe("summarizeLineItems", () => {
  function item(overrides: Partial<PayslipLineItem>): PayslipLineItem {
    return {
      id: Math.random().toString(),
      month: 0,
      employer: "Acme Ltd",
      category: "basic_salary",
      amount: 0,
      ...overrides,
    };
  }

  it("sums basic salary, bonus and allowance line items into gross salary", () => {
    const result = summarizeLineItems([
      item({ month: 0, category: "basic_salary", amount: 20_000 }),
      item({ month: 0, category: "bonus", amount: 5_000 }),
      item({ month: 1, category: "allowance", amount: 1_000 }),
    ]);

    expect(result.totalGrossSalary).toBe(26_000);
    expect(result.perMonthGrossSalary[0]).toBe(25_000);
    expect(result.perMonthGrossSalary[1]).toBe(1_000);
  });

  it("adds an employer retirement fringe benefit to both gross income and the retirement base", () => {
    const result = summarizeLineItems([
      item({ month: 0, category: "basic_salary", amount: 20_000 }),
      item({ month: 0, category: "employer_retirement_fringe_benefit", amount: 500 }),
    ]);

    expect(result.totalGrossSalary).toBe(20_500);
    expect(result.totalRetirementContribution).toBe(500);
  });

  it("adds a general fringe benefit to gross income only, not the retirement base", () => {
    const result = summarizeLineItems([
      item({ month: 0, category: "basic_salary", amount: 20_000 }),
      item({ month: 0, category: "general_fringe_benefit", amount: 300 }),
    ]);

    expect(result.totalGrossSalary).toBe(20_300);
    expect(result.totalRetirementContribution).toBe(0);
  });

  it("sums employee retirement contributions into the retirement base, not gross income", () => {
    const result = summarizeLineItems([
      item({ month: 0, category: "employee_retirement_contribution", amount: 1_500 }),
    ]);

    expect(result.totalRetirementContribution).toBe(1_500);
    expect(result.totalGrossSalary).toBe(0);
  });

  it("sums PAYE and UIF line items separately from gross income", () => {
    const result = summarizeLineItems([
      item({ month: 0, category: "paye", amount: 4_000 }),
      item({ month: 0, category: "uif", amount: 177.12 }),
    ]);

    expect(result.totalPayeDeducted).toBe(4_000);
    expect(result.totalUif).toBeCloseTo(177.12, 2);
    expect(result.totalGrossSalary).toBe(0);
  });

  it("never lets other_non_tax line items affect any total", () => {
    const result = summarizeLineItems([item({ category: "other_non_tax", amount: 22_500 })]);

    expect(result.totalGrossSalary).toBe(0);
    expect(result.totalPayeDeducted).toBe(0);
    expect(result.totalUif).toBe(0);
    expect(result.totalRetirementContribution).toBe(0);
  });

  it("groups totals per employer for a mid-year job change", () => {
    const result = summarizeLineItems([
      item({ month: 0, employer: "Old Co", category: "basic_salary", amount: 20_000 }),
      item({ month: 11, employer: "New Co", category: "basic_salary", amount: 28_000 }),
    ]);

    expect(result.perEmployerTotals["Old Co"].totalGrossSalary).toBe(20_000);
    expect(result.perEmployerTotals["New Co"].totalGrossSalary).toBe(28_000);
  });

  it("flags a month whose gross salary deviates more than 25% from the average", () => {
    const lineItems = Array.from({ length: 12 }, (_, month) =>
      item({ month, category: "basic_salary", amount: 30_000 }),
    );
    lineItems.push(item({ month: 11, category: "bonus", amount: 60_000 }));

    const result = summarizeLineItems(lineItems);
    expect(result.anomalousMonths).toContain(11);
  });

  it("throws if a line item's month is outside the tax year's range", () => {
    expect(() => summarizeLineItems([item({ month: 12 })])).toThrow();
    expect(() => summarizeLineItems([item({ month: -1 })])).toThrow();
  });

  it("throws for a monthCount outside 1-12", () => {
    expect(() => summarizeLineItems([], 0)).toThrow();
    expect(() => summarizeLineItems([], 13)).toThrow();
  });

  it("supports a partial (fewer than 12 month) tax year", () => {
    const result = summarizeLineItems(
      [item({ month: 5, category: "basic_salary", amount: 30_000 })],
      6,
    );
    expect(result.perMonthGrossSalary).toHaveLength(6);
  });
});

describe("monthlyPayslipsToLineItems", () => {
  it("converts a flat MonthlyPayslip array into equivalent line items under one employer", () => {
    const payslips = [
      { grossSalary: 20_000, payeDeducted: 3_000, uif: 177.12, retirementContribution: 1_000 },
      { grossSalary: 0, payeDeducted: 0, uif: 0, retirementContribution: 0 },
    ];

    const lineItems = monthlyPayslipsToLineItems(payslips);
    const summary = summarizeLineItems(lineItems, payslips.length);

    expect(summary.totalGrossSalary).toBe(20_000);
    expect(summary.totalPayeDeducted).toBe(3_000);
    expect(summary.totalUif).toBeCloseTo(177.12, 2);
    expect(summary.totalRetirementContribution).toBe(1_000);
  });

  it("omits zero-amount fields rather than emitting empty line items", () => {
    const payslips = [{ grossSalary: 0, payeDeducted: 0, uif: 0, retirementContribution: 0 }];
    expect(monthlyPayslipsToLineItems(payslips)).toEqual([]);
  });
});
