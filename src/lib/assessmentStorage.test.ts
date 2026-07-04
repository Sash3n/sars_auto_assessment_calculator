import { afterEach, describe, expect, it } from "vitest";
import { loadStoredFormState, saveFormState, STORAGE_KEY } from "./assessmentStorage";
import { createInitialFormState, type FormState } from "@/components/assessment/formState";

afterEach(() => {
  localStorage.clear();
});

describe("assessmentStorage", () => {
  it("returns null when nothing has been saved yet", () => {
    expect(loadStoredFormState()).toBeNull();
  });

  it("round-trips a saved form state", () => {
    const state: FormState = { ...createInitialFormState(), age: 35 };
    saveFormState(state);

    expect(loadStoredFormState()).toEqual(state);
  });

  it("returns null when the stored value is malformed JSON", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(loadStoredFormState()).toBeNull();
  });
});
