import { describe, expect, it } from "vitest";
import {
  addEmployerBlock,
  getMonthBlocks,
  hasAnyPayslipData,
  monthHasData,
  removeEmployerBlock,
  renameEmployerBlock,
  updateBlockCategoryAmount,
} from "./payslipBlocks";
import type { PayslipLineItem } from "@/lib/tax-engine/payslips";

describe("addEmployerBlock", () => {
  it("appends 6 zero-amount line items for the given month, sharing a block id", () => {
    const payslips = addEmployerBlock([], 0);
    expect(payslips).toHaveLength(6);
    expect(payslips.every((item) => item.month === 0 && item.amount === 0)).toBe(true);
    expect(new Set(payslips.map((item) => item.id.split(":")[0])).size).toBe(1);
  });

  it("does not disturb existing line items in other months or blocks", () => {
    const existing = addEmployerBlock([], 0);
    const payslips = addEmployerBlock(existing, 1);
    expect(payslips).toHaveLength(12);
    expect(getMonthBlocks(payslips, 0)).toHaveLength(1);
    expect(getMonthBlocks(payslips, 1)).toHaveLength(1);
  });
});

describe("getMonthBlocks", () => {
  it("groups a month's line items into one block per employer", () => {
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);

    const blocks = getMonthBlocks(payslips, 0);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].items.basic_salary?.category).toBe("basic_salary");
  });

  it("returns an empty array for a month with no blocks", () => {
    expect(getMonthBlocks([], 3)).toEqual([]);
  });

  it("keeps two blank (still-unnamed) employer blocks distinct", () => {
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);
    const blocks = getMonthBlocks(payslips, 0);

    expect(blocks[0].blockId).not.toBe(blocks[1].blockId);
    expect(blocks[0].employer).toBe("");
    expect(blocks[1].employer).toBe("");
  });
});

describe("removeEmployerBlock", () => {
  it("removes only the line items belonging to the given block", () => {
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);
    const [first, second] = getMonthBlocks(payslips, 0);

    const result = removeEmployerBlock(payslips, first.blockId);

    expect(result).toHaveLength(6);
    expect(getMonthBlocks(result, 0)).toEqual([
      expect.objectContaining({ blockId: second.blockId }),
    ]);
  });
});

describe("renameEmployerBlock", () => {
  it("renames the employer on every line item in the block, without affecting other blocks", () => {
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);
    const [first, second] = getMonthBlocks(payslips, 0);

    const result = renameEmployerBlock(payslips, first.blockId, "Acme Ltd");

    const [renamed, untouched] = getMonthBlocks(result, 0);
    expect(renamed.employer).toBe("Acme Ltd");
    expect(untouched.blockId).toBe(second.blockId);
    expect(untouched.employer).toBe("");
  });
});

describe("updateBlockCategoryAmount", () => {
  it("updates only the matching block+category, leaving siblings at zero", () => {
    const payslips = addEmployerBlock([], 0);
    const [block] = getMonthBlocks(payslips, 0);

    const result = updateBlockCategoryAmount(payslips, block.blockId, "basic_salary", 45_000);

    const [updated] = getMonthBlocks(result, 0);
    expect(updated.items.basic_salary?.amount).toBe(45_000);
    expect(updated.items.paye?.amount).toBe(0);
  });
});

describe("monthHasData", () => {
  it("is false for a month with no blocks", () => {
    expect(monthHasData([], 0)).toBe(false);
  });

  it("is false for a month whose blocks are all still blank", () => {
    const payslips = addEmployerBlock([], 0);
    expect(monthHasData(payslips, 0)).toBe(false);
  });

  it("is true once an amount or employer name is filled in", () => {
    const payslips = addEmployerBlock([], 0);
    const [block] = getMonthBlocks(payslips, 0);
    const withAmount = updateBlockCategoryAmount(payslips, block.blockId, "uif", 177.12);
    expect(monthHasData(withAmount, 0)).toBe(true);

    const withEmployer = renameEmployerBlock(payslips, block.blockId, "Acme Ltd");
    expect(monthHasData(withEmployer, 0)).toBe(true);
  });
});

describe("hasAnyPayslipData", () => {
  it("is false with no line items or only blank blocks", () => {
    expect(hasAnyPayslipData([])).toBe(false);
    expect(hasAnyPayslipData(addEmployerBlock([], 3))).toBe(false);
  });

  it("is true once any month has a non-zero amount", () => {
    const payslips = addEmployerBlock([], 3);
    const [block] = getMonthBlocks(payslips, 3);
    const withAmount = updateBlockCategoryAmount(payslips, block.blockId, "uif", 177.12);
    expect(hasAnyPayslipData(withAmount)).toBe(true);
  });
});

describe("real-world regression: a mid-year job change with fringe benefits", () => {
  it("supports two employers in different months, one with fringe benefits", () => {
    let payslips: PayslipLineItem[] = [];
    payslips = addEmployerBlock(payslips, 0); // March, first employer
    payslips = addEmployerBlock(payslips, 11); // February, new employer

    const marchBlock = getMonthBlocks(payslips, 0)[0];
    payslips = renameEmployerBlock(payslips, marchBlock.blockId, "Old Co");
    payslips = updateBlockCategoryAmount(payslips, marchBlock.blockId, "basic_salary", 20_000);
    payslips = updateBlockCategoryAmount(
      payslips,
      marchBlock.blockId,
      "employer_retirement_fringe_benefit",
      500,
    );

    const febBlock = getMonthBlocks(payslips, 11)[0];
    payslips = renameEmployerBlock(payslips, febBlock.blockId, "New Co");
    payslips = updateBlockCategoryAmount(payslips, febBlock.blockId, "basic_salary", 28_000);

    expect(getMonthBlocks(payslips, 0)[0]).toMatchObject({ employer: "Old Co" });
    expect(getMonthBlocks(payslips, 11)[0]).toMatchObject({ employer: "New Co" });
    expect(payslips).toHaveLength(12);
  });
});
