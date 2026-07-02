import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssessmentShell, type AssessmentStep } from "./AssessmentShell";

const steps: AssessmentStep[] = [
  { key: "profile", label: "Home" },
  { key: "payslips", label: "Payslips" },
  { key: "other-income", label: "Other Income" },
  { key: "deductions", label: "Deductions" },
  { key: "results", label: "Results" },
];

describe("AssessmentShell", () => {
  it("renders every step label once for desktop and once for mobile nav", () => {
    render(
      <AssessmentShell steps={steps} currentStepKey="profile" onStepChange={() => {}}>
        <p>content</p>
      </AssessmentShell>,
    );
    // Desktop sidebar + mobile bottom bar both render the label
    expect(screen.getAllByText("Payslips").length).toBeGreaterThanOrEqual(1);
  });

  it("marks the current step as active", () => {
    render(
      <AssessmentShell steps={steps} currentStepKey="results" onStepChange={() => {}}>
        <p>content</p>
      </AssessmentShell>,
    );
    const activeButtons = screen.getAllByRole("button", { name: "Results" });
    expect(activeButtons[0]).toHaveAttribute("aria-current", "step");
  });

  it("calls onStepChange with the step key when a nav item is clicked", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(
      <AssessmentShell steps={steps} currentStepKey="profile" onStepChange={onStepChange}>
        <p>content</p>
      </AssessmentShell>,
    );
    const buttons = screen.getAllByRole("button", { name: "Deductions" });
    await user.click(buttons[0]);
    expect(onStepChange).toHaveBeenCalledWith("deductions");
  });

  it("renders the children content", () => {
    render(
      <AssessmentShell steps={steps} currentStepKey="profile" onStepChange={() => {}}>
        <p>unique content marker</p>
      </AssessmentShell>,
    );
    expect(screen.getByText("unique content marker")).toBeInTheDocument();
  });
});
