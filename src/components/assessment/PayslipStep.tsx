"use client";

import type { LineItemCategory, PayslipLineItem } from "@/lib/tax-engine/payslips";
import {
  BLOCK_CATEGORIES,
  addEmployerBlock,
  getMonthBlocks,
  monthHasData,
  removeEmployerBlock,
  renameEmployerBlock,
  updateBlockCategoryAmount,
} from "./payslipBlocks";
import { PayslipOcrUpload } from "./PayslipOcrUpload";
import { PayslipJsonImport } from "./PayslipJsonImport";

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

const CATEGORY_LABELS: Record<LineItemCategory, string> = {
  basic_salary: "Gross salary",
  bonus: "Bonus",
  allowance: "Allowance",
  paye: "PAYE deducted",
  uif: "UIF",
  employee_retirement_contribution: "Retirement contribution",
  employer_retirement_fringe_benefit: "Employer retirement fringe benefit",
  general_fringe_benefit: "General fringe benefit",
  other_non_tax: "Other (non-tax)",
};

type PayslipStepProps = {
  taxYear: string;
  payslips: PayslipLineItem[];
  anomalousMonths: number[];
  onChange: (payslips: PayslipLineItem[]) => void;
};

function monthStatus(payslips: PayslipLineItem[], month: number, isAnomalous: boolean) {
  if (isAnomalous) return { label: "Unusual", badgeClass: "badge-warning" };
  if (monthHasData(payslips, month)) return { label: "Entered", badgeClass: "badge-success" };
  return { label: "Pending", badgeClass: "badge-ghost" };
}

export function PayslipStep({ taxYear, payslips, anomalousMonths, onChange }: PayslipStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <PayslipJsonImport taxYear={taxYear} payslips={payslips} onChange={onChange} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SA_TAX_YEAR_MONTHS.map((monthLabel, month) => {
        const isAnomalous = anomalousMonths.includes(month);
        const status = monthStatus(payslips, month, isAnomalous);
        const blocks = getMonthBlocks(payslips, month);

        return (
          <div
            key={monthLabel}
            className={`card bg-base-100 shadow-sm ${isAnomalous ? "ring-1 ring-warning" : ""}`}
          >
            <div className="card-body gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">{monthLabel}</span>
                <span className={`badge badge-sm ${status.badgeClass}`}>{status.label}</span>
              </div>

              {isAnomalous && (
                <p className="text-xs text-warning-content bg-warning/20 rounded-field px-2 py-1">
                  Deviates &gt;25% from your yearly average &mdash; bonus month?
                </p>
              )}

              {blocks.length === 0 && (
                <p className="text-xs text-base-content/60">
                  No employer added for this month yet.
                </p>
              )}

              {blocks.map((block, blockIndex) => {
                const labelSuffix = blocks.length > 1 ? ` ${blockIndex + 1}` : "";

                return (
                  <div
                    key={block.blockId}
                    className={
                      blocks.length > 1
                        ? "flex flex-col gap-2 rounded-box border border-base-300 p-3"
                        : "flex flex-col gap-2"
                    }
                  >
                    <div className="flex items-end gap-2">
                      <label className="flex flex-1 flex-col gap-1">
                        <span className="text-xs">Employer</span>
                        <input
                          type="text"
                          className="input input-sm"
                          aria-label={`${monthLabel} employer${labelSuffix}`}
                          value={block.employer}
                          placeholder="e.g. Acme Ltd"
                          onChange={(event) =>
                            onChange(
                              renameEmployerBlock(payslips, block.blockId, event.target.value),
                            )
                          }
                        />
                      </label>
                      {blocks.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-error"
                          aria-label={`Remove ${monthLabel} employer${labelSuffix}`}
                          onClick={() => onChange(removeEmployerBlock(payslips, block.blockId))}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {BLOCK_CATEGORIES.map((category) => {
                      const amount = block.items[category]?.amount ?? 0;

                      return (
                        <label key={category} className="flex flex-col gap-1">
                          <span className="text-xs">{CATEGORY_LABELS[category]}</span>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            className="input input-sm money"
                            aria-label={`${monthLabel} ${category}${labelSuffix}`}
                            value={amount === 0 ? "" : amount}
                            placeholder="0"
                            onChange={(event) =>
                              onChange(
                                updateBlockCategoryAmount(
                                  payslips,
                                  block.blockId,
                                  category,
                                  Number(event.target.value) || 0,
                                ),
                              )
                            }
                          />
                        </label>
                      );
                    })}

                    <details>
                      <summary className="cursor-pointer text-xs text-primary">
                        Scan a payslip image instead
                      </summary>
                      <div className="pt-2">
                        <PayslipOcrUpload
                          onAssign={(category, value) =>
                            onChange(
                              updateBlockCategoryAmount(payslips, block.blockId, category, value),
                            )
                          }
                        />
                      </div>
                    </details>
                  </div>
                );
              })}

              <button
                type="button"
                className="btn btn-outline btn-xs self-start"
                onClick={() => onChange(addEmployerBlock(payslips, month))}
              >
                + Add employer
              </button>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
