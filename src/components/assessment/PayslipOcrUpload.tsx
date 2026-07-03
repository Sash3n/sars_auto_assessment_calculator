"use client";

import { useState, type ChangeEvent } from "react";
import { extractNumbersFromText, type ExtractedNumber } from "@/lib/ocr/extractNumbers";
import type { MonthlyPayslip } from "@/lib/tax-engine/payslips";
import { formatCurrency } from "@/lib/format";

const FIELD_OPTIONS: { field: keyof MonthlyPayslip; label: string }[] = [
  { field: "grossSalary", label: "Gross" },
  { field: "payeDeducted", label: "PAYE" },
  { field: "uif", label: "UIF" },
  { field: "retirementContribution", label: "Retirement" },
];

type Status = "idle" | "scanning" | "done" | "error";

type PayslipOcrUploadProps = {
  onAssign: (field: keyof MonthlyPayslip, value: number) => void;
};

export function PayslipOcrUpload({ onAssign }: PayslipOcrUploadProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [numbers, setNumbers] = useState<ExtractedNumber[]>([]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus("scanning");
    setNumbers([]);

    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();
      setNumbers(extractNumbersFromText(text));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs">Scan a payslip image (optional)</span>
        <input
          type="file"
          accept="image/*"
          className="file-input file-input-sm"
          aria-label="Upload payslip image"
          onChange={handleFileChange}
        />
      </label>
      <p className="text-[11px] text-base-content/50">
        Processed entirely in your browser &mdash; the image is never uploaded anywhere.
      </p>

      {status === "scanning" && (
        <p className="flex items-center gap-2 text-xs text-base-content/60">
          <span className="loading loading-spinner loading-xs" /> Scanning&hellip;
        </p>
      )}

      {status === "error" && (
        <p className="text-xs text-error">
          Couldn&rsquo;t read that image. Try a clearer photo or enter values manually.
        </p>
      )}

      {status === "done" && numbers.length === 0 && (
        <p className="text-xs text-base-content/60">
          No amounts detected. Try a clearer image or enter values manually.
        </p>
      )}

      {numbers.length > 0 && (
        <ul className="flex flex-col gap-1">
          {numbers.map((n, index) => (
            <li
              key={index}
              className="flex flex-wrap items-center gap-2 rounded-field border border-base-300 px-2 py-1 text-xs"
            >
              <span className="money font-medium">{formatCurrency(n.value)}</span>
              <span className="truncate text-base-content/50">{n.context}</span>
              <span className="ml-auto flex gap-1">
                {FIELD_OPTIONS.map(({ field, label }) => (
                  <button
                    key={field}
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={() => onAssign(field, n.value)}
                  >
                    {label}
                  </button>
                ))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
