import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultsStep } from "./ResultsStep";
import { assessTax } from "@/lib/tax-engine/assess";
import { monthlyPayslipsToLineItems } from "@/lib/tax-engine/payslips";

function flatPayslips(annualGross: number, annualPaye = 0) {
  const monthly = Array.from({ length: 12 }, () => ({
    grossSalary: annualGross / 12,
    payeDeducted: annualPaye / 12,
    uif: 0,
    retirementContribution: 0,
  }));
  return monthlyPayslipsToLineItems(monthly);
}

function renderResults(
  overrides: Partial<Parameters<typeof assessTax>[0]> = {},
  sarsAssessedTaxPayable: number | undefined = undefined,
) {
  const result = assessTax({
    age: 35,
    payslips: flatPayslips(500_000),
    sarsAssessedTaxPayable,
    ...overrides,
  });
  const onSarsAssessedTaxPayableChange = vi.fn();
  render(
    <ResultsStep
      result={result}
      sarsAssessedTaxPayable={sarsAssessedTaxPayable}
      onSarsAssessedTaxPayableChange={onSarsAssessedTaxPayableChange}
    />,
  );
  return { result, onSarsAssessedTaxPayableChange };
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
});
