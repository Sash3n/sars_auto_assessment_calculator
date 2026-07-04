import type { LineItemCategory, PayslipLineItem } from "@/lib/tax-engine/payslips";

export type PayslipImportLineItem = {
  /** ISO "YYYY-MM", not the internal 0-11 tax-year index */
  month: string;
  employer: string;
  category: LineItemCategory;
  sarsCode?: string;
  description?: string;
  amount: number;
};

export type PayslipImportSchemaV1 = {
  schemaVersion: 1;
  taxYear?: string;
  lineItems: PayslipImportLineItem[];
};

export type ImportValidationResult =
  | { ok: true; lineItems: PayslipLineItem[] }
  | { ok: false; errors: string[] };

const VALID_CATEGORIES: ReadonlySet<LineItemCategory> = new Set([
  "basic_salary",
  "bonus",
  "allowance",
  "employer_retirement_fringe_benefit",
  "general_fringe_benefit",
  "paye",
  "uif",
  "employee_retirement_contribution",
  "other_non_tax",
]);

/**
 * Converts an ISO "YYYY-MM" month string into the 0-11 index used
 * internally (0 = March .. 11 = February), scoped to a specific SA tax
 * year ("YYYY/YY", e.g. "2025/26" = March 2025 through February 2026).
 * Returns null if the month doesn't fall within that tax year at all.
 */
export function isoMonthToTaxYearIndex(isoMonth: string, taxYear: string): number | null {
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(isoMonth);
  const taxYearMatch = /^(\d{4})\/\d{2}$/.exec(taxYear);
  if (!monthMatch || !taxYearMatch) return null;

  const year = Number(monthMatch[1]);
  const month = Number(monthMatch[2]);
  const startYear = Number(taxYearMatch[1]);
  if (month < 1 || month > 12) return null;

  if (month >= 3) {
    return year === startYear ? month - 3 : null;
  }
  return year === startYear + 1 ? month + 9 : null;
}

type IntermediateItem = {
  month: number;
  employer: string;
  category: LineItemCategory;
  sarsCode?: string;
  description?: string;
  amount: number;
};

// Groups validated items by (month, employer) so imported data renders as
// coherent employer blocks in PayslipStep, and sums any duplicate
// month+employer+category entries rather than silently dropping one.
function assembleLineItems(items: IntermediateItem[]): PayslipLineItem[] {
  const blockIdsByGroup = new Map<string, string>();
  const merged = new Map<string, PayslipLineItem>();

  for (const item of items) {
    const groupKey = `${item.month}|${item.employer}`;
    let blockId = blockIdsByGroup.get(groupKey);
    if (!blockId) {
      blockId = `import-m${item.month}-${Math.random().toString(36).slice(2, 9)}`;
      blockIdsByGroup.set(groupKey, blockId);
    }

    const mergeKey = `${blockId}|${item.category}`;
    const existing = merged.get(mergeKey);
    if (existing) {
      existing.amount += item.amount;
      existing.sarsCode ??= item.sarsCode;
      existing.description ??= item.description;
    } else {
      merged.set(mergeKey, {
        id: `${blockId}:${item.category}`,
        month: item.month,
        employer: item.employer,
        category: item.category,
        sarsCode: item.sarsCode,
        description: item.description,
        amount: item.amount,
      });
    }
  }

  return [...merged.values()];
}

export function parsePayslipImportJson(raw: string, taxYear: string): ImportValidationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: ["That isn't valid JSON."] };
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, errors: ['Expected a JSON object with a "lineItems" array.'] };
  }

  const doc = parsed as Record<string, unknown>;
  const errors: string[] = [];

  if (doc.schemaVersion !== 1) {
    errors.push(`Unsupported schemaVersion ${JSON.stringify(doc.schemaVersion)} (expected 1).`);
  }

  if (doc.taxYear !== undefined && doc.taxYear !== taxYear) {
    errors.push(
      `Document tax year "${String(doc.taxYear)}" doesn't match the selected tax year "${taxYear}".`,
    );
  }

  if (!Array.isArray(doc.lineItems)) {
    errors.push('Expected "lineItems" to be an array.');
    return { ok: false, errors };
  }

  const items: IntermediateItem[] = [];

  doc.lineItems.forEach((raw, index) => {
    const prefix = `item ${index + 1}`;

    if (typeof raw !== "object" || raw === null) {
      errors.push(`${prefix}: expected an object.`);
      return;
    }
    const item = raw as Record<string, unknown>;

    if (typeof item.month !== "string") {
      errors.push(`${prefix}: "month" must be a string like "YYYY-MM".`);
      return;
    }
    const monthIndex = isoMonthToTaxYearIndex(item.month, taxYear);
    if (monthIndex === null) {
      errors.push(
        `${prefix}: "month" ${JSON.stringify(item.month)} is not a valid month in tax year ${taxYear}.`,
      );
      return;
    }

    if (typeof item.employer !== "string") {
      errors.push(`${prefix}: "employer" must be a string.`);
      return;
    }

    if (typeof item.category !== "string" || !VALID_CATEGORIES.has(item.category as LineItemCategory)) {
      errors.push(`${prefix}: unknown category ${JSON.stringify(item.category)}.`);
      return;
    }

    if (typeof item.amount !== "number" || !Number.isFinite(item.amount) || item.amount < 0) {
      errors.push(`${prefix}: "amount" must be a non-negative number.`);
      return;
    }

    if (item.sarsCode !== undefined && typeof item.sarsCode !== "string") {
      errors.push(`${prefix}: "sarsCode" must be a string if present.`);
      return;
    }

    if (item.description !== undefined && typeof item.description !== "string") {
      errors.push(`${prefix}: "description" must be a string if present.`);
      return;
    }

    items.push({
      month: monthIndex,
      employer: item.employer,
      category: item.category as LineItemCategory,
      sarsCode: item.sarsCode as string | undefined,
      description: item.description as string | undefined,
      amount: item.amount,
    });
  });

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, lineItems: assembleLineItems(items) };
}
