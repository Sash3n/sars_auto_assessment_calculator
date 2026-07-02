import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentWizard } from "./AssessmentWizard";

describe("AssessmentWizard", () => {
  it("starts on the Profile step and navigates forward through all steps", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    expect(screen.getByText("Your profile")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("March")).toBeInTheDocument(); // Payslips step

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Rental & property income")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Full breakdown")).toBeInTheDocument();
  });

  it("disables Back on the first step and Next on the last step", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    expect(screen.getByRole("button", { name: "Back" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("flows entered salary data through to the results step", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    await user.type(screen.getByLabelText("Age"), "35");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.type(screen.getByLabelText("March grossSalary"), "50000");
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Next" }));

    // Only one month of income entered - taxable income should reflect it
    expect(screen.getByText("Full breakdown")).toBeInTheDocument();
    expect(screen.getAllByText(/R\s?50\s?000/).length).toBeGreaterThan(0);
  });
});
