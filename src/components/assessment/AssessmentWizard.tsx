"use client";

import { useMemo, useState } from "react";
import { assessTax } from "@/lib/tax-engine/assess";
import { summarizePayslips, type MonthlyPayslip } from "@/lib/tax-engine/payslips";
import type { RentalProperty } from "@/lib/tax-engine/rental";
import { DEFAULT_TAX_YEAR } from "@/lib/tax-engine/tax-tables";
import { PayslipStep, createEmptyPayslips } from "./PayslipStep";
import { OtherIncomeStep } from "./OtherIncomeStep";
import { ProfileAndDeductionsStep } from "./ProfileAndDeductionsStep";
import { ResultsStep } from "./ResultsStep";

const STEPS = ["Profile", "Payslips", "Other income", "Results"] as const;

type FormState = {
  age: number;
  medicalSchemeMembers: number;
  additionalRetirementContributions: number;
  donations: number;
  sarsAssessedTaxPayable: number | undefined;
  payslips: MonthlyPayslip[];
  rentalProperties: RentalProperty[];
  freelanceIncome: number;
  interestIncome: number;
};

function createInitialState(): FormState {
  return {
    age: 0,
    medicalSchemeMembers: 0,
    additionalRetirementContributions: 0,
    donations: 0,
    sarsAssessedTaxPayable: undefined,
    payslips: createEmptyPayslips(),
    rentalProperties: [],
    freelanceIncome: 0,
    interestIncome: 0,
  };
}

export function AssessmentWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(createInitialState);

  const anomalousMonths = useMemo(
    () => summarizePayslips(form.payslips).anomalousMonths,
    [form.payslips],
  );

  const result = useMemo(
    () =>
      assessTax({
        taxYear: DEFAULT_TAX_YEAR,
        age: form.age,
        payslips: form.payslips,
        rentalProperties: form.rentalProperties,
        freelanceIncome: form.freelanceIncome,
        interestIncome: form.interestIncome,
        medicalSchemeMembers: form.medicalSchemeMembers,
        additionalRetirementContributions: form.additionalRetirementContributions,
        donations: form.donations,
        sarsAssessedTaxPayable: form.sarsAssessedTaxPayable,
      }),
    [form],
  );

  function updatePayslipField(index: number, field: keyof MonthlyPayslip, value: number) {
    setForm((prev) => ({
      ...prev,
      payslips: prev.payslips.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <ul className="steps w-full">
        {STEPS.map((label, index) => (
          <li key={label} className={`step ${index <= step ? "step-primary" : ""}`}>
            {label}
          </li>
        ))}
      </ul>

      {step === 0 && (
        <ProfileAndDeductionsStep
          age={form.age}
          medicalSchemeMembers={form.medicalSchemeMembers}
          additionalRetirementContributions={form.additionalRetirementContributions}
          donations={form.donations}
          sarsAssessedTaxPayable={form.sarsAssessedTaxPayable}
          onAgeChange={(age) => setForm((prev) => ({ ...prev, age }))}
          onMedicalSchemeMembersChange={(medicalSchemeMembers) =>
            setForm((prev) => ({ ...prev, medicalSchemeMembers }))
          }
          onAdditionalRetirementContributionsChange={(additionalRetirementContributions) =>
            setForm((prev) => ({ ...prev, additionalRetirementContributions }))
          }
          onDonationsChange={(donations) => setForm((prev) => ({ ...prev, donations }))}
          onSarsAssessedTaxPayableChange={(sarsAssessedTaxPayable) =>
            setForm((prev) => ({ ...prev, sarsAssessedTaxPayable }))
          }
        />
      )}

      {step === 1 && (
        <PayslipStep
          payslips={form.payslips}
          anomalousMonths={anomalousMonths}
          onChange={updatePayslipField}
        />
      )}

      {step === 2 && (
        <OtherIncomeStep
          rentalProperties={form.rentalProperties}
          freelanceIncome={form.freelanceIncome}
          interestIncome={form.interestIncome}
          onRentalPropertiesChange={(rentalProperties) =>
            setForm((prev) => ({ ...prev, rentalProperties }))
          }
          onFreelanceIncomeChange={(freelanceIncome) =>
            setForm((prev) => ({ ...prev, freelanceIncome }))
          }
          onInterestIncomeChange={(interestIncome) =>
            setForm((prev) => ({ ...prev, interestIncome }))
          }
        />
      )}

      {step === 3 && <ResultsStep result={result} />}

      <div className="flex justify-between pt-2">
        <button
          type="button"
          className="btn btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={step === STEPS.length - 1}
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
