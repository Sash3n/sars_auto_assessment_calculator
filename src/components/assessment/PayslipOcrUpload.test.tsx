import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PayslipOcrUpload } from "./PayslipOcrUpload";

const recognizeMock = vi.fn();
const terminateMock = vi.fn();

vi.mock("tesseract.js", () => ({
  createWorker: vi.fn(async () => ({
    recognize: recognizeMock,
    terminate: terminateMock,
  })),
}));

function makeImageFile() {
  return new File(["fake-image-bytes"], "payslip.png", { type: "image/png" });
}

describe("PayslipOcrUpload", () => {
  it("shows the privacy note and an idle file input initially", () => {
    render(<PayslipOcrUpload onAssign={() => {}} />);
    expect(screen.getByLabelText("Upload payslip image")).toBeInTheDocument();
    expect(screen.getByText(/never uploaded anywhere/)).toBeInTheDocument();
  });

  it("scans an uploaded image and shows detected amounts as chips", async () => {
    const user = userEvent.setup();
    recognizeMock.mockResolvedValue({
      data: { text: "Pay as you Earn 3 506.27\nUnemployment Insurance Fund 177.12" },
    });

    render(<PayslipOcrUpload onAssign={() => {}} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    await waitFor(() => {
      expect(screen.getByText(/R.3.506/)).toBeInTheDocument();
    });
    expect(screen.getByText(/R.177/)).toBeInTheDocument();
    expect(terminateMock).toHaveBeenCalled();
  });

  it("calls onAssign with the field and value when a chip's field button is clicked", async () => {
    const user = userEvent.setup();
    const onAssign = vi.fn();
    recognizeMock.mockResolvedValue({
      data: { text: "Pay as you Earn 3 506.27" },
    });

    render(<PayslipOcrUpload onAssign={onAssign} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    await waitFor(() => screen.getByText("PAYE"));
    await user.click(screen.getByText("PAYE"));

    expect(onAssign).toHaveBeenCalledWith("payeDeducted", 3_506.27);
  });

  it("highlights the suggested field button for a recognisable label", async () => {
    const user = userEvent.setup();
    recognizeMock.mockResolvedValue({
      data: { text: "PAYE Tax 3,567.16" },
    });

    render(<PayslipOcrUpload onAssign={() => {}} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    const payeButton = await screen.findByText("PAYE");
    expect(payeButton).toHaveClass("btn-primary");
    expect(screen.getByText("Gross")).not.toHaveClass("btn-primary");
  });

  it("does not highlight any field for an itemised earnings line, only a total row", async () => {
    const user = userEvent.setup();
    recognizeMock.mockResolvedValue({
      data: {
        text: ["Basic Salary 18,801.38", "Total Cash Portion 25,511.38"].join("\n"),
      },
    });

    render(<PayslipOcrUpload onAssign={() => {}} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    await waitFor(() => screen.getAllByText("Gross"));
    const grossButtons = screen.getAllByText("Gross");
    expect(grossButtons[0]).not.toHaveClass("btn-primary"); // Basic Salary
    expect(grossButtons[1]).toHaveClass("btn-primary"); // Total Cash Portion
  });

  it("shows a message when no amounts were detected", async () => {
    const user = userEvent.setup();
    recognizeMock.mockResolvedValue({ data: { text: "no numbers here" } });

    render(<PayslipOcrUpload onAssign={() => {}} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    await waitFor(() => {
      expect(screen.getByText(/No amounts detected/)).toBeInTheDocument();
    });
  });

  it("shows an error message when OCR fails", async () => {
    const user = userEvent.setup();
    recognizeMock.mockRejectedValue(new Error("boom"));

    render(<PayslipOcrUpload onAssign={() => {}} />);
    await user.upload(screen.getByLabelText("Upload payslip image"), makeImageFile());

    await waitFor(() => {
      expect(screen.getByText(/Couldn.t read that image/)).toBeInTheDocument();
    });
  });
});
