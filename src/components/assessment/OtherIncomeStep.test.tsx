import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtherIncomeStep, createEmptyRentalProperty } from "./OtherIncomeStep";

describe("OtherIncomeStep", () => {
  it("shows an empty state when there are no rental properties", () => {
    render(
      <OtherIncomeStep
        rentalProperties={[]}
        freelanceIncome={0}
        interestIncome={0}
        onRentalPropertiesChange={() => {}}
        onFreelanceIncomeChange={() => {}}
        onInterestIncomeChange={() => {}}
      />,
    );
    expect(screen.getByText("No rental properties added.")).toBeInTheDocument();
  });

  it("adds a new property when 'Add property' is clicked", async () => {
    const user = userEvent.setup();
    const onRentalPropertiesChange = vi.fn();
    render(
      <OtherIncomeStep
        rentalProperties={[]}
        freelanceIncome={0}
        interestIncome={0}
        onRentalPropertiesChange={onRentalPropertiesChange}
        onFreelanceIncomeChange={() => {}}
        onInterestIncomeChange={() => {}}
      />,
    );

    await user.click(screen.getByText("+ Add property"));
    expect(onRentalPropertiesChange).toHaveBeenCalledWith([createEmptyRentalProperty()]);
  });

  it("removes a property when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onRentalPropertiesChange = vi.fn();
    render(
      <OtherIncomeStep
        rentalProperties={[createEmptyRentalProperty(), createEmptyRentalProperty()]}
        freelanceIncome={0}
        interestIncome={0}
        onRentalPropertiesChange={onRentalPropertiesChange}
        onFreelanceIncomeChange={() => {}}
        onInterestIncomeChange={() => {}}
      />,
    );

    await user.click(screen.getAllByText("Remove")[0]);
    expect(onRentalPropertiesChange).toHaveBeenCalledWith([createEmptyRentalProperty()]);
  });

  it("reports freelance income changes", async () => {
    const user = userEvent.setup();
    const onFreelanceIncomeChange = vi.fn();
    render(
      <OtherIncomeStep
        rentalProperties={[]}
        freelanceIncome={0}
        interestIncome={0}
        onRentalPropertiesChange={() => {}}
        onFreelanceIncomeChange={onFreelanceIncomeChange}
        onInterestIncomeChange={() => {}}
      />,
    );

    await user.type(screen.getByLabelText("Freelance income"), "7");
    expect(onFreelanceIncomeChange).toHaveBeenCalledWith(7);
  });
});
