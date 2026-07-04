import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PayslipJsonImport } from "./PayslipJsonImport";
import { addEmployerBlock, updateBlockCategoryAmount, getMonthBlocks } from "./payslipBlocks";

const VALID_JSON = JSON.stringify({
  schemaVersion: 1,
  lineItems: [{ month: "2025-03", employer: "Acme Ltd", category: "basic_salary", amount: 45000 }],
});

// userEvent.type() treats `{`/`}` as special key syntax, which real JSON is
// full of — paste() inserts the raw string instead.
async function pasteInto(user: ReturnType<typeof userEvent.setup>, text: string) {
  await user.click(screen.getByLabelText("Payslip import JSON"));
  await user.paste(text);
}

describe("PayslipJsonImport", () => {
  it("shows validation errors and no Import button for invalid JSON", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PayslipJsonImport taxYear="2025/26" payslips={[]} onChange={onChange} />);

    await user.click(screen.getByText("Import from JSON"));
    await pasteInto(user, "{not json");
    await user.click(screen.getByRole("button", { name: "Validate" }));

    expect(screen.getByText(/isn't valid JSON/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Import" })).not.toBeInTheDocument();
  });

  it("shows a ready-to-import count and appends by default", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PayslipJsonImport taxYear="2025/26" payslips={[]} onChange={onChange} />);

    await user.click(screen.getByText("Import from JSON"));
    await pasteInto(user, VALID_JSON);
    await user.click(screen.getByRole("button", { name: "Validate" }));

    expect(await screen.findByText(/1 line item.* ready to import/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Import" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const imported = onChange.mock.calls[0][0];
    expect(imported).toHaveLength(1);
    expect(imported[0]).toMatchObject({ employer: "Acme Ltd", amount: 45000 });
  });

  it("appends to existing payslips by default rather than replacing them", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const existing = addEmployerBlock([], 5);

    render(<PayslipJsonImport taxYear="2025/26" payslips={existing} onChange={onChange} />);

    await user.click(screen.getByText("Import from JSON"));
    await pasteInto(user, VALID_JSON);
    await user.click(screen.getByRole("button", { name: "Validate" }));
    await user.click(await screen.findByRole("button", { name: "Import" }));

    const imported = onChange.mock.calls[0][0];
    expect(imported).toHaveLength(6 + 1);
  });

  it("replaces all payslips when Replace is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const blank = addEmployerBlock([], 5);
    const existing = updateBlockCategoryAmount(
      blank,
      getMonthBlocks(blank, 5)[0].blockId,
      "basic_salary",
      1000,
    );

    render(<PayslipJsonImport taxYear="2025/26" payslips={existing} onChange={onChange} />);

    await user.click(screen.getByText("Import from JSON"));
    await pasteInto(user, VALID_JSON);
    await user.click(screen.getByRole("button", { name: "Validate" }));
    await user.click(await screen.findByLabelText("Replace all payslip data"));
    await user.click(screen.getByRole("button", { name: "Import" }));

    const imported = onChange.mock.calls[0][0];
    expect(imported).toHaveLength(1);
  });
});
