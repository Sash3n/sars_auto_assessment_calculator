import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtherIncomeStep, createEmptyRentalProperty } from "./OtherIncomeStep";

function renderStep(overrides: Partial<Parameters<typeof OtherIncomeStep>[0]> = {}) {
  const handlers = {
    onRentalPropertiesChange: vi.fn(),
    onFreelanceIncomeChange: vi.fn(),
    onInterestIncomeChange: vi.fn(),
    onPropertyDisposalProceedsChange: vi.fn(),
    onPropertyDisposalBaseCostChange: vi.fn(),
    onIsPrimaryResidenceDisposalChange: vi.fn(),
  };
  render(
    <OtherIncomeStep
      rentalProperties={[]}
      freelanceIncome={0}
      interestIncome={0}
      propertyDisposalProceeds={0}
      propertyDisposalBaseCost={0}
      isPrimaryResidenceDisposal={false}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("OtherIncomeStep", () => {
  it("shows an empty state when there are no rental properties", () => {
    renderStep();
    expect(screen.getByText("No rental properties added.")).toBeInTheDocument();
  });

  it("adds a new property when 'Add property' is clicked", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.click(screen.getByText("+ Add property"));
    expect(handlers.onRentalPropertiesChange).toHaveBeenCalledWith([
      createEmptyRentalProperty(),
    ]);
  });

  it("removes a property when Remove is clicked", async () => {
    const user = userEvent.setup();
    const handlers = renderStep({
      rentalProperties: [createEmptyRentalProperty(), createEmptyRentalProperty()],
    });
    await user.click(screen.getAllByText("Remove")[0]);
    expect(handlers.onRentalPropertiesChange).toHaveBeenCalledWith([
      createEmptyRentalProperty(),
    ]);
  });

  it("reports freelance income changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();
    await user.type(screen.getByLabelText("Freelance income"), "7");
    expect(handlers.onFreelanceIncomeChange).toHaveBeenCalledWith(7);
  });

  it("reports property disposal field changes", async () => {
    const user = userEvent.setup();
    const handlers = renderStep();

    await user.type(screen.getByLabelText("Disposal proceeds"), "1");
    expect(handlers.onPropertyDisposalProceedsChange).toHaveBeenCalledWith(1);

    await user.type(screen.getByLabelText("Base cost"), "1");
    expect(handlers.onPropertyDisposalBaseCostChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByLabelText("This was my primary residence"));
    expect(handlers.onIsPrimaryResidenceDisposalChange).toHaveBeenCalledWith(true);
  });
});
