"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { summarizePayslips, type NumericPayslipField } from "@/lib/tax-engine/payslips";
import { loadStoredFormState, saveFormState } from "@/lib/assessmentStorage";
import { AssessmentShell, type AssessmentStep } from "./AssessmentShell";
import { Stepper } from "./Stepper";
import { PayslipStep } from "./PayslipStep";
import { OtherIncomeStep } from "./OtherIncomeStep";
import { ProfileStep } from "./ProfileStep";
import { DeductionsStep } from "./DeductionsStep";
import { ResultsStep } from "./ResultsStep";
import { computeAssessmentResult, createInitialFormState } from "./formState";

const STEPS: AssessmentStep[] = [
  { key: "profile", label: "Profile" },
  { key: "payslips", label: "Payslips" },
  { key: "other-income", label: "Other Income" },
  { key: "deductions", label: "Deductions" },
  { key: "results", label: "Results" },
];

export function AssessmentWizard() {
  const searchParams = useSearchParams();
  const requestedStep = searchParams?.get("step") ?? null;
  const initialStepKey = STEPS.some((step) => step.key === requestedStep)
    ? requestedStep!
    : STEPS[0].key;

  const [stepKey, setStepKey] = useState<string>(initialStepKey);
  const [form, setForm] = useState(createInitialFormState);
  const hasLoadedFromStorage = useRef(false);

  useEffect(() => {
    // Deliberate one-time hydration from localStorage: SSR has no access to
    // it, so the form must start with defaults and swap in stored data once
    // mounted on the client rather than during the initial render.
    const stored = loadStoredFormState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setForm(stored);
    hasLoadedFromStorage.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    saveFormState(form);
  }, [form]);

  const anomalousMonths = useMemo(
    () => summarizePayslips(form.payslips).anomalousMonths,
    [form.payslips],
  );

  const result = useMemo(() => computeAssessmentResult(form), [form]);

  function updatePayslipField(index: number, field: NumericPayslipField, value: number) {
    setForm((prev) => ({
      ...prev,
      payslips: prev.payslips.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  function updatePayslipEmployer(index: number, employer: string) {
    setForm((prev) => ({
      ...prev,
      payslips: prev.payslips.map((p, i) => (i === index ? { ...p, employer } : p)),
    }));
  }

  const stepIndex = STEPS.findIndex((s) => s.key === stepKey);

  return (
    <AssessmentShell steps={STEPS} currentStepKey={stepKey} onStepChange={setStepKey}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <Stepper steps={STEPS} currentStepKey={stepKey} onStepChange={setStepKey} />

        {stepKey === "profile" && (
          <ProfileStep
            taxYear={form.taxYear}
            age={form.age}
            medicalSchemeMembers={form.medicalSchemeMembers}
            hasDisability={form.hasDisability}
            onTaxYearChange={(taxYear) => setForm((prev) => ({ ...prev, taxYear }))}
            onAgeChange={(age) => setForm((prev) => ({ ...prev, age }))}
            onMedicalSchemeMembersChange={(medicalSchemeMembers) =>
              setForm((prev) => ({ ...prev, medicalSchemeMembers }))
            }
            onHasDisabilityChange={(hasDisability) =>
              setForm((prev) => ({ ...prev, hasDisability }))
            }
          />
        )}

        {stepKey === "payslips" && (
          <PayslipStep
            payslips={form.payslips}
            anomalousMonths={anomalousMonths}
            onChange={updatePayslipField}
            onEmployerChange={updatePayslipEmployer}
          />
        )}

        {stepKey === "other-income" && (
          <OtherIncomeStep
            rentalProperties={form.rentalProperties}
            freelanceIncome={form.freelanceIncome}
            interestIncome={form.interestIncome}
            propertyDisposalProceeds={form.propertyDisposalProceeds}
            propertyDisposalBaseCost={form.propertyDisposalBaseCost}
            isPrimaryResidenceDisposal={form.isPrimaryResidenceDisposal}
            onRentalPropertiesChange={(rentalProperties) =>
              setForm((prev) => ({ ...prev, rentalProperties }))
            }
            onFreelanceIncomeChange={(freelanceIncome) =>
              setForm((prev) => ({ ...prev, freelanceIncome }))
            }
            onInterestIncomeChange={(interestIncome) =>
              setForm((prev) => ({ ...prev, interestIncome }))
            }
            onPropertyDisposalProceedsChange={(propertyDisposalProceeds) =>
              setForm((prev) => ({ ...prev, propertyDisposalProceeds }))
            }
            onPropertyDisposalBaseCostChange={(propertyDisposalBaseCost) =>
              setForm((prev) => ({ ...prev, propertyDisposalBaseCost }))
            }
            onIsPrimaryResidenceDisposalChange={(isPrimaryResidenceDisposal) =>
              setForm((prev) => ({ ...prev, isPrimaryResidenceDisposal }))
            }
          />
        )}

        {stepKey === "deductions" && (
          <DeductionsStep
            annualMedicalContributions={form.annualMedicalContributions}
            outOfPocketMedicalExpenses={form.outOfPocketMedicalExpenses}
            additionalRetirementContributions={form.additionalRetirementContributions}
            donations={form.donations}
            businessKmTravelled={form.businessKmTravelled}
            travelReimbursementRatePerKm={form.travelReimbursementRatePerKm}
            homeOfficeAreaSqm={form.homeOfficeAreaSqm}
            totalHomeAreaSqm={form.totalHomeAreaSqm}
            monthsHomeOfficeUsed={form.monthsHomeOfficeUsed}
            totalHomeExpenses={form.totalHomeExpenses}
            onAnnualMedicalContributionsChange={(annualMedicalContributions) =>
              setForm((prev) => ({ ...prev, annualMedicalContributions }))
            }
            onOutOfPocketMedicalExpensesChange={(outOfPocketMedicalExpenses) =>
              setForm((prev) => ({ ...prev, outOfPocketMedicalExpenses }))
            }
            onAdditionalRetirementContributionsChange={(additionalRetirementContributions) =>
              setForm((prev) => ({ ...prev, additionalRetirementContributions }))
            }
            onDonationsChange={(donations) => setForm((prev) => ({ ...prev, donations }))}
            onBusinessKmTravelledChange={(businessKmTravelled) =>
              setForm((prev) => ({ ...prev, businessKmTravelled }))
            }
            onTravelReimbursementRatePerKmChange={(travelReimbursementRatePerKm) =>
              setForm((prev) => ({ ...prev, travelReimbursementRatePerKm }))
            }
            onHomeOfficeAreaSqmChange={(homeOfficeAreaSqm) =>
              setForm((prev) => ({ ...prev, homeOfficeAreaSqm }))
            }
            onTotalHomeAreaSqmChange={(totalHomeAreaSqm) =>
              setForm((prev) => ({ ...prev, totalHomeAreaSqm }))
            }
            onMonthsHomeOfficeUsedChange={(monthsHomeOfficeUsed) =>
              setForm((prev) => ({ ...prev, monthsHomeOfficeUsed }))
            }
            onTotalHomeExpensesChange={(totalHomeExpenses) =>
              setForm((prev) => ({ ...prev, totalHomeExpenses }))
            }
          />
        )}

        {stepKey === "results" && (
          <ResultsStep
            result={result}
            sarsAssessedTaxPayable={form.sarsAssessedTaxPayable}
            onSarsAssessedTaxPayableChange={(sarsAssessedTaxPayable) =>
              setForm((prev) => ({ ...prev, sarsAssessedTaxPayable }))
            }
          />
        )}

        <div className="flex justify-between pt-2 print:hidden">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={stepIndex === 0}
            onClick={() => setStepKey(STEPS[Math.max(0, stepIndex - 1)].key)}
          >
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={stepIndex === STEPS.length - 1}
            onClick={() => setStepKey(STEPS[Math.min(STEPS.length - 1, stepIndex + 1)].key)}
          >
            Next
          </button>
        </div>
      </div>
    </AssessmentShell>
  );
}
