"use client";

import { TAX_YEAR_TABLES } from "@/lib/tax-engine/tax-tables";

type ProfileAndDeductionsStepProps = {
  taxYear: string;
  age: number;
  medicalSchemeMembers: number;
  hasDisability: boolean;
  annualMedicalContributions: number;
  outOfPocketMedicalExpenses: number;
  additionalRetirementContributions: number;
  donations: number;
  businessKmTravelled: number;
  travelReimbursementRatePerKm: number;
  sarsAssessedTaxPayable: number | undefined;
  onTaxYearChange: (value: string) => void;
  onAgeChange: (value: number) => void;
  onMedicalSchemeMembersChange: (value: number) => void;
  onHasDisabilityChange: (value: boolean) => void;
  onAnnualMedicalContributionsChange: (value: number) => void;
  onOutOfPocketMedicalExpensesChange: (value: number) => void;
  onAdditionalRetirementContributionsChange: (value: number) => void;
  onDonationsChange: (value: number) => void;
  onBusinessKmTravelledChange: (value: number) => void;
  onTravelReimbursementRatePerKmChange: (value: number) => void;
  onSarsAssessedTaxPayableChange: (value: number | undefined) => void;
};

export function ProfileAndDeductionsStep({
  taxYear,
  age,
  medicalSchemeMembers,
  hasDisability,
  annualMedicalContributions,
  outOfPocketMedicalExpenses,
  additionalRetirementContributions,
  donations,
  businessKmTravelled,
  travelReimbursementRatePerKm,
  sarsAssessedTaxPayable,
  onTaxYearChange,
  onAgeChange,
  onMedicalSchemeMembersChange,
  onHasDisabilityChange,
  onAnnualMedicalContributionsChange,
  onOutOfPocketMedicalExpensesChange,
  onAdditionalRetirementContributionsChange,
  onDonationsChange,
  onBusinessKmTravelledChange,
  onTravelReimbursementRatePerKmChange,
  onSarsAssessedTaxPayableChange,
}: ProfileAndDeductionsStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Your profile</h3>
          <div className="flex flex-wrap gap-4">
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">Tax year</span>
              <select
                className="select select-bordered select-sm"
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
                className="input input-bordered input-sm"
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
                className="input input-bordered input-sm"
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

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Medical expenses</h3>
          <div className="flex flex-wrap gap-4">
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">Annual medical scheme contributions</span>
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm"
                aria-label="Annual medical scheme contributions"
                value={annualMedicalContributions === 0 ? "" : annualMedicalContributions}
                onChange={(e) =>
                  onAnnualMedicalContributionsChange(Number(e.target.value) || 0)
                }
              />
            </label>
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">
                Out-of-pocket medical expenses (not covered by your scheme)
              </span>
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm"
                aria-label="Out-of-pocket medical expenses"
                value={outOfPocketMedicalExpenses === 0 ? "" : outOfPocketMedicalExpenses}
                onChange={(e) =>
                  onOutOfPocketMedicalExpensesChange(Number(e.target.value) || 0)
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Reimbursive travel allowance</h3>
          <p className="text-sm text-base-content/60">
            For business km your employer reimbursed you for directly (not a fixed monthly
            travel allowance).
          </p>
          <div className="flex flex-wrap gap-4">
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">Business km travelled</span>
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm"
                aria-label="Business km travelled"
                value={businessKmTravelled === 0 ? "" : businessKmTravelled}
                onChange={(e) => onBusinessKmTravelledChange(Number(e.target.value) || 0)}
              />
            </label>
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">Rate paid per km</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input input-bordered input-sm"
                aria-label="Rate paid per km"
                value={travelReimbursementRatePerKm === 0 ? "" : travelReimbursementRatePerKm}
                onChange={(e) =>
                  onTravelReimbursementRatePerKmChange(Number(e.target.value) || 0)
                }
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Other deductions</h3>
          <div className="flex flex-wrap gap-4">
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">
                Additional retirement contributions (RA top-ups outside payroll)
              </span>
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm"
                aria-label="Additional retirement contributions"
                value={
                  additionalRetirementContributions === 0 ? "" : additionalRetirementContributions
                }
                onChange={(e) =>
                  onAdditionalRetirementContributionsChange(Number(e.target.value) || 0)
                }
              />
            </label>
            <label className="form-control max-w-xs">
              <span className="label-text text-xs">Donations to registered PBOs (s18A)</span>
              <input
                type="number"
                min={0}
                className="input input-bordered input-sm"
                aria-label="Donations"
                value={donations === 0 ? "" : donations}
                onChange={(e) => onDonationsChange(Number(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Compare to SARS (optional)</h3>
          <p className="text-sm text-base-content/60">
            Enter the &ldquo;tax payable&rdquo; figure from your SARS ITA34 to see the
            difference against this calculation.
          </p>
          <label className="form-control max-w-xs">
            <span className="label-text text-xs">SARS assessed tax payable</span>
            <input
              type="number"
              min={0}
              className="input input-bordered input-sm"
              aria-label="SARS assessed tax payable"
              value={sarsAssessedTaxPayable ?? ""}
              onChange={(e) =>
                onSarsAssessedTaxPayableChange(
                  e.target.value === "" ? undefined : Number(e.target.value) || 0,
                )
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}
