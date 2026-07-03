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
 * A single income/deduction item as it appears on a payslip, tagged with
 * which employer and month it belongs to. Supersedes the flat MonthlyPayslip
 * shape for cases needing multiple employers or a SARS-code-level breakdown;
 * MonthlyPayslip/summarizePayslips remain for the simple single-employer path.
 */
export type LineItemCategory =
  | "basic_salary"
  | "bonus"
  | "allowance"
  | "employer_retirement_fringe_benefit"
  | "general_fringe_benefit"
  | "paye"
  | "uif"
  | "employee_retirement_contribution"
  | "other_non_tax";

export type PayslipLineItem = {
  id: string;
  /** 0-based, March = 0 .. February = 11, matching the existing SA tax year order */
  month: number;
  employer: string;
  category: LineItemCategory;
  /** Real SARS IRP5 source code, e.g. "3601", if known */
  sarsCode?: string;
  description?: string;
  amount: number;
};

type CategoryTreatment = {
  countsTowardGrossIncome: boolean;
  /** Mirrors SARS's s11F treatment of employer retirement contributions as a
   * deemed employee contribution, in addition to their own taxable fringe
   * benefit inclusion in gross income. */
  countsTowardRetirementContributionBase: boolean;
  countsTowardPayeAlreadyPaid: boolean;
  countsTowardUif: boolean;
};

export const LINE_ITEM_CATEGORY_TREATMENT: Record<LineItemCategory, CategoryTreatment> = {
  basic_salary: {
    countsTowardGrossIncome: true,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  bonus: {
    countsTowardGrossIncome: true,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  allowance: {
    countsTowardGrossIncome: true,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  employer_retirement_fringe_benefit: {
    countsTowardGrossIncome: true,
    countsTowardRetirementContributionBase: true,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  general_fringe_benefit: {
    countsTowardGrossIncome: true,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  paye: {
    countsTowardGrossIncome: false,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: true,
    countsTowardUif: false,
  },
  uif: {
    countsTowardGrossIncome: false,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: true,
  },
  employee_retirement_contribution: {
    countsTowardGrossIncome: false,
    countsTowardRetirementContributionBase: true,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
  other_non_tax: {
    countsTowardGrossIncome: false,
    countsTowardRetirementContributionBase: false,
    countsTowardPayeAlreadyPaid: false,
    countsTowardUif: false,
  },
};

export type LineItemSummary = PayslipSummary & {
  /** Gross salary summed per month (index = month), across all employers */
  perMonthGrossSalary: number[];
  perEmployerTotals: Record<
    string,
    {
      totalGrossSalary: number;
      totalPayeDeducted: number;
      totalUif: number;
      totalRetirementContribution: number;
    }
  >;
};

function emptyEmployerTotals() {
  return {
    totalGrossSalary: 0,
    totalPayeDeducted: 0,
    totalUif: 0,
    totalRetirementContribution: 0,
  };
}

/**
 * Sums a set of payslip line items (potentially spanning several employers
 * within the same tax year) and flags months whose gross salary deviates
 * significantly from the year's average, so fluctuating income (bonuses,
 * unpaid leave, commission spikes) is surfaced rather than silently
 * averaged away.
 */
export function summarizeLineItems(
  lineItems: PayslipLineItem[],
  monthCount = 12,
): LineItemSummary {
  if (monthCount < 1 || monthCount > 12) {
    throw new Error("Expected between 1 and 12 months in the tax year");
  }

  for (const item of lineItems) {
    if (!Number.isInteger(item.month) || item.month < 0 || item.month >= monthCount) {
      throw new Error(
        `Line item month ${item.month} is out of range for a ${monthCount}-month tax year`,
      );
    }
  }

  const perMonthGrossSalary = Array(monthCount).fill(0);
  const perEmployerTotals: LineItemSummary["perEmployerTotals"] = {};
  let totalGrossSalary = 0;
  let totalPayeDeducted = 0;
  let totalUif = 0;
  let totalRetirementContribution = 0;

  for (const item of lineItems) {
    const treatment = LINE_ITEM_CATEGORY_TREATMENT[item.category];
    if (!perEmployerTotals[item.employer]) {
      perEmployerTotals[item.employer] = emptyEmployerTotals();
    }
    const employerTotals = perEmployerTotals[item.employer];

    if (treatment.countsTowardGrossIncome) {
      totalGrossSalary += item.amount;
      perMonthGrossSalary[item.month] += item.amount;
      employerTotals.totalGrossSalary += item.amount;
    }
    if (treatment.countsTowardRetirementContributionBase) {
      totalRetirementContribution += item.amount;
      employerTotals.totalRetirementContribution += item.amount;
    }
    if (treatment.countsTowardPayeAlreadyPaid) {
      totalPayeDeducted += item.amount;
      employerTotals.totalPayeDeducted += item.amount;
    }
    if (treatment.countsTowardUif) {
      totalUif += item.amount;
      employerTotals.totalUif += item.amount;
    }
  }

  const averageGrossSalary = totalGrossSalary / monthCount;
  const anomalousMonths = perMonthGrossSalary
    .map((amount, index) => ({ index, deviation: Math.abs(amount - averageGrossSalary) }))
    .filter(({ deviation }) =>
      averageGrossSalary > 0 ? deviation / averageGrossSalary > ANOMALY_THRESHOLD : false,
    )
    .map(({ index }) => index);

  return {
    totalGrossSalary,
    totalPayeDeducted,
    totalUif,
    totalRetirementContribution,
    anomalousMonths,
    perMonthGrossSalary,
    perEmployerTotals,
  };
}

/**
 * Bridges the simple flat MonthlyPayslip[] shape onto the richer line-item
 * model, so assessTax can be driven from PayslipLineItem[] uniformly while
 * the wizard's UI still only needs the 4-field-per-month fast path.
 */
export function monthlyPayslipsToLineItems(
  payslips: MonthlyPayslip[],
  employer = "Employer",
): PayslipLineItem[] {
  const items: PayslipLineItem[] = [];

  payslips.forEach((payslip, month) => {
    if (payslip.grossSalary > 0) {
      items.push({
        id: `${month}-basic_salary`,
        month,
        employer,
        category: "basic_salary",
        amount: payslip.grossSalary,
      });
    }
    if (payslip.payeDeducted > 0) {
      items.push({
        id: `${month}-paye`,
        month,
        employer,
        category: "paye",
        amount: payslip.payeDeducted,
      });
    }
    if (payslip.uif > 0) {
      items.push({ id: `${month}-uif`, month, employer, category: "uif", amount: payslip.uif });
    }
    if (payslip.retirementContribution > 0) {
      items.push({
        id: `${month}-retirement`,
        month,
        employer,
        category: "employee_retirement_contribution",
        amount: payslip.retirementContribution,
      });
    }
  });

  return items;
}

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
