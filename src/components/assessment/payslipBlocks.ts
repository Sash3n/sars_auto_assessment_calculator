import type { LineItemCategory, PayslipLineItem } from "@/lib/tax-engine/payslips";

/**
 * The categories the "simple" per-employer payslip card exposes as fixed
 * fields. Other categories (bonus, allowance, other_non_tax, ...) exist in
 * the data model for richer entry paths (e.g. JSON import) but aren't part
 * of this block editor.
 */
export const BLOCK_CATEGORIES: LineItemCategory[] = [
  "basic_salary",
  "paye",
  "uif",
  "employee_retirement_contribution",
  "employer_retirement_fringe_benefit",
  "general_fringe_benefit",
];

export type EmployerBlock = {
  blockId: string;
  employer: string;
  items: Partial<Record<LineItemCategory, PayslipLineItem>>;
};

function makeBlockId(month: number): string {
  return `m${month}-${Math.random().toString(36).slice(2, 9)}`;
}

// Line item ids are "<blockId>:<category>" so block membership survives an
// employer rename (which can't double as a group key, since two freshly
// added blocks both start out blank).
function blockIdOf(item: PayslipLineItem): string {
  return item.id.split(":")[0];
}

export function createEmployerBlockLineItems(
  month: number,
  employer = "",
): PayslipLineItem[] {
  const blockId = makeBlockId(month);
  return BLOCK_CATEGORIES.map((category) => ({
    id: `${blockId}:${category}`,
    month,
    employer,
    category,
    amount: 0,
  }));
}

export function addEmployerBlock(payslips: PayslipLineItem[], month: number): PayslipLineItem[] {
  return [...payslips, ...createEmployerBlockLineItems(month)];
}

export function removeEmployerBlock(
  payslips: PayslipLineItem[],
  blockId: string,
): PayslipLineItem[] {
  return payslips.filter((item) => blockIdOf(item) !== blockId);
}

export function renameEmployerBlock(
  payslips: PayslipLineItem[],
  blockId: string,
  employer: string,
): PayslipLineItem[] {
  return payslips.map((item) => (blockIdOf(item) === blockId ? { ...item, employer } : item));
}

export function updateBlockCategoryAmount(
  payslips: PayslipLineItem[],
  blockId: string,
  category: LineItemCategory,
  amount: number,
): PayslipLineItem[] {
  return payslips.map((item) =>
    blockIdOf(item) === blockId && item.category === category ? { ...item, amount } : item,
  );
}

export function getMonthBlocks(payslips: PayslipLineItem[], month: number): EmployerBlock[] {
  const blocks = new Map<string, EmployerBlock>();

  for (const item of payslips) {
    if (item.month !== month || !BLOCK_CATEGORIES.includes(item.category)) continue;

    const blockId = blockIdOf(item);
    if (!blocks.has(blockId)) {
      blocks.set(blockId, { blockId, employer: item.employer, items: {} });
    }
    blocks.get(blockId)!.items[item.category] = item;
  }

  return [...blocks.values()];
}

export function monthHasData(payslips: PayslipLineItem[], month: number): boolean {
  return payslips.some(
    (item) => item.month === month && (item.amount > 0 || item.employer.trim().length > 0),
  );
}

export function hasAnyPayslipData(payslips: PayslipLineItem[]): boolean {
  return payslips.some((item) => item.amount > 0 || item.employer.trim().length > 0);
}
