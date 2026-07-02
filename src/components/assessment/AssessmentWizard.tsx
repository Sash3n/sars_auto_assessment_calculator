"use client";

import { useMemo, useState } from "react";
import { assessTax } from "@/lib/tax-engine/assess";
import { summarizePayslips, type MonthlyPayslip } from "@/lib/tax-engine/payslips";
import type { RentalProperty } from "@/lib/tax-engine/rental";
import { DEFAULT_TAX_YEAR } from "@/lib/tax-engine/tax-tables";
import { AssessmentShell, type AssessmentStep } from "./AssessmentShell";
import { PayslipStep, createEmptyPayslips } from "./PayslipStep";
import { OtherIncomeStep } from "./OtherIncomeStep";
import { ProfileStep } from "./ProfileStep";
import { DeductionsStep } from "./DeductionsStep";
import { ResultsStep } from "./ResultsStep";

const STEPS: AssessmentStep[] = [
  { key: "profile", label: "Profile" },
  { key: "payslips", label: "Payslips" },
  { key: "other-income", label: "Other Income" },
  { key: "deductions", label: "Deductions" },
  { key: "results", label: "Results" },
];

type FormState = {
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
  homeOfficeAreaSqm: number;
  totalHomeAreaSqm: number;
  monthsHomeOfficeUsed: number;
  totalHomeExpenses: number;
  sarsAssessedTaxPayable: number | undefined;
  payslips: MonthlyPayslip[];
  rentalProperties: RentalProperty[];
  freelanceIncome: number;
  interestIncome: number;
};

function createInitialState(): FormState {
  return {
    taxYear: DEFAULT_TAX_YEAR,
    age: 0,
    medicalSchemeMembers: 0,
    hasDisability: false,
    annualMedicalContributions: 0,
    outOfPocketMedicalExpenses: 0,
    additionalRetirementContributions: 0,
    donations: 0,
    businessKmTravelled: 0,
    travelReimbursementRatePerKm: 0,
    homeOfficeAreaSqm: 0,
    totalHomeAreaSqm: 0,
    monthsHomeOfficeUsed: 0,
    totalHomeExpenses: 0,
    sarsAssessedTaxPayable: undefined,
    payslips: createEmptyPayslips(),
    rentalProperties: [],
    freelanceIncome: 0,
    interestIncome: 0,
  };
}

export function AssessmentWizard() {
  const [stepKey, setStepKey] = useState<string>(STEPS[0].key);
  const [form, setForm] = useState<FormState>(createInitialState);

  const anomalousMonths = useMemo(
    () => summarizePayslips(form.payslips).anomalousMonths,
    [form.payslips],
  );

  const result = useMemo(
    () =>
      assessTax({
        taxYear: form.taxYear,
        age: form.age,
        payslips: form.payslips,
        rentalProperties: form.rentalProperties,
        freelanceIncome: form.freelanceIncome,
        interestIncome: form.interestIncome,
        medicalSchemeMembers: form.medicalSchemeMembers,
        hasDisability: form.hasDisability,
        annualMedicalContributions: form.annualMedicalContributions,
        outOfPocketMedicalExpenses: form.outOfPocketMedicalExpenses,
        additionalRetirementContributions: form.additionalRetirementContributions,
        donations: form.donations,
        businessKmTravelled: form.businessKmTravelled,
        travelReimbursementRatePerKm: form.travelReimbursementRatePerKm,
        homeOfficeAreaSqm: form.homeOfficeAreaSqm,
        totalHomeAreaSqm: form.totalHomeAreaSqm,
        monthsHomeOfficeUsed: form.monthsHomeOfficeUsed,
        totalHomeExpenses: form.totalHomeExpenses,
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

  const stepIndex = STEPS.findIndex((s) => s.key === stepKey);

  return (
    <AssessmentShell steps={STEPS} currentStepKey={stepKey} onStepChange={setStepKey}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10">
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
          />
        )}

        {stepKey === "other-income" && (
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

        <div className="flex justify-between pt-2">
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
