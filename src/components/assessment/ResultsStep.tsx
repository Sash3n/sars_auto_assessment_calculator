"use client";

import type { AssessmentResult } from "@/lib/tax-engine/assess";
import { formatCurrency } from "@/lib/format";

type ResultsStepProps = {
  result: AssessmentResult;
};

export function ResultsStep({ result }: ResultsStepProps) {
  const owesSars = result.balance > 0;
  const isBalanced = result.balance === 0;

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`card shadow-sm ${
          isBalanced ? "bg-base-100" : owesSars ? "bg-error/10" : "bg-success/10"
        }`}
      >
        <div className="card-body items-center text-center">
          <p className="text-sm text-base-content/60">Tax year {result.taxYear}</p>
          <p className="text-3xl font-semibold">
            {isBalanced
              ? "You and SARS are square"
              : owesSars
                ? `You owe SARS ${formatCurrency(result.balance)}`
                : `SARS owes you ${formatCurrency(Math.abs(result.balance))}`}
          </p>
        </div>
      </div>

      <div className="stats stats-vertical shadow-sm sm:stats-horizontal">
        <div className="stat">
          <div className="stat-title">Total income</div>
          <div className="stat-value text-lg">{formatCurrency(result.income.grossTotal)}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Taxable income</div>
          <div className="stat-value text-lg">{formatCurrency(result.taxableIncome)}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Tax payable</div>
          <div className="stat-value text-lg">{formatCurrency(result.taxPayable)}</div>
        </div>
        <div className="stat">
          <div className="stat-title">PAYE already paid</div>
          <div className="stat-value text-lg">{formatCurrency(result.payeAlreadyPaid)}</div>
        </div>
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
          <h3 className="card-title text-base">Full breakdown</h3>
          <table className="table">
            <tbody>
              <tr>
                <td>Salary income</td>
                <td className="text-right">{formatCurrency(result.income.salary)}</td>
              </tr>
              <tr>
                <td>Rental income (net)</td>
                <td className="text-right">{formatCurrency(result.income.rentalNet)}</td>
              </tr>
              <tr>
                <td>Freelance / business income</td>
                <td className="text-right">{formatCurrency(result.income.freelance)}</td>
              </tr>
              <tr>
                <td>Taxable interest</td>
                <td className="text-right">{formatCurrency(result.income.taxableInterest)}</td>
              </tr>
              <tr className="font-semibold">
                <td>Gross income</td>
                <td className="text-right">{formatCurrency(result.income.grossTotal)}</td>
              </tr>
              <tr>
                <td>Less: retirement fund deduction</td>
                <td className="text-right">
                  -{formatCurrency(result.deductions.retirementDeductible)}
                </td>
              </tr>
              <tr>
                <td>Less: donations deduction</td>
                <td className="text-right">
                  -{formatCurrency(result.deductions.donationsDeductible)}
                </td>
              </tr>
              <tr className="font-semibold">
                <td>Taxable income</td>
                <td className="text-right">{formatCurrency(result.taxableIncome)}</td>
              </tr>
              <tr>
                <td>Tax per bracket</td>
                <td className="text-right">{formatCurrency(result.grossTax)}</td>
              </tr>
              <tr>
                <td>Less: rebate</td>
                <td className="text-right">-{formatCurrency(result.rebate)}</td>
              </tr>
              <tr>
                <td>Less: medical scheme fees credit</td>
                <td className="text-right">-{formatCurrency(result.medicalCredit)}</td>
              </tr>
              <tr className="font-semibold">
                <td>Tax payable</td>
                <td className="text-right">{formatCurrency(result.taxPayable)}</td>
              </tr>
              <tr>
                <td>Less: PAYE already paid</td>
                <td className="text-right">-{formatCurrency(result.payeAlreadyPaid)}</td>
              </tr>
              <tr className="text-lg font-bold">
                <td>{owesSars ? "Amount owed to SARS" : "Refund due from SARS"}</td>
                <td className="text-right">{formatCurrency(Math.abs(result.balance))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {result.sarsComparison && (
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body">
            <h3 className="card-title text-base">Compared to your SARS assessment</h3>
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
                  <td>{formatCurrency(result.taxPayable)}</td>
                  <td>{formatCurrency(result.sarsComparison.sarsAssessedTaxPayable)}</td>
                  <td
                    className={
                      result.sarsComparison.difference === 0
                        ? ""
                        : result.sarsComparison.difference > 0
                          ? "text-error"
                          : "text-success"
                    }
                  >
                    {formatCurrency(result.sarsComparison.difference)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
