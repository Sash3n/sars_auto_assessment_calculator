import { afterEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Dashboard } from "./Dashboard";
import { saveFormState } from "@/lib/assessmentStorage";
import { createInitialFormState } from "./formState";

afterEach(() => {
  localStorage.clear();
});

describe("Dashboard", () => {
  it("shows the empty-state prompt when no assessment data has been entered", async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Upload 12 months of payslips/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "Start assessment" })).toBeInTheDocument();
  });

  it("shows the refund/owed hero and stat tiles once payslip data exists", async () => {
    const form = {
      ...createInitialFormState(),
      age: 35,
      payslips: [
        {
          id: "0-basic_salary",
          month: 0,
          employer: "Acme Ltd",
          category: "basic_salary" as const,
          amount: 500_000,
        },
      ],
    };
    saveFormState(form);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/You owe SARS/)).toBeInTheDocument();
    });
    expect(screen.getByRole("link", { name: "View calculation" })).toHaveAttribute(
      "href",
      "/assess?step=results",
    );
    expect(screen.getAllByText("Effective tax rate").length).toBeGreaterThan(0);
  });
});
