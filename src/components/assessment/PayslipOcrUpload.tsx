"use client";

import { useState, type ChangeEvent } from "react";
import { extractNumbersFromText, type ExtractedNumber } from "@/lib/ocr/extractNumbers";
import { suggestField } from "@/lib/ocr/suggestField";
import type { LineItemCategory } from "@/lib/tax-engine/payslips";
import { formatCurrency } from "@/lib/format";

const FIELD_OPTIONS: { field: LineItemCategory; label: string }[] = [
  { field: "basic_salary", label: "Gross" },
  { field: "paye", label: "PAYE" },
  { field: "uif", label: "UIF" },
  { field: "employee_retirement_contribution", label: "Retirement" },
  { field: "employer_retirement_fringe_benefit", label: "Employer retirement FB" },
  { field: "general_fringe_benefit", label: "General FB" },
];

type Status = "idle" | "scanning" | "done" | "error";

type PayslipOcrUploadProps = {
  onAssign: (category: LineItemCategory, value: number) => void;
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
        <>
          <p className="text-[11px] text-base-content/50">
            Tip: for Gross salary, use a &ldquo;Total&rdquo; or &ldquo;Gross&rdquo; row rather
            than a single earnings line, so allowances aren&rsquo;t missed &mdash; and for
            Retirement, use your own (employee) contribution, not your employer&rsquo;s.
          </p>
          <ul className="flex flex-col gap-1">
            {numbers.map((n, index) => {
              const suggested = suggestField(n.context);

              return (
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
                        className={`btn btn-xs ${
                          field === suggested ? "btn-primary" : "btn-ghost"
                        }`}
                        onClick={() => onAssign(field, n.value)}
                      >
                        {label}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
