import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileAndDeductionsStep } from "./ProfileAndDeductionsStep";

function renderStep(overrides: Partial<Parameters<typeof ProfileAndDeductionsStep>[0]> = {}) {
  const handlers = {
    onTaxYearChange: vi.fn(),
    onAgeChange: vi.fn(),
    onMedicalSchemeMembersChange: vi.fn(),
    onHasDisabilityChange: vi.fn(),
    onAnnualMedicalContributionsChange: vi.fn(),
    onOutOfPocketMedicalExpensesChange: vi.fn(),
    onAdditionalRetirementContributionsChange: vi.fn(),
    onDonationsChange: vi.fn(),
    onBusinessKmTravelledChange: vi.fn(),
    onTravelReimbursementRatePerKmChange: vi.fn(),
    onSarsAssessedTaxPayableChange: vi.fn(),
  };
  render(
    <ProfileAndDeductionsStep
      taxYear="2025/26"
      age={0}
      medicalSchemeMembers={0}
      hasDisability={false}
      annualMedicalContributions={0}
      outOfPocketMedicalExpenses={0}
      additionalRetirementContributions={0}
      donations={0}
      businessKmTravelled={0}
      travelReimbursementRatePerKm={0}
      sarsAssessedTaxPayable={undefined}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("ProfileAndDeductionsStep", () => {
  it("reports age changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Age"), "4");
    expect(handlers.onAgeChange).toHaveBeenCalledWith(4);
  });

  it("clears the SARS comparison figure when the field is emptied", async () => {
    const user = userEvent.setup();
    const handlers = renderStep({ sarsAssessedTaxPayable: 5000 });
    const field = screen.getByLabelText("SARS assessed tax payable");
    await user.clear(field);
    expect(handlers.onSarsAssessedTaxPayableChange).toHaveBeenCalledWith(undefined);
  });

  it("reports tax year changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.selectOptions(screen.getByLabelText("Tax year"), "2026/27");
    expect(handlers.onTaxYearChange).toHaveBeenCalledWith("2026/27");
  });

  it("reports the disability checkbox toggling", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.click(screen.getByLabelText(/disability/i));
    expect(handlers.onHasDisabilityChange).toHaveBeenCalledWith(true);
  });

  it("reports business km and travel rate changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Business km travelled"), "8");
    expect(handlers.onBusinessKmTravelledChange).toHaveBeenCalledWith(8);

    await user.type(screen.getByLabelText("Rate paid per km"), "6");
    expect(handlers.onTravelReimbursementRatePerKmChange).toHaveBeenCalledWith(6);
  });
});
