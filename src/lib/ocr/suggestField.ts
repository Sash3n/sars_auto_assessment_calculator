import type { NumericPayslipField } from "@/lib/tax-engine/payslips";

/**
 * Suggests which payslip field a detected OCR amount most likely belongs
 * to, based on common South African payslip terminology. This is a hint
 * only — the user always makes the final call by clicking a field button.
 */
export function suggestField(context: string): NumericPayslipField | null {
  const text = context.toLowerCase();

  if (/\buif\b|unemployment insurance/.test(text)) return "uif";
  if (/\bpaye\b|pay as you earn/.test(text)) return "payeDeducted";

  // Employer retirement contributions are a non-cash fringe benefit, not
  // the employee's own deductible contribution — route them to their own
  // field rather than the employee's retirement deduction.
  if (/retirement|pension|provident/.test(text)) {
    return /employer|fringe benefit/.test(text)
      ? "employerRetirementFringeBenefit"
      : "retirementContribution";
  }

  if (/fringe benefit|company car/.test(text)) {
    return "generalFringeBenefit";
  }

  // Only a genuine total/summary row is a safe gross salary suggestion —
  // a single earnings line (e.g. Basic Salary) can omit allowances and
  // other taxable cash components.
  if (/total\s*(cash|earnings|remuneration|income|pay)|\bgross\b/.test(text)) {
    return "grossSalary";
  }

  return null;
}
