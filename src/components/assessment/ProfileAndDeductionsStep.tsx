"use client";

type ProfileAndDeductionsStepProps = {
  age: number;
  medicalSchemeMembers: number;
  additionalRetirementContributions: number;
  donations: number;
  sarsAssessedTaxPayable: number | undefined;
  onAgeChange: (value: number) => void;
  onMedicalSchemeMembersChange: (value: number) => void;
  onAdditionalRetirementContributionsChange: (value: number) => void;
  onDonationsChange: (value: number) => void;
  onSarsAssessedTaxPayableChange: (value: number | undefined) => void;
};

export function ProfileAndDeductionsStep({
  age,
  medicalSchemeMembers,
  additionalRetirementContributions,
  donations,
  sarsAssessedTaxPayable,
  onAgeChange,
  onMedicalSchemeMembersChange,
  onAdditionalRetirementContributionsChange,
  onDonationsChange,
  onSarsAssessedTaxPayableChange,
}: ProfileAndDeductionsStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Your profile</h3>
          <div className="flex flex-wrap gap-4">
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
          </div>
        </div>
      </section>

      <section className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Deductions</h3>
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
