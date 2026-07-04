import { describe, expect, it } from "vitest";
import { compareLineItemsBySarsCode } from "./sarsCodeComparison";
import type { PayslipLineItem } from "./payslips";

function lineItem(sarsCode: string | undefined, amount: number): PayslipLineItem {
  return {
    id: `${sarsCode ?? "none"}-${amount}`,
    month: 0,
    employer: "Old Co",
    category: "basic_salary",
    sarsCode,
    amount,
  };
}

describe("compareLineItemsBySarsCode", () => {
  it("returns an empty array when neither side has any coded line items", () => {
    expect(compareLineItemsBySarsCode([], [])).toEqual([]);
  });

  it("matches a code present on both sides and computes the difference", () => {
    const rows = compareLineItemsBySarsCode(
      [lineItem("3601", 47365)],
      [{ sarsCode: "3601", amount: 45000 }],
    );
    expect(rows).toEqual([{ sarsCode: "3601", yourAmount: 47365, sarsAmount: 45000, difference: 2365 }]);
  });

  it("sums duplicate codes on your side across multiple employers/months", () => {
    const rows = compareLineItemsBySarsCode(
      [lineItem("3601", 18801.38), lineItem("3601", 28000)],
      [{ sarsCode: "3601", amount: 46801.38 }],
    );
    expect(rows[0].yourAmount).toBeCloseTo(46801.38, 2);
  });

  it("sums duplicate codes on the SARS-assessed side", () => {
    const rows = compareLineItemsBySarsCode(
      [lineItem("3601", 46801.38)],
      [
        { sarsCode: "3601", amount: 18801.38 },
        { sarsCode: "3601", amount: 28000 },
      ],
    );
    expect(rows[0].sarsAmount).toBeCloseTo(46801.38, 2);
  });

  it("shows a code that's only on your side with a zero SARS amount", () => {
    const rows = compareLineItemsBySarsCode([lineItem("3817", 564.04)], []);
    expect(rows).toEqual([{ sarsCode: "3817", yourAmount: 564.04, sarsAmount: 0, difference: 564.04 }]);
  });

  it("shows a code that's only on the SARS side with a zero your-amount", () => {
    const rows = compareLineItemsBySarsCode([], [{ sarsCode: "3801", amount: 367 }]);
    expect(rows).toEqual([{ sarsCode: "3801", yourAmount: 0, sarsAmount: 367, difference: -367 }]);
  });

  it("ignores your line items with no sarsCode -- they can't be compared at code level", () => {
    const rows = compareLineItemsBySarsCode(
      [lineItem(undefined, 1000), lineItem("3601", 47365)],
      [{ sarsCode: "3601", amount: 47365 }],
    );
    expect(rows).toEqual([{ sarsCode: "3601", yourAmount: 47365, sarsAmount: 47365, difference: 0 }]);
  });

  it("sorts rows by SARS code", () => {
    const rows = compareLineItemsBySarsCode(
      [lineItem("3817", 1), lineItem("3601", 2), lineItem("3801", 3)],
      [],
    );
    expect(rows.map((r) => r.sarsCode)).toEqual(["3601", "3801", "3817"]);
  });
});
