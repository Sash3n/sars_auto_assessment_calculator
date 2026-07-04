import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentWizard } from "./AssessmentWizard";
import { STORAGE_KEY } from "@/lib/assessmentStorage";

describe("AssessmentWizard", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("hydrates from stored data missing a field added later, without crashing", async () => {
    // Simulates a user's localStorage saved before sarsAssessedLineItems
    // existed -- the field is simply absent from the JSON, not null.
    const storedWithoutNewField = {
      taxYear: "2025/26",
      age: 30,
      medicalSchemeMembers: 0,
      hasDisability: false,
      annualMedicalContributions: 0,
      outOfPocketMedicalExpenses: 0,
      additionalRetirementContributions: 0,
      donations: 0,
      businessKmTravelled: 0,
      travelReimbursementRatePerKm: 0,
      homeOfficeAreaSqm: 0,
      totalHomeAreaSqm: 0,
      monthsHomeOfficeUsed: 0,
      totalHomeExpenses: 0,
      propertyDisposalProceeds: 0,
      propertyDisposalBaseCost: 0,
      isPrimaryResidenceDisposal: false,
      sarsAssessedTaxPayable: undefined,
      payslips: [],
      rentalProperties: [],
      freelanceIncome: 0,
      interestIncome: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storedWithoutNewField));

    const user = userEvent.setup();
    render(<AssessmentWizard />);
    await user.click(screen.getAllByRole("button", { name: "Results" })[0]);

    expect(screen.getByText("Compare by SARS code (optional)")).toBeInTheDocument();
    expect(screen.getByText("No SARS codes added yet.")).toBeInTheDocument();
  });
  it("starts on the Profile step and navigates forward through all steps", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    expect(screen.getByText("Your profile")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("March")).toBeInTheDocument(); // Payslips step

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Rental & property income")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Other deductions")).toBeInTheDocument();

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
    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("jumps directly to a step via the sidebar nav", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    const resultsButtons = screen.getAllByRole("button", { name: "Results" });
    await user.click(resultsButtons[0]);

    expect(screen.getByText("Full breakdown")).toBeInTheDocument();
  });

  it("flows entered salary data through to the results step", async () => {
    const user = userEvent.setup();
    render(<AssessmentWizard />);

    await user.type(screen.getByLabelText("Age"), "35");
    await user.click(screen.getByRole("button", { name: "Next" }));

    await user.click(screen.getAllByText("+ Add employer")[0]);
    await user.type(screen.getByLabelText("March basic_salary"), "50000");

    const resultsButtons = screen.getAllByRole("button", { name: "Results" });
    await user.click(resultsButtons[0]);

    expect(screen.getByText("Full breakdown")).toBeInTheDocument();
    expect(screen.getAllByText(/R\s?50\s?000/).length).toBeGreaterThan(0);
  });
});
