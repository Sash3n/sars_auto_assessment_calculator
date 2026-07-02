export type RentalProperty = {
  /** Gross rental income received for the year */
  income: number;
  /** Total revenue expenses incurred (rates, interest, repairs, agent fees, etc.) */
  expenses: number;
  /** Fraction of the property's area that was let (1 = whole property) */
  areaLetFraction: number;
  /** Fraction of the year the property was let (1 = let all 12 months) */
  monthsLetFraction: number;
};

export type RentalPropertyResult = RentalProperty & {
  deductibleExpenses: number;
  netIncome: number;
};

export type RentalIncomeResult = {
  properties: RentalPropertyResult[];
  netIncome: number;
  /** True if the combined result is a loss — surfaced as a ring-fencing advisory, not blocked */
  hasLoss: boolean;
};

/**
 * Nets rental income against expenses per SARS rules: only expenses
 * incurred in the production of rental income are deductible, apportioned
 * by the fraction of the property let by area and by time.
 */
export function calculateNetRentalIncome(
  properties: RentalProperty[],
): RentalIncomeResult {
  const results = properties.map((property) => {
    const apportionment = property.areaLetFraction * property.monthsLetFraction;
    const deductibleExpenses = property.expenses * apportionment;
    const netIncome = property.income - deductibleExpenses;
    return { ...property, deductibleExpenses, netIncome };
  });

  const netIncome = results.reduce((sum, r) => sum + r.netIncome, 0);

  return {
    properties: results,
    netIncome,
    hasLoss: netIncome < 0,
  };
}
