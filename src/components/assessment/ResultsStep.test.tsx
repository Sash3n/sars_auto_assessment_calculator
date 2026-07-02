import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsStep } from "./ResultsStep";
import { assessTax } from "@/lib/tax-engine/assess";

function flatPayslips(annualGross: number, annualPaye = 0) {
  return Array.from({ length: 12 }, () => ({
    grossSalary: annualGross / 12,
    payeDeducted: annualPaye / 12,
    uif: 0,
    retirementContribution: 0,
  }));
}

describe("ResultsStep", () => {
  it("shows an amount owed to SARS when tax payable exceeds PAYE paid", () => {
    const result = assessTax({ age: 35, payslips: flatPayslips(500_000) });
    render(<ResultsStep result={result} />);
    expect(screen.getByText(/You owe SARS/)).toBeInTheDocument();
  });

  it("shows a refund when PAYE paid exceeds tax payable", () => {
    const result = assessTax({ age: 35, payslips: flatPayslips(500_000, 200_000) });
    render(<ResultsStep result={result} />);
    expect(screen.getByText(/SARS owes you/)).toBeInTheDocument();
  });

  it("shows the provisional taxpayer warning when applicable", () => {
    const result = assessTax({
      age: 35,
      payslips: flatPayslips(400_000),
      rentalProperties: [
        { income: 100_000, expenses: 10_000, areaLetFraction: 1, monthsLetFraction: 1 },
      ],
    });
    render(<ResultsStep result={result} />);
    expect(screen.getByText(/provisional taxpayer/)).toBeInTheDocument();
  });

  it("renders the SARS comparison table when a comparison figure is supplied", () => {
    const result = assessTax({
      age: 35,
      payslips: flatPayslips(500_000),
      sarsAssessedTaxPayable: 95_000,
    });
    render(<ResultsStep result={result} />);
    expect(screen.getByText("Compared to your SARS assessment")).toBeInTheDocument();
  });
});
