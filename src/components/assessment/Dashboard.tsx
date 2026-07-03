"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStoredFormState } from "@/lib/assessmentStorage";
import { formatCurrency } from "@/lib/format";
import { computeAssessmentResult, hasAssessmentData, type FormState } from "./formState";
import { StatCard } from "./StatCard";

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body">
        <p className="text-base-content/70">
          Upload 12 months of payslips, add any rental, freelance or investment income, and get
          an independent estimate of whether SARS owes you a refund or you owe SARS &mdash;
          before your 40-business-day correction window closes.
        </p>
        <div className="card-actions justify-end pt-2">
          <Link href="/assess" className="btn btn-primary">
            Start assessment
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [form, setForm] = useState<FormState | null>(null);

  useEffect(() => {
    // One-time client-only hydration from localStorage; see AssessmentWizard
    // for why this can't be done in the initial render (no SSR access).
    const stored = loadStoredFormState();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(stored);
  }, []);

  if (!form || !hasAssessmentData(form)) {
    return <EmptyState />;
  }

  const result = computeAssessmentResult(form);
  const owesSars = result.balance > 0;
  const isBalanced = result.balance === 0;
  const effectiveTaxRate =
    result.taxableIncome > 0 ? (result.taxPayable / result.taxableIncome) * 100 : 0;

  const stats = [
    { label: "Total income", value: formatCurrency(result.income.grossTotal) },
    { label: "Total tax paid (PAYE)", value: formatCurrency(result.payeAlreadyPaid) },
    { label: "Tax payable", value: formatCurrency(result.taxPayable) },
    { label: "Effective tax rate", value: `${effectiveTaxRate.toFixed(1)}%` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`card shadow-sm ${
          isBalanced ? "bg-base-100" : owesSars ? "bg-error/10" : "bg-success/10"
        }`}
      >
        <div className="card-body items-center gap-4 text-center">
          <span className="badge badge-ghost">
            ZAR &middot; Tax year {result.taxYear}
          </span>
          <p
            className={`money text-3xl font-semibold ${
              isBalanced ? "" : owesSars ? "text-error" : "text-success"
            }`}
          >
            {isBalanced
              ? "You and SARS are square"
              : owesSars
                ? `You owe SARS ${formatCurrency(result.balance)}`
                : `SARS owes you ${formatCurrency(Math.abs(result.balance))}`}
          </p>

          <div className="grid w-full grid-cols-3 gap-2 rounded-box bg-base-100/60 px-3 py-3 text-left sm:max-w-md">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-base-content/50">
                Gross income
              </p>
              <p className="money text-sm font-medium">
                {formatCurrency(result.income.grossIncome)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-base-content/50">
                Exemptions
              </p>
              <p className="money text-sm font-medium">{formatCurrency(result.income.exemptions)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-base-content/50">
                Taxable income
              </p>
              <p className="money text-sm font-medium">{formatCurrency(result.taxableIncome)}</p>
            </div>
          </div>

          <div className="card-actions pt-1">
            <Link href="/assess?step=results" className="btn btn-primary btn-sm">
              View calculation
            </Link>
            <button
              type="button"
              disabled
              className="btn btn-outline btn-sm"
              title="This calculator doesn't file returns on your behalf &mdash; submit via SARS eFiling."
            >
              Submit return
            </button>
          </div>
        </div>
      </div>

      {result.isLikelyProvisionalTaxpayer && (
        <div role="alert" className="alert alert-warning">
          <span>
            Your income mix suggests you may be a <strong>provisional taxpayer</strong>.
          </span>
        </div>
      )}

      <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </div>

      <div className="flex flex-col divide-y divide-base-300 rounded-box bg-base-100 shadow-sm sm:hidden">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href="/assess?step=results"
            className="flex items-center justify-between gap-2 px-4 py-3"
          >
            <span className="text-sm text-base-content/70">{stat.label}</span>
            <span className="money flex items-center gap-2 text-sm font-semibold">
              {stat.value}
              <ChevronRightIcon />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
