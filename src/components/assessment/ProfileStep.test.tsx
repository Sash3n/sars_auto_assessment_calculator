import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileStep } from "./ProfileStep";

function renderStep(overrides: Partial<Parameters<typeof ProfileStep>[0]> = {}) {
  const handlers = {
    onTaxYearChange: vi.fn(),
    onAgeChange: vi.fn(),
    onMedicalSchemeMembersChange: vi.fn(),
    onHasDisabilityChange: vi.fn(),
  };
  render(
    <ProfileStep
      taxYear="2025/26"
      age={0}
      medicalSchemeMembers={0}
      hasDisability={false}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("ProfileStep", () => {
  it("reports age changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Age"), "4");
    expect(handlers.onAgeChange).toHaveBeenCalledWith(4);
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

  it("reports medical scheme members changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Medical scheme members"), "2");
    expect(handlers.onMedicalSchemeMembersChange).toHaveBeenCalledWith(2);
  });
});
