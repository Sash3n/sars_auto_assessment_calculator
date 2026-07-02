"use client";

import type { MonthlyPayslip } from "@/lib/tax-engine/payslips";

const SA_TAX_YEAR_MONTHS = [
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
  "January",
  "February",
];

const FIELD_LABELS: Record<keyof MonthlyPayslip, string> = {
  grossSalary: "Gross salary",
  payeDeducted: "PAYE deducted",
  uif: "UIF",
  retirementContribution: "Retirement contribution",
};

type PayslipStepProps = {
  payslips: MonthlyPayslip[];
  anomalousMonths: number[];
  onChange: (index: number, field: keyof MonthlyPayslip, value: number) => void;
};

function hasAnyData(payslip: MonthlyPayslip): boolean {
  return Object.values(payslip).some((value) => value > 0);
}

function monthStatus(payslip: MonthlyPayslip, isAnomalous: boolean) {
  if (isAnomalous) return { label: "Unusual", badgeClass: "badge-warning" };
  if (hasAnyData(payslip)) return { label: "Entered", badgeClass: "badge-success" };
  return { label: "Pending", badgeClass: "badge-ghost" };
}

export function PayslipStep({ payslips, anomalousMonths, onChange }: PayslipStepProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {payslips.map((payslip, index) => {
        const isAnomalous = anomalousMonths.includes(index);
        const status = monthStatus(payslip, isAnomalous);

        return (
          <div
            key={SA_TAX_YEAR_MONTHS[index]}
            className={`card bg-base-100 shadow-sm ${
              isAnomalous ? "ring-1 ring-warning" : ""
            }`}
          >
            <div className="card-body gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{SA_TAX_YEAR_MONTHS[index]}</span>
                <span className={`badge badge-sm ${status.badgeClass}`}>{status.label}</span>
              </div>

              {isAnomalous && (
                <p className="text-xs text-warning-content bg-warning/20 rounded-field px-2 py-1">
                  Deviates &gt;25% from your yearly average &mdash; bonus month?
                </p>
              )}

              {(["grossSalary", "payeDeducted", "uif", "retirementContribution"] as const).map(
                (field) => (
                  <label key={field} className="flex flex-col gap-1">
                    <span className="text-xs">{FIELD_LABELS[field]}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min={0}
                      className="input input-sm money"
                      aria-label={`${SA_TAX_YEAR_MONTHS[index]} ${field}`}
                      value={payslip[field] === 0 ? "" : payslip[field]}
                      placeholder="0"
                      onChange={(event) =>
                        onChange(index, field, Number(event.target.value) || 0)
                      }
                    />
                  </label>
                ),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function createEmptyPayslips(): MonthlyPayslip[] {
  return Array.from({ length: 12 }, () => ({
    grossSalary: 0,
    payeDeducted: 0,
    uif: 0,
    retirementContribution: 0,
  }));
}
