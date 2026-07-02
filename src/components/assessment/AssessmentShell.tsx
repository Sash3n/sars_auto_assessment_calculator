"use client";

import type { ReactNode } from "react";

export type AssessmentStep = {
  key: string;
  label: string;
};

type AssessmentShellProps = {
  steps: AssessmentStep[];
  currentStepKey: string;
  onStepChange: (key: string) => void;
  children: ReactNode;
};

function NavButton({
  step,
  isActive,
  onClick,
  className,
}: {
  step: AssessmentStep;
  isActive: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-current={isActive ? "step" : undefined}
      onClick={onClick}
      className={`${className} ${
        isActive ? "text-primary bg-primary/10 font-medium" : "text-base-content/70"
      }`}
    >
      {step.label}
    </button>
  );
}

function NavList({
  steps,
  currentStepKey,
  onStepChange,
  itemClassName,
}: {
  steps: AssessmentStep[];
  currentStepKey: string;
  onStepChange: (key: string) => void;
  itemClassName: string;
}) {
  return (
    <>
      {steps.map((step) => (
        <NavButton
          key={step.key}
          step={step}
          isActive={step.key === currentStepKey}
          onClick={() => onStepChange(step.key)}
          className={itemClassName}
        />
      ))}
    </>
  );
}

export function AssessmentShell({
  steps,
  currentStepKey,
  onStepChange,
  children,
}: AssessmentShellProps) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-base-300 bg-base-100 p-4 md:flex print:hidden">
        <div className="mb-6 px-2">
          {/* Plain text, not a link: navigating away here would silently
              discard the in-progress assessment (state isn't persisted). */}
          <p className="text-sm font-semibold tracking-tight">SARS Auto-Assessment Calculator</p>
        </div>
        <nav className="flex flex-col gap-1">
          <NavList
            steps={steps}
            currentStepKey={currentStepKey}
            onStepChange={onStepChange}
            itemClassName="rounded-field px-3 py-2 text-left text-sm transition-colors hover:bg-base-200"
          />
        </nav>
      </aside>

      <div className="flex flex-1 flex-col bg-base-200 pb-20 md:pb-0 print:bg-white print:pb-0">
        <header className="navbar bg-base-100 border-b border-base-300 px-6 md:hidden print:hidden">
          <p className="text-lg font-semibold tracking-tight">SARS Auto-Assessment Calculator</p>
        </header>

        {children}

        <footer className="footer footer-center bg-base-100 p-4 text-xs text-base-content/60 print:hidden">
          <p>Not tax advice. Not affiliated with or endorsed by SARS.</p>
        </footer>

        <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-base-300 bg-base-100 py-2 md:hidden print:hidden">
          <NavList
            steps={steps}
            currentStepKey={currentStepKey}
            onStepChange={onStepChange}
            itemClassName="flex flex-col items-center rounded-field px-2 py-1 text-[11px]"
          />
        </nav>
      </div>
    </div>
  );
}
