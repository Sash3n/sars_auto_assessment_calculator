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

type PayslipStepProps = {
  payslips: MonthlyPayslip[];
  anomalousMonths: number[];
  onChange: (index: number, field: keyof MonthlyPayslip, value: number) => void;
};

export function PayslipStep({ payslips, anomalousMonths, onChange }: PayslipStepProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Gross salary</th>
            <th>PAYE deducted</th>
            <th>UIF</th>
            <th>Retirement contribution</th>
          </tr>
        </thead>
        <tbody>
          {payslips.map((payslip, index) => (
            <tr key={SA_TAX_YEAR_MONTHS[index]}>
              <td className="whitespace-nowrap">
                {SA_TAX_YEAR_MONTHS[index]}
                {anomalousMonths.includes(index) && (
                  <span
                    className="badge badge-warning badge-sm ml-2"
                    title="This month deviates more than 25% from your yearly average"
                  >
                    unusual
                  </span>
                )}
              </td>
              {(
                ["grossSalary", "payeDeducted", "uif", "retirementContribution"] as const
              ).map((field) => (
                <td key={field}>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    className="input input-bordered input-sm w-32"
                    aria-label={`${SA_TAX_YEAR_MONTHS[index]} ${field}`}
                    value={payslip[field] === 0 ? "" : payslip[field]}
                    placeholder="0"
                    onChange={(event) =>
                      onChange(index, field, Number(event.target.value) || 0)
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
