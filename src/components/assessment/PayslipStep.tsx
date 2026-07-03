"use client";

import {
  NUMERIC_PAYSLIP_FIELDS,
  hasPayslipData,
  type MonthlyPayslip,
  type NumericPayslipField,
} from "@/lib/tax-engine/payslips";
import { PayslipOcrUpload } from "./PayslipOcrUpload";

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

const FIELD_LABELS: Record<NumericPayslipField, string> = {
  grossSalary: "Gross salary",
  payeDeducted: "PAYE deducted",
  uif: "UIF",
  retirementContribution: "Retirement contribution",
  employerRetirementFringeBenefit: "Employer retirement fringe benefit",
  generalFringeBenefit: "General fringe benefit",
};

type PayslipStepProps = {
  payslips: MonthlyPayslip[];
  anomalousMonths: number[];
  onChange: (index: number, field: NumericPayslipField, value: number) => void;
  onEmployerChange: (index: number, employer: string) => void;
};


function monthStatus(payslip: MonthlyPayslip, isAnomalous: boolean) {
  if (isAnomalous) return { label: "Unusual", badgeClass: "badge-warning" };
  if (hasPayslipData(payslip)) return { label: "Entered", badgeClass: "badge-success" };
  return { label: "Pending", badgeClass: "badge-ghost" };
}

export function PayslipStep({
  payslips,
  anomalousMonths,
  onChange,
  onEmployerChange,
}: PayslipStepProps) {
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

              <label className="flex flex-col gap-1">
                <span className="text-xs">Employer</span>
                <input
                  type="text"
                  className="input input-sm"
                  aria-label={`${SA_TAX_YEAR_MONTHS[index]} employer`}
                  value={payslip.employer ?? ""}
                  placeholder="e.g. Acme Ltd"
                  onChange={(event) => onEmployerChange(index, event.target.value)}
                />
              </label>

              {NUMERIC_PAYSLIP_FIELDS.map((field) => (
                <label key={field} className="flex flex-col gap-1">
                  <span className="text-xs">{FIELD_LABELS[field]}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    className="input input-sm money"
                    aria-label={`${SA_TAX_YEAR_MONTHS[index]} ${field}`}
                    value={payslip[field] === 0 || !payslip[field] ? "" : payslip[field]}
                    placeholder="0"
                    onChange={(event) => onChange(index, field, Number(event.target.value) || 0)}
                  />
                </label>
              ))}

              <details className="mt-1">
                <summary className="cursor-pointer text-xs text-primary">
                  Scan a payslip image instead
                </summary>
                <div className="pt-2">
                  <PayslipOcrUpload
                    onAssign={(field, value) => onChange(index, field, value)}
                  />
                </div>
              </details>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function createEmptyPayslips(): MonthlyPayslip[] {
  return Array.from({ length: 12 }, () => ({
    employer: "",
    grossSalary: 0,
    payeDeducted: 0,
    uif: 0,
    retirementContribution: 0,
    employerRetirementFringeBenefit: 0,
    generalFringeBenefit: 0,
  }));
}
