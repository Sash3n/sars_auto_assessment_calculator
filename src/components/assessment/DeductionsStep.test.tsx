import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeductionsStep } from "./DeductionsStep";

function renderStep(overrides: Partial<Parameters<typeof DeductionsStep>[0]> = {}) {
  const handlers = {
    onAnnualMedicalContributionsChange: vi.fn(),
    onOutOfPocketMedicalExpensesChange: vi.fn(),
    onAdditionalRetirementContributionsChange: vi.fn(),
    onDonationsChange: vi.fn(),
    onBusinessKmTravelledChange: vi.fn(),
    onTravelReimbursementRatePerKmChange: vi.fn(),
    onHomeOfficeAreaSqmChange: vi.fn(),
    onTotalHomeAreaSqmChange: vi.fn(),
    onMonthsHomeOfficeUsedChange: vi.fn(),
    onTotalHomeExpensesChange: vi.fn(),
  };
  render(
    <DeductionsStep
      annualMedicalContributions={0}
      outOfPocketMedicalExpenses={0}
      additionalRetirementContributions={0}
      donations={0}
      businessKmTravelled={0}
      travelReimbursementRatePerKm={0}
      homeOfficeAreaSqm={0}
      totalHomeAreaSqm={0}
      monthsHomeOfficeUsed={0}
      totalHomeExpenses={0}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("DeductionsStep", () => {
  it("reports additional retirement contribution changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Additional retirement contributions"), "5");
    expect(handlers.onAdditionalRetirementContributionsChange).toHaveBeenCalledWith(5);
  });

  it("reports donations changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Donations"), "3");
    expect(handlers.onDonationsChange).toHaveBeenCalledWith(3);
  });

  it("reports business km and travel rate changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Business km travelled"), "8");
    expect(handlers.onBusinessKmTravelledChange).toHaveBeenCalledWith(8);

    await user.type(screen.getByLabelText("Rate paid per km"), "6");
    expect(handlers.onTravelReimbursementRatePerKmChange).toHaveBeenCalledWith(6);
  });

  it("reports medical contribution and out-of-pocket expense changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Annual medical scheme contributions"), "9");
    expect(handlers.onAnnualMedicalContributionsChange).toHaveBeenCalledWith(9);

    await user.type(screen.getByLabelText("Out-of-pocket medical expenses"), "1");
    expect(handlers.onOutOfPocketMedicalExpensesChange).toHaveBeenCalledWith(1);
  });

  it("reports home office field changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();

    await user.type(screen.getByLabelText("Home office area (m²)"), "1");
    expect(handlers.onHomeOfficeAreaSqmChange).toHaveBeenCalledWith(1);

    await user.type(screen.getByLabelText("Total home area (m²)"), "1");
    expect(handlers.onTotalHomeAreaSqmChange).toHaveBeenCalledWith(1);

    await user.type(screen.getByLabelText("Months used for work"), "1");
    expect(handlers.onMonthsHomeOfficeUsedChange).toHaveBeenCalledWith(1);

    await user.type(screen.getByLabelText("Total home running costs for the year"), "5");
    expect(handlers.onTotalHomeExpensesChange).toHaveBeenCalledWith(5);
  });

  it("shows the eligibility advisory only once a home office deduction is entered", () => {
    const { rerender } = render(
      <DeductionsStep
        annualMedicalContributions={0}
        outOfPocketMedicalExpenses={0}
        additionalRetirementContributions={0}
        donations={0}
        businessKmTravelled={0}
        travelReimbursementRatePerKm={0}
        homeOfficeAreaSqm={0}
        totalHomeAreaSqm={0}
        monthsHomeOfficeUsed={0}
        totalHomeExpenses={0}
        onAnnualMedicalContributionsChange={() => {}}
        onOutOfPocketMedicalExpensesChange={() => {}}
        onAdditionalRetirementContributionsChange={() => {}}
        onDonationsChange={() => {}}
        onBusinessKmTravelledChange={() => {}}
        onTravelReimbursementRatePerKmChange={() => {}}
        onHomeOfficeAreaSqmChange={() => {}}
        onTotalHomeAreaSqmChange={() => {}}
        onMonthsHomeOfficeUsedChange={() => {}}
        onTotalHomeExpensesChange={() => {}}
      />,
    );
    expect(screen.queryByText(/more than half/)).not.toBeInTheDocument();

    rerender(
      <DeductionsStep
        annualMedicalContributions={0}
        outOfPocketMedicalExpenses={0}
        additionalRetirementContributions={0}
        donations={0}
        businessKmTravelled={0}
        travelReimbursementRatePerKm={0}
        homeOfficeAreaSqm={15}
        totalHomeAreaSqm={150}
        monthsHomeOfficeUsed={12}
        totalHomeExpenses={120000}
        onAnnualMedicalContributionsChange={() => {}}
        onOutOfPocketMedicalExpensesChange={() => {}}
        onAdditionalRetirementContributionsChange={() => {}}
        onDonationsChange={() => {}}
        onBusinessKmTravelledChange={() => {}}
        onTravelReimbursementRatePerKmChange={() => {}}
        onHomeOfficeAreaSqmChange={() => {}}
        onTotalHomeAreaSqmChange={() => {}}
        onMonthsHomeOfficeUsedChange={() => {}}
        onTotalHomeExpensesChange={() => {}}
      />,
    );
    expect(screen.getByText(/more than half/)).toBeInTheDocument();
  });
});
