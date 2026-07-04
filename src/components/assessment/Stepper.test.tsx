import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper } from "./Stepper";

const STEPS = [
  { key: "profile", label: "Profile" },
  { key: "payslips", label: "Payslips" },
  { key: "results", label: "Results" },
];

describe("Stepper", () => {
  it("marks the current step with aria-current", () => {
    render(<Stepper steps={STEPS} currentStepKey="payslips" onStepChange={() => {}} />);
    const current = screen.getByText("Payslips").closest("button");
    expect(current).toHaveAttribute("aria-current", "step");
  });

  it("shows step numbers for steps not yet reached", () => {
    render(<Stepper steps={STEPS} currentStepKey="profile" onStepChange={() => {}} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("calls onStepChange when a step is clicked", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    render(<Stepper steps={STEPS} currentStepKey="profile" onStepChange={onStepChange} />);

    await user.click(screen.getByText("Results"));

    expect(onStepChange).toHaveBeenCalledWith("results");
  });
});
