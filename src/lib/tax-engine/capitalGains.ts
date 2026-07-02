import type { TaxYearTable } from "./tax-tables";

export type CapitalGainInput = {
  /** Amount received for the disposal */
  proceeds: number;
  /** Purchase price plus qualifying improvements and acquisition/disposal costs */
  baseCost: number;
  isPrimaryResidence: boolean;
  table: TaxYearTable["capitalGains"];
};

export type CapitalGainResult = {
  /** Raw gain (or loss, if negative) before any exclusions */
  capitalGain: number;
  /** Portion of the gain added to taxable income, taxed at normal marginal rates */
  taxableCapitalGain: number;
};

/**
 * SARS capital gains tax: the primary residence exclusion applies first
 * (only to a primary residence disposal), then the annual exclusion, and
 * the inclusion rate is applied to what remains. This only models a single
 * disposal in the year - the annual exclusion is in reality shared across
 * all of a taxpayer's disposals for the year, and base cost here must
 * already include qualifying improvements/costs (not computed here).
 */
export function calculateTaxableCapitalGain({
  proceeds,
  baseCost,
  isPrimaryResidence,
  table,
}: CapitalGainInput): CapitalGainResult {
  const capitalGain = proceeds - baseCost;

  if (capitalGain <= 0) {
    return { capitalGain, taxableCapitalGain: 0 };
  }

  const afterPrimaryResidenceExclusion = isPrimaryResidence
    ? Math.max(capitalGain - table.primaryResidenceExclusion, 0)
    : capitalGain;

  const netGain = Math.max(afterPrimaryResidenceExclusion - table.annualExclusion, 0);

  return {
    capitalGain,
    taxableCapitalGain: netGain * table.inclusionRate,
  };
}
