export type MonthlyPayslip = {
  grossSalary: number;
  payeDeducted: number;
  uif: number;
  retirementContribution: number;
};

export type PayslipSummary = {
  totalGrossSalary: number;
  totalPayeDeducted: number;
  totalUif: number;
  totalRetirementContribution: number;
  /** Indices (0-based) of months whose gross salary deviates >25% from the average */
  anomalousMonths: number[];
};

const ANOMALY_THRESHOLD = 0.25;

/**
 * Sums a user's monthly payslips for the tax year and flags months whose
 * gross salary deviates significantly from the year's average, so
 * fluctuating income (bonuses, unpaid leave, commission spikes) is
 * surfaced rather than silently averaged away.
 */
export function summarizePayslips(payslips: MonthlyPayslip[]): PayslipSummary {
  if (payslips.length < 1 || payslips.length > 12) {
    throw new Error("Expected between 1 and 12 monthly payslips");
  }

  const totals = payslips.reduce(
    (acc, p) => ({
      totalGrossSalary: acc.totalGrossSalary + p.grossSalary,
      totalPayeDeducted: acc.totalPayeDeducted + p.payeDeducted,
      totalUif: acc.totalUif + p.uif,
      totalRetirementContribution:
        acc.totalRetirementContribution + p.retirementContribution,
    }),
    {
      totalGrossSalary: 0,
      totalPayeDeducted: 0,
      totalUif: 0,
      totalRetirementContribution: 0,
    },
  );

  const averageGrossSalary = totals.totalGrossSalary / payslips.length;

  const anomalousMonths = payslips
    .map((p, index) => ({ index, deviation: Math.abs(p.grossSalary - averageGrossSalary) }))
    .filter(({ deviation }) =>
      averageGrossSalary > 0 ? deviation / averageGrossSalary > ANOMALY_THRESHOLD : false,
    )
    .map(({ index }) => index);

  return { ...totals, anomalousMonths };
}
