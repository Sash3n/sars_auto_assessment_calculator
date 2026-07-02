import { describe, expect, it } from "vitest";
import { summarizePayslips } from "./payslips";

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
