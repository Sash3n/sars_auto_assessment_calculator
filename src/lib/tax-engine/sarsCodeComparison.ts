import type { PayslipLineItem } from "./payslips";

/** A single SARS IRP5 source-code amount, manually typed in from a real
 * ITA34's income breakdown, for a code-by-code comparison against this
 * app's own line items. */
export type SarsAssessedLineItem = {
  sarsCode: string;
  amount: number;
};

export type SarsCodeComparisonRow = {
  sarsCode: string;
  yourAmount: number;
  sarsAmount: number;
  /** yourAmount - sarsAmount */
  difference: number;
};

function sumBySarsCode(items: Array<{ sarsCode?: string; amount: number }>): Map<string, number> {
  const totals = new Map<string, number>();
  for (const item of items) {
    if (!item.sarsCode) continue;
    totals.set(item.sarsCode, (totals.get(item.sarsCode) ?? 0) + item.amount);
  }
  return totals;
}

/**
 * Compares this app's payslip line items against manually-entered SARS
 * ITA34 amounts, code by code, so a mismatch can be traced to the exact
 * source code rather than only showing up as a single opaque total
 * difference. Line items with no sarsCode can't be placed in this view and
 * are excluded.
 */
export function compareLineItemsBySarsCode(
  lineItems: PayslipLineItem[],
  sarsAssessedLineItems: SarsAssessedLineItem[],
): SarsCodeComparisonRow[] {
  const yourTotals = sumBySarsCode(lineItems);
  const sarsTotals = sumBySarsCode(sarsAssessedLineItems);

  const codes = [...new Set([...yourTotals.keys(), ...sarsTotals.keys()])].sort();

  return codes.map((sarsCode) => {
    const yourAmount = yourTotals.get(sarsCode) ?? 0;
    const sarsAmount = sarsTotals.get(sarsCode) ?? 0;
    return { sarsCode, yourAmount, sarsAmount, difference: yourAmount - sarsAmount };
  });
}
