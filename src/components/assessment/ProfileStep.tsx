"use client";

import { TAX_YEAR_TABLES } from "@/lib/tax-engine/tax-tables";

type ProfileStepProps = {
  taxYear: string;
  age: number;
  medicalSchemeMembers: number;
  hasDisability: boolean;
  onTaxYearChange: (value: string) => void;
  onAgeChange: (value: number) => void;
  onMedicalSchemeMembersChange: (value: number) => void;
  onHasDisabilityChange: (value: boolean) => void;
};

export function ProfileStep({
  taxYear,
  age,
  medicalSchemeMembers,
  hasDisability,
  onTaxYearChange,
  onAgeChange,
  onMedicalSchemeMembersChange,
  onHasDisabilityChange,
}: ProfileStepProps) {
  return (
    <section className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <h3 className="card-title text-base">Your profile</h3>
        <div className="flex flex-wrap gap-4">
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">Tax year</span>
            <select
              className="select select-sm"
              aria-label="Tax year"
              value={taxYear}
              onChange={(e) => onTaxYearChange(e.target.value)}
            >
              {Object.keys(TAX_YEAR_TABLES).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">Age (as at end of tax year)</span>
            <input
              type="number"
              min={0}
              className="input input-sm"
              aria-label="Age"
              value={age === 0 ? "" : age}
              onChange={(e) => onAgeChange(Number(e.target.value) || 0)}
            />
          </label>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">Medical scheme members (you + dependants)</span>
            <input
              type="number"
              min={0}
              className="input input-sm"
              aria-label="Medical scheme members"
              value={medicalSchemeMembers === 0 ? "" : medicalSchemeMembers}
              onChange={(e) => onMedicalSchemeMembersChange(Number(e.target.value) || 0)}
            />
          </label>
          <label className="label cursor-pointer gap-2 self-end pb-1">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              aria-label="You, your spouse or your child has a disability"
              checked={hasDisability}
              onChange={(e) => onHasDisabilityChange(e.target.checked)}
            />
            <span className="label-text text-xs">
              You, your spouse or your child has a disability
            </span>
          </label>
        </div>
      </div>
    </section>
  );
}
