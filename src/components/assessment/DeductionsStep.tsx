"use client";

type DeductionsStepProps = {
  annualMedicalContributions: number;
  outOfPocketMedicalExpenses: number;
  additionalRetirementContributions: number;
  donations: number;
  businessKmTravelled: number;
  travelReimbursementRatePerKm: number;
  onAnnualMedicalContributionsChange: (value: number) => void;
  onOutOfPocketMedicalExpensesChange: (value: number) => void;
  onAdditionalRetirementContributionsChange: (value: number) => void;
  onDonationsChange: (value: number) => void;
  onBusinessKmTravelledChange: (value: number) => void;
  onTravelReimbursementRatePerKmChange: (value: number) => void;
};

export function DeductionsStep({
  annualMedicalContributions,
  outOfPocketMedicalExpenses,
  additionalRetirementContributions,
  donations,
  businessKmTravelled,
  travelReimbursementRatePerKm,
  onAnnualMedicalContributionsChange,
  onOutOfPocketMedicalExpensesChange,
  onAdditionalRetirementContributionsChange,
  onDonationsChange,
  onBusinessKmTravelledChange,
  onTravelReimbursementRatePerKmChange,
}: DeductionsStepProps) {
  return (
    <div className="flex flex-col gap-6">
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
    </div>
  );
}
