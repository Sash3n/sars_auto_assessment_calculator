import { describe, expect, it } from "vitest";
import { calculateNetRentalIncome } from "./rental";

describe("calculateNetRentalIncome", () => {
  it("nets income against expenses for a single fully-let property", () => {
    const result = calculateNetRentalIncome([
      {
        income: 120_000,
        expenses: 45_000,
        areaLetFraction: 1,
        monthsLetFraction: 1,
      },
    ]);
    expect(result.netIncome).toBe(75_000);
    expect(result.properties[0].deductibleExpenses).toBe(45_000);
  });

  it("apportions expenses by area let when only part of a property is let", () => {
    const result = calculateNetRentalIncome([
      {
        income: 60_000,
        expenses: 40_000,
        areaLetFraction: 0.25, // one room out of four equal rooms
        monthsLetFraction: 1,
      },
    ]);
    expect(result.properties[0].deductibleExpenses).toBe(10_000);
    expect(result.netIncome).toBe(50_000);
  });

  it("apportions expenses by months let when let for only part of the year", () => {
    const result = calculateNetRentalIncome([
      {
        income: 30_000,
        expenses: 24_000,
        areaLetFraction: 1,
        monthsLetFraction: 0.5, // let for 6 of 12 months
      },
    ]);
    expect(result.properties[0].deductibleExpenses).toBe(12_000);
    expect(result.netIncome).toBe(18_000);
  });

  it("sums net income/loss across multiple properties", () => {
    const result = calculateNetRentalIncome([
      { income: 100_000, expenses: 60_000, areaLetFraction: 1, monthsLetFraction: 1 },
      { income: 20_000, expenses: 35_000, areaLetFraction: 1, monthsLetFraction: 1 },
    ]);
    expect(result.netIncome).toBe(25_000); // 40 000 - 15 000 loss
    expect(result.properties[1].netIncome).toBe(-15_000);
  });

  it("flags a rental loss for the ring-fencing advisory", () => {
    const result = calculateNetRentalIncome([
      { income: 10_000, expenses: 25_000, areaLetFraction: 1, monthsLetFraction: 1 },
    ]);
    expect(result.hasLoss).toBe(true);
  });

  it("returns zero income and no loss for an empty property list", () => {
    const result = calculateNetRentalIncome([]);
    expect(result.netIncome).toBe(0);
    expect(result.hasLoss).toBe(false);
  });
});
