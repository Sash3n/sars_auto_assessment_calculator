"use client";

import type { AssessmentResult } from "@/lib/tax-engine/assess";
import { findBracketIndex } from "@/lib/tax-engine/brackets";
import { TAX_YEAR_TABLES } from "@/lib/tax-engine/tax-tables";
import { formatCurrency } from "@/lib/format";
import { StatCard } from "./StatCard";

type ResultsStepProps = {
  result: AssessmentResult;
  sarsAssessedTaxPayable: number | undefined;
  onSarsAssessedTaxPayableChange: (value: number | undefined) => void;
};

function TaxBracketBar({ taxableIncome, taxYear }: { taxableIncome: number; taxYear: string }) {
  const brackets = TAX_YEAR_TABLES[taxYear]?.brackets ?? [];
  const reachedIndex = findBracketIndex(taxableIncome, brackets);

  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {brackets.map((bracket, index) => (
          <div
            key={bracket.min}
            data-testid="bracket-segment"
            className={`h-full flex-1 rounded-full ${
              reachedIndex === -1 || index <= reachedIndex ? "bg-primary" : "bg-base-300"
            }`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-base-content/60">
        {brackets.map((bracket, index) => (
          <span
            key={bracket.min}
            className={index === reachedIndex ? "font-semibold text-primary" : ""}
          >
            {Math.round(bracket.rate * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function ResultsStep({
  result,
  sarsAssessedTaxPayable,
  onSarsAssessedTaxPayableChange,
}: ResultsStepProps) {
  const owesSars = result.balance > 0;
  const isBalanced = result.balance === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden print:block">
        <h1 className="text-xl font-semibold">SARS Auto-Assessment Calculator</h1>
        <p className="text-sm text-base-content/60">
          Tax year {result.taxYear} &mdash; not tax advice, not affiliated with or endorsed by SARS.
        </p>
      </div>

      <div className="flex justify-end print:hidden">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}>
          Export / Print
        </button>
      </div>

      <div
        className={`card shadow-sm ${
          isBalanced ? "bg-base-100" : owesSars ? "bg-error/10" : "bg-success/10"
        }`}
      >
        <div className="card-body items-center gap-3 text-center">
          <span className="badge badge-ghost">Tax year {result.taxYear}</span>
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
          {!isBalanced && (
            <div className="rounded-box border-2 border-primary/20 bg-base-100 px-6 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {owesSars ? "Amount owed" : "Refund due"}
              </p>
              <p className="money text-2xl font-bold">
                {formatCurrency(Math.abs(result.balance))}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total income" value={formatCurrency(result.income.grossTotal)} />
        <StatCard label="Taxable income" value={formatCurrency(result.taxableIncome)} />
        <StatCard label="Tax payable" value={formatCurrency(result.taxPayable)} />
        <StatCard label="PAYE already paid" value={formatCurrency(result.payeAlreadyPaid)} />
      </div>

      {result.isLikelyProvisionalTaxpayer && (
        <div role="alert" className="alert alert-warning">
          <span>
            Your income mix suggests you may be a <strong>provisional taxpayer</strong>. You may
            need to make advance tax payments during the year rather than settling everything on
            assessment.
          </span>
        </div>
      )}

      {result.rental.hasLoss && (
        <div role="alert" className="alert alert-info">
          <span>
            Your rental income shows a loss. SARS&rsquo;s ring-fencing rules may restrict offsetting
            this loss against other income &mdash; check whether they apply to you.
          </span>
        </div>
      )}

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Marginal tax bracket</h3>
          <TaxBracketBar taxableIncome={result.taxableIncome} taxYear={result.taxYear} />
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Full breakdown</h3>
          <table className="table">
            <tbody>
              <tr>
                <td>Salary income</td>
                <td className="money text-right">{formatCurrency(result.income.salary)}</td>
              </tr>
              <tr>
                <td>Rental income (net)</td>
                <td className="money text-right">{formatCurrency(result.income.rentalNet)}</td>
              </tr>
              <tr>
                <td>Freelance / business income</td>
                <td className="money text-right">{formatCurrency(result.income.freelance)}</td>
              </tr>
              <tr>
                <td>Interest income</td>
                <td className="money text-right">
                  {formatCurrency(result.income.taxableInterest + result.income.exemptions)}
                </td>
              </tr>
              <tr>
                <td>Taxable travel reimbursement</td>
                <td className="money text-right">
                  {formatCurrency(result.income.taxableTravelReimbursement)}
                </td>
              </tr>
              <tr>
                <td>Taxable capital gain</td>
                <td className="money text-right">
                  {formatCurrency(result.income.taxableCapitalGain)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td>Gross income</td>
                <td className="money text-right">{formatCurrency(result.income.grossIncome)}</td>
              </tr>
              <tr>
                <td>Less: exemptions</td>
                <td className="money text-right">
                  -{formatCurrency(result.income.exemptions)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td>Income after exemptions</td>
                <td className="money text-right">{formatCurrency(result.income.grossTotal)}</td>
              </tr>
              <tr>
                <td>Less: retirement fund deduction</td>
                <td className="money text-right">
                  -{formatCurrency(result.deductions.retirementDeductible)}
                </td>
              </tr>
              <tr>
                <td>Less: home office deduction</td>
                <td className="money text-right">
                  -{formatCurrency(result.deductions.homeOfficeDeductible)}
                </td>
              </tr>
              <tr>
                <td>Less: donations deduction</td>
                <td className="money text-right">
                  -{formatCurrency(result.deductions.donationsDeductible)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td>Taxable income</td>
                <td className="money text-right">{formatCurrency(result.taxableIncome)}</td>
              </tr>
              <tr>
                <td>Tax per bracket</td>
                <td className="money text-right">{formatCurrency(result.grossTax)}</td>
              </tr>
              <tr>
                <td>Less: rebate</td>
                <td className="money text-right">-{formatCurrency(result.rebate)}</td>
              </tr>
              <tr>
                <td>Less: medical scheme fees credit</td>
                <td className="money text-right">-{formatCurrency(result.medicalCredit)}</td>
              </tr>
              <tr>
                <td>Less: additional medical expenses credit</td>
                <td className="money text-right">
                  -{formatCurrency(result.additionalMedicalCredit)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td>Tax payable</td>
                <td className="money text-right">{formatCurrency(result.taxPayable)}</td>
              </tr>
              <tr>
                <td>Less: PAYE already paid</td>
                <td className="money text-right">-{formatCurrency(result.payeAlreadyPaid)}</td>
              </tr>
              <tr className="text-lg font-bold">
                <td>{owesSars ? "Amount owed to SARS" : "Refund due from SARS"}</td>
                <td className="money text-right">{formatCurrency(Math.abs(result.balance))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h3 className="card-title text-base">Compare to SARS (optional)</h3>
          <p className="text-sm text-base-content/60">
            Enter the &ldquo;tax payable&rdquo; figure from your SARS ITA34 to see the
            difference against this calculation.
          </p>
          <label className="flex flex-col gap-1 max-w-xs">
            <span className="text-xs">SARS assessed tax payable</span>
            <input
              type="number"
              min={0}
              className="input input-sm money"
              aria-label="SARS assessed tax payable"
              value={sarsAssessedTaxPayable ?? ""}
              onChange={(e) =>
                onSarsAssessedTaxPayableChange(
                  e.target.value === "" ? undefined : Number(e.target.value) || 0,
                )
              }
            />
          </label>

          {result.sarsComparison && (
            <>
              <h4 className="mt-2 text-sm font-medium">Compared to your SARS assessment</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Your calculation</th>
                    <th>SARS&rsquo;s assessment</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="money">{formatCurrency(result.taxPayable)}</td>
                    <td className="money">
                      {formatCurrency(result.sarsComparison.sarsAssessedTaxPayable)}
                    </td>
                    <td
                      className={`money ${
                        result.sarsComparison.difference === 0
                          ? ""
                          : result.sarsComparison.difference > 0
                            ? "text-error"
                            : "text-success"
                      }`}
                    >
                      {formatCurrency(result.sarsComparison.difference)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
