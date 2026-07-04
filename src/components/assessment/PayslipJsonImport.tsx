"use client";

import { useState } from "react";
import {
  parsePayslipImportJson,
  type ImportValidationResult,
} from "@/lib/import/payslipImportSchema";
import type { PayslipLineItem } from "@/lib/tax-engine/payslips";

type PayslipJsonImportProps = {
  taxYear: string;
  payslips: PayslipLineItem[];
  onChange: (payslips: PayslipLineItem[]) => void;
};

export function PayslipJsonImport({ taxYear, payslips, onChange }: PayslipJsonImportProps) {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<ImportValidationResult | null>(null);
  const [mode, setMode] = useState<"append" | "replace">("append");

  function handleValidate() {
    setResult(parsePayslipImportJson(raw, taxYear));
  }

  function handleImport() {
    if (!result?.ok) return;
    onChange(mode === "replace" ? result.lineItems : [...payslips, ...result.lineItems]);
    setRaw("");
    setResult(null);
    setMode("append");
  }

  return (
    <details className="rounded-box border border-base-300 p-3">
      <summary className="cursor-pointer text-sm text-primary">Import from JSON</summary>
      <div className="mt-2 flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs">
            Paste JSON matching the payslip import schema (see{" "}
            <code>schema/payslip-import.schema.json</code>)
          </span>
          <textarea
            className="textarea textarea-sm font-mono"
            rows={6}
            aria-label="Payslip import JSON"
            value={raw}
            onChange={(event) => {
              setRaw(event.target.value);
              setResult(null);
            }}
          />
        </label>

        <button type="button" className="btn btn-outline btn-sm self-start" onClick={handleValidate}>
          Validate
        </button>

        {result && !result.ok && (
          <ul className="flex flex-col gap-1 text-xs text-error">
            {result.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        {result?.ok && (
          <div className="flex flex-col gap-2 rounded-box bg-success/10 p-3">
            <p className="text-xs">
              {result.lineItems.length} line item{result.lineItems.length === 1 ? "" : "s"} ready
              to import.
            </p>
            <div className="flex flex-col gap-1 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="radio radio-sm"
                  name="import-mode"
                  checked={mode === "append"}
                  onChange={() => setMode("append")}
                />
                Append to existing payslip data
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="radio radio-sm"
                  name="import-mode"
                  aria-label="Replace all payslip data"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                />
                Replace all payslip data
              </label>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm self-start"
              onClick={handleImport}
            >
              Import
            </button>
          </div>
        )}
      </div>
    </details>
  );
}
