import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PayslipStep, createEmptyPayslips } from "./PayslipStep";

const recognizeMock = vi.fn();

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(async () => ({
    recognize: recognizeMock,
    terminate: vi.fn(),
  })),
}));

describe("PayslipStep", () => {
  it("renders a card for all 12 months of the SA tax year", () => {
    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[]} onChange={() => {}} />,
    );
    expect(screen.getByText("March")).toBeInTheDocument();
    expect(screen.getByText("February")).toBeInTheDocument();
  });

  it("shows a Pending badge for months with no data entered", () => {
    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[]} onChange={() => {}} />,
    );
    expect(screen.getAllByText("Pending")).toHaveLength(12);
  });

  it("shows an Entered badge once gross salary is filled in", () => {
    const payslips = createEmptyPayslips();
    payslips[0] = { ...payslips[0], grossSalary: 45000 };
    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getAllByText("Entered")).toHaveLength(1);
    expect(screen.getAllByText("Pending")).toHaveLength(11);
  });

  it("shows an Entered badge when only PAYE/UIF/retirement data is filled in, without gross salary", () => {
    const payslips = createEmptyPayslips();
    payslips[0] = { ...payslips[0], payeDeducted: 5000, uif: 200, retirementContribution: 1000 };
    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getAllByText("Entered")).toHaveLength(1);
    expect(screen.getAllByText("Pending")).toHaveLength(11);
  });

  it("shows an Unusual badge only for flagged months", () => {
    const payslips = createEmptyPayslips();
    payslips[11] = { ...payslips[11], grossSalary: 90000 };
    render(<PayslipStep payslips={payslips} anomalousMonths={[11]} onChange={() => {}} />);
    expect(screen.getAllByText("Unusual")).toHaveLength(1);
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

  it("wires a scanned amount assigned in March's OCR upload to March's onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    recognizeMock.mockResolvedValue({ data: { text: "Pay as you Earn 3 506.27" } });

    render(
      <PayslipStep payslips={createEmptyPayslips()} anomalousMonths={[]} onChange={onChange} />,
    );

    const marchUpload = screen.getAllByLabelText("Upload payslip image")[0];
    const file = new File(["fake"], "payslip.png", { type: "image/png" });
    await user.upload(marchUpload, file);

    await waitFor(() => screen.getAllByText("PAYE")[0]);
    await user.click(screen.getAllByText("PAYE")[0]);

    expect(onChange).toHaveBeenCalledWith(0, "payeDeducted", 3_506.27);
  });
});
