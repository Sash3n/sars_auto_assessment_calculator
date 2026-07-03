import type { FormState } from "@/components/assessment/formState";

export const STORAGE_KEY = "sars-assessment-form-v1";

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
