import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PayslipStep } from "./PayslipStep";
import { addEmployerBlock, getMonthBlocks, renameEmployerBlock } from "./payslipBlocks";
import type { PayslipLineItem } from "@/lib/tax-engine/payslips";

const recognizeMock = vi.fn();

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(async () => ({
    recognize: recognizeMock,
    terminate: vi.fn(),
  })),
}));

describe("PayslipStep", () => {
  it("renders a card for all 12 months of the SA tax year", () => {
    render(<PayslipStep payslips={[]} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getByText("March")).toBeInTheDocument();
    expect(screen.getByText("February")).toBeInTheDocument();
  });

  it("shows a Pending badge and no-employer message for months with no blocks", () => {
    render(<PayslipStep payslips={[]} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getAllByText("Pending")).toHaveLength(12);
    expect(screen.getAllByText("No employer added for this month yet.")).toHaveLength(12);
  });

  it("calls onChange with a new employer block when '+ Add employer' is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PayslipStep payslips={[]} anomalousMonths={[]} onChange={onChange} />);

    await user.click(screen.getAllByText("+ Add employer")[0]);

    const payslips = onChange.mock.calls[0][0] as PayslipLineItem[];
    expect(payslips).toHaveLength(6);
    expect(payslips.every((item) => item.month === 0)).toBe(true);
  });

  it("shows an Entered badge once an amount is filled in for a month's block", () => {
    const payslips = addEmployerBlock([], 0).map((item) =>
      item.category === "basic_salary" ? { ...item, amount: 45_000 } : item,
    );
    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getAllByText("Entered")).toHaveLength(1);
    expect(screen.getAllByText("Pending")).toHaveLength(11);
  });

  it("shows an Entered badge when only an employer name is filled in", () => {
    const blank = addEmployerBlock([], 0);
    const payslips = renameEmployerBlock(blank, getMonthBlocks(blank, 0)[0].blockId, "Acme Ltd");

    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={() => {}} />);
    expect(screen.getAllByText("Entered")).toHaveLength(1);
  });

  it("shows an Unusual badge only for flagged months", () => {
    render(<PayslipStep payslips={[]} anomalousMonths={[11]} onChange={() => {}} />);
    expect(screen.getAllByText("Unusual")).toHaveLength(1);
  });

  it("supports two employer blocks in the same month, labelled distinctly", () => {
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);

    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={() => {}} />);

    expect(screen.getByLabelText("March employer 1")).toBeInTheDocument();
    expect(screen.getByLabelText("March employer 2")).toBeInTheDocument();
    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("calls onChange with the renamed block when the employer field is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const payslips = addEmployerBlock([], 0);
    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={onChange} />);

    await user.type(screen.getByLabelText("March employer"), "A");

    const result = onChange.mock.calls[0][0] as PayslipLineItem[];
    expect(result.every((item) => item.employer === "A")).toBe(true);
  });

  it("calls onChange with the parsed number when a category field is edited", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const payslips = addEmployerBlock([], 0);
    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={onChange} />);

    await user.type(screen.getByLabelText("March basic_salary"), "5");

    const result = onChange.mock.calls[0][0] as PayslipLineItem[];
    expect(result.find((item) => item.category === "basic_salary")?.amount).toBe(5);
  });

  it("removes only the clicked block when Remove is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    let payslips = addEmployerBlock([], 0);
    payslips = addEmployerBlock(payslips, 0);
    const keptBlockId = getMonthBlocks(payslips, 0)[1].blockId;

    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={onChange} />);
    await user.click(screen.getAllByText("Remove")[0]);

    const result = onChange.mock.calls[0][0] as PayslipLineItem[];
    expect(result).toHaveLength(6);
    expect(getMonthBlocks(result, 0)[0].blockId).toBe(keptBlockId);
  });

  it("wires a scanned amount assigned in March's OCR upload to March's block", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    recognizeMock.mockResolvedValue({ data: { text: "Pay as you Earn 3 506.27" } });
    const payslips = addEmployerBlock([], 0);

    render(<PayslipStep payslips={payslips} anomalousMonths={[]} onChange={onChange} />);

    const marchUpload = screen.getAllByLabelText("Upload payslip image")[0];
    const file = new File(["fake"], "payslip.png", { type: "image/png" });
    await user.upload(marchUpload, file);

    await waitFor(() => screen.getAllByText("PAYE")[0]);
    await user.click(screen.getAllByText("PAYE")[0]);

    const result = onChange.mock.calls[0][0] as PayslipLineItem[];
    expect(result.find((item) => item.category === "paye")?.amount).toBe(3_506.27);
  });
});
