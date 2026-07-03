import { describe, expect, it } from "vitest";
import { suggestField } from "./suggestField";

describe("suggestField", () => {
  it("suggests payeDeducted for PAYE-labelled amounts", () => {
    expect(suggestField("PAYE Tax 3,567.16")).toBe("payeDeducted");
    expect(suggestField("Pay as you Earn 3 506.27")).toBe("payeDeducted");
  });

  it("suggests uif for UIF-labelled amounts", () => {
    expect(suggestField("UIF Contribution 177.12")).toBe("uif");
    expect(suggestField("Unemployment Insurance Fund 177.12")).toBe("uif");
  });

  it("suggests retirementContribution for an employee's own retirement deduction", () => {
    expect(suggestField("Retirement Funding- Employee 188.01")).toBe("retirementContribution");
    expect(suggestField("Retirement Annuity 4 200.00")).toBe("retirementContribution");
  });

  it("suggests employerRetirementFringeBenefit for an employer's non-cash retirement contribution", () => {
    expect(suggestField("Retirement Funding - Employer 564.04")).toBe(
      "employerRetirementFringeBenefit",
    );
    expect(suggestField("Pension fund contributions Fringe Benefit 6449.00")).toBe(
      "employerRetirementFringeBenefit",
    );
  });

  it("suggests generalFringeBenefit for general fringe benefit line items", () => {
    expect(suggestField("General Fringe Benefits 367.00")).toBe("generalFringeBenefit");
    expect(suggestField("Company car fringe benefit 2000.00")).toBe("generalFringeBenefit");
  });

  it("suggests grossSalary for a total-cash-style summary row", () => {
    expect(suggestField("Total Cash Portion 25,511.38")).toBe("grossSalary");
    expect(suggestField("Gross Income 45,000.00")).toBe("grossSalary");
  });

  it("does not suggest grossSalary for a single itemised earnings line", () => {
    // A single line item (e.g. Basic Salary) may omit other taxable
    // components (allowances, etc); only a true total is a safe suggestion.
    expect(suggestField("Basic Salary 18,801.38")).toBeNull();
    expect(suggestField("Telephone Allowance 6,710.00")).toBeNull();
  });

  it("returns null for amounts that don't match any known field", () => {
    expect(suggestField("Net Pay 21,579.09")).toBeNull();
    expect(suggestField("Total Deductions 3,932.29")).toBeNull();
  });
});
