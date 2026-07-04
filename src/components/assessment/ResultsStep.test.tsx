import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultsStep } from "./ResultsStep";
import { assessTax } from "@/lib/tax-engine/assess";
import type { PayslipLineItem } from "@/lib/tax-engine/payslips";

function flatPayslips(annualGross: number, annualPaye = 0): PayslipLineItem[] {
  const items: PayslipLineItem[] = [];
  for (let month = 0; month < 12; month++) {
    items.push({
      id: `${month}-basic_salary`,
      month,
      employer: "Employer",
      category: "basic_salary",
      amount: annualGross / 12,
    });
    if (annualPaye > 0) {
      items.push({
        id: `${month}-paye`,
        month,
        employer: "Employer",
        category: "paye",
        amount: annualPaye / 12,
      });
    }
  }
  return items;
}

function renderResults(
  overrides: Partial<Parameters<typeof assessTax>[0]> = {},
  sarsAssessedTaxPayable: number | undefined = undefined,
  sarsAssessedLineItems: Parameters<typeof assessTax>[0]["sarsAssessedLineItems"] = [],
) {
  const result = assessTax({
    age: 35,
    payslips: flatPayslips(500_000),
    sarsAssessedTaxPayable,
    sarsAssessedLineItems,
    ...overrides,
  });
  const onSarsAssessedTaxPayableChange = vi.fn();
  const onSarsAssessedLineItemsChange = vi.fn();
  render(
    <ResultsStep
      result={result}
      sarsAssessedTaxPayable={sarsAssessedTaxPayable}
      onSarsAssessedTaxPayableChange={onSarsAssessedTaxPayableChange}
      sarsAssessedLineItems={sarsAssessedLineItems ?? []}
      onSarsAssessedLineItemsChange={onSarsAssessedLineItemsChange}
    />,
  );
  return { result, onSarsAssessedTaxPayableChange, onSarsAssessedLineItemsChange };
}

describe("ResultsStep", () => {
  it("shows an amount owed to SARS when tax payable exceeds PAYE paid", () => {
    renderResults();
    expect(screen.getByText(/You owe SARS/)).toBeInTheDocument();
  });

  it("shows a refund when PAYE paid exceeds tax payable", () => {
    renderResults({ payslips: flatPayslips(500_000, 200_000) });
    expect(screen.getByText(/SARS owes you/)).toBeInTheDocument();
  });

  it("shows the provisional taxpayer warning when applicable", () => {
    renderResults({
      payslips: flatPayslips(400_000),
      rentalProperties: [
        { income: 100_000, expenses: 10_000, areaLetFraction: 1, monthsLetFraction: 1 },
      ],
    });
    expect(screen.getByText(/provisional taxpayer/)).toBeInTheDocument();
  });

  it("renders one bracket segment per tax bracket in the marginal rate bar", () => {
    renderResults();
    // 2025/26 has 7 brackets
    expect(screen.getAllByTestId("bracket-segment")).toHaveLength(7);
  });

  it("does not render the SARS comparison table when no figure is supplied", () => {
    renderResults();
    expect(screen.queryByText("Compared to your SARS assessment")).not.toBeInTheDocument();
  });

  it("renders the SARS comparison table when a comparison figure is supplied", () => {
    renderResults({}, 95_000);
    expect(screen.getByText("Compared to your SARS assessment")).toBeInTheDocument();
  });

  it("reports changes to the SARS assessed tax payable input", async () => {
    const user = userEvent.setup();
    const { onSarsAssessedTaxPayableChange } = renderResults();
    await user.type(screen.getByLabelText("SARS assessed tax payable"), "5");
    expect(onSarsAssessedTaxPayableChange).toHaveBeenCalledWith(5);
  });

  it("triggers the browser print dialog when Export / Print is clicked", async () => {
    const user = userEvent.setup();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderResults();

    await user.click(screen.getByRole("button", { name: "Export / Print" }));
    expect(printSpy).toHaveBeenCalledTimes(1);

    printSpy.mockRestore();
  });

  it("renders a print-only summary heading", () => {
    renderResults();
    expect(screen.getByText("SARS Auto-Assessment Calculator")).toBeInTheDocument();
  });

  it("does not render the by-code comparison table when no SARS-assessed line items are entered", () => {
    renderResults();
    expect(screen.queryByText("Compared by SARS code")).not.toBeInTheDocument();
  });

  it("renders the by-code comparison table when SARS-assessed line items are entered", () => {
    renderResults(
      { payslips: [{ id: "1", month: 0, employer: "Old Co", category: "basic_salary", sarsCode: "3601", amount: 47_365 }] },
      undefined,
      [{ sarsCode: "3601", amount: 45_000 }],
    );
    expect(screen.getByText("Compared by SARS code")).toBeInTheDocument();
    expect(screen.getByText("3601")).toBeInTheDocument();
  });

  it("adds a new SARS-assessed line item row", async () => {
    const user = userEvent.setup();
    const { onSarsAssessedLineItemsChange } = renderResults();
    await user.click(screen.getByRole("button", { name: "+ Add SARS code" }));
    expect(onSarsAssessedLineItemsChange).toHaveBeenCalledWith([{ sarsCode: "", amount: 0 }]);
  });

  it("removes a SARS-assessed line item row", async () => {
    const user = userEvent.setup();
    const { onSarsAssessedLineItemsChange } = renderResults({}, undefined, [
      { sarsCode: "3601", amount: 45_000 },
    ]);
    await user.click(screen.getByLabelText("Remove SARS code row 1"));
    expect(onSarsAssessedLineItemsChange).toHaveBeenCalledWith([]);
  });

  it("edits a SARS-assessed line item's code and amount", async () => {
    const user = userEvent.setup();
    const { onSarsAssessedLineItemsChange } = renderResults({}, undefined, [
      { sarsCode: "", amount: 0 },
    ]);
    await user.type(screen.getByLabelText("SARS code row 1"), "3");
    expect(onSarsAssessedLineItemsChange).toHaveBeenCalledWith([{ sarsCode: "3", amount: 0 }]);
  });
});
