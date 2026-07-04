"use client";

import type { AssessmentStep } from "./AssessmentShell";

type StepperProps = {
  steps: AssessmentStep[];
  currentStepKey: string;
  onStepChange: (key: string) => void;
};

export function Stepper({ steps, currentStepKey, onStepChange }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.key === currentStepKey);

  return (
    <ol className="flex w-full items-start print:hidden">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <li key={step.key} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={() => onStepChange(step.key)}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-col items-center gap-1"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isDone
                    ? "bg-primary text-primary-content"
                    : isCurrent
                      ? "border-2 border-primary text-primary"
                      : "border border-base-300 text-base-content/40"
                }`}
              >
                {isDone ? (
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`hidden text-[11px] sm:block ${
                  isCurrent ? "font-medium text-primary" : "text-base-content/50"
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 self-start mt-4 ${
                  isDone ? "bg-primary" : "bg-base-300"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
