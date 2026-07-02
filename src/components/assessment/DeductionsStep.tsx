"use client";

type DeductionsStepProps = {
  annualMedicalContributions: number;
  outOfPocketMedicalExpenses: number;
  additionalRetirementContributions: number;
  donations: number;
  businessKmTravelled: number;
  travelReimbursementRatePerKm: number;
  homeOfficeAreaSqm: number;
  totalHomeAreaSqm: number;
  monthsHomeOfficeUsed: number;
  totalHomeExpenses: number;
  onAnnualMedicalContributionsChange: (value: number) => void;
  onOutOfPocketMedicalExpensesChange: (value: number) => void;
  onAdditionalRetirementContributionsChange: (value: number) => void;
  onDonationsChange: (value: number) => void;
  onBusinessKmTravelledChange: (value: number) => void;
  onTravelReimbursementRatePerKmChange: (value: number) => void;
  onHomeOfficeAreaSqmChange: (value: number) => void;
  onTotalHomeAreaSqmChange: (value: number) => void;
  onMonthsHomeOfficeUsedChange: (value: number) => void;
  onTotalHomeExpensesChange: (value: number) => void;
};

export function DeductionsStep({
  annualMedicalContributions,
  outOfPocketMedicalExpenses,
  additionalRetirementContributions,
  donations,
  businessKmTravelled,
  travelReimbursementRatePerKm,
  homeOfficeAreaSqm,
  totalHomeAreaSqm,
  monthsHomeOfficeUsed,
  totalHomeExpenses,
  onAnnualMedicalContributionsChange,
  onOutOfPocketMedicalExpensesChange,
  onAdditionalRetirementContributionsChange,
  onDonationsChange,
  onBusinessKmTravelledChange,
  onTravelReimbursementRatePerKmChange,
  onHomeOfficeAreaSqmChange,
  onTotalHomeAreaSqmChange,
  onMonthsHomeOfficeUsedChange,
  onTotalHomeExpensesChange,
}: DeductionsStepProps) {
  const hasHomeOfficeData =
    homeOfficeAreaSqm > 0 || totalHomeAreaSqm > 0 || monthsHomeOfficeUsed > 0 || totalHomeExpenses > 0;
  return (
    <div className="flex flex-col gap-6">
      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Medical expenses</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Annual medical scheme contributions</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Annual medical scheme contributions"
                value={annualMedicalContributions === 0 ? "" : annualMedicalContributions}
                onChange={(e) =>
                  onAnnualMedicalContributionsChange(Number(e.target.value) || 0)
                }
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">
                Out-of-pocket medical expenses (not covered by your scheme)
              </span>
              <input
                type="number"
                min={0}
                className="input input-sm"
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
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Business km travelled</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Business km travelled"
                value={businessKmTravelled === 0 ? "" : businessKmTravelled}
                onChange={(e) => onBusinessKmTravelledChange(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Rate paid per km</span>
              <input
                type="number"
                min={0}
                step="0.01"
                className="input input-sm"
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
          <h3 className="card-title text-base">Home office</h3>
          {hasHomeOfficeData && (
            <p className="text-xs text-warning-content bg-warning/20 rounded-field px-2 py-1">
              This deduction only qualifies if you worked from home for more than half your
              total working time, in a space used regularly and exclusively for work. Confirm
              you meet SARS&rsquo;s eligibility rules before claiming it.
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Home office area (m²)</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Home office area (m²)"
                value={homeOfficeAreaSqm === 0 ? "" : homeOfficeAreaSqm}
                onChange={(e) => onHomeOfficeAreaSqmChange(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Total home area (m²)</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Total home area (m²)"
                value={totalHomeAreaSqm === 0 ? "" : totalHomeAreaSqm}
                onChange={(e) => onTotalHomeAreaSqmChange(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Months used for work</span>
              <input
                type="number"
                min={0}
                max={12}
                className="input input-sm"
                aria-label="Months used for work"
                value={monthsHomeOfficeUsed === 0 ? "" : monthsHomeOfficeUsed}
                onChange={(e) => onMonthsHomeOfficeUsedChange(Number(e.target.value) || 0)}
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Total home running costs for the year</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Total home running costs for the year"
                value={totalHomeExpenses === 0 ? "" : totalHomeExpenses}
                onChange={(e) => onTotalHomeExpensesChange(Number(e.target.value) || 0)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Other deductions</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">
                Additional retirement contributions (RA top-ups outside payroll)
              </span>
              <input
                type="number"
                min={0}
                className="input input-sm"
                aria-label="Additional retirement contributions"
                value={
                  additionalRetirementContributions === 0 ? "" : additionalRetirementContributions
                }
                onChange={(e) =>
                  onAdditionalRetirementContributionsChange(Number(e.target.value) || 0)
                }
              />
            </label>
            <label className="flex flex-col gap-1 max-w-xs">
              <span className="text-xs">Donations to registered PBOs (s18A)</span>
              <input
                type="number"
                min={0}
                className="input input-sm"
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
