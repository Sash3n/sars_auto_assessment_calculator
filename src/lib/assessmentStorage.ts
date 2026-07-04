import type { FormState } from "@/components/assessment/formState";

// v2: FormState.payslips moved from a flat MonthlyPayslip[12] to a
// PayslipLineItem[] (multi-employer support) — the shape changed enough
// that old data is simply not read rather than migrated in place.
export const STORAGE_KEY = "sars-assessment-form-v2";

export function loadStoredFormState(): FormState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as FormState;
  } catch {
    return null;
  }
}

export function saveFormState(state: FormState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
