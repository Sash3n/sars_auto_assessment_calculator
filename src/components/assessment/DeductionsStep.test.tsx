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
  };
  render(
    <DeductionsStep
      annualMedicalContributions={0}
      outOfPocketMedicalExpenses={0}
      additionalRetirementContributions={0}
      donations={0}
      businessKmTravelled={0}
      travelReimbursementRatePerKm={0}
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
});
