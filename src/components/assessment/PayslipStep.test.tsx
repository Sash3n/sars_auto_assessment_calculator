import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PayslipStep, createEmptyPayslips } from "./PayslipStep";

describe("PayslipStep", () => {
  it("renders a row for all 12 months of the SA tax year", () => {
    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[]} onChange={() => {}} />,
    );
    expect(screen.getByText("March")).toBeInTheDocument();
    expect(screen.getByText("February")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(13); // header + 12 months
  });

  it("shows an 'unusual' badge only for flagged months", () => {
    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[11]} onChange={() => {}} />,
    );
    expect(screen.getByText("unusual")).toBeInTheDocument();
    expect(screen.getAllByText("unusual")).toHaveLength(1);
  });

  it("calls onChange with the parsed number when a field is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[]} onChange={onChange} />,
    );

    const marchGross = screen.getByLabelText("March grossSalary");
    await user.type(marchGross, "5");

    expect(onChange).toHaveBeenCalledWith(0, "grossSalary", 5);
  });
});
