import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileAndDeductionsStep } from "./ProfileAndDeductionsStep";

function renderStep(overrides: Partial<Parameters<typeof ProfileAndDeductionsStep>[0]> = {}) {
  const handlers = {
    onAgeChange: vi.fn(),
    onMedicalSchemeMembersChange: vi.fn(),
    onAdditionalRetirementContributionsChange: vi.fn(),
    onDonationsChange: vi.fn(),
    onSarsAssessedTaxPayableChange: vi.fn(),
  };
  render(
    <ProfileAndDeductionsStep
      age={0}
      medicalSchemeMembers={0}
      additionalRetirementContributions={0}
      donations={0}
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
});
