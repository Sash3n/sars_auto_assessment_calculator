export type TaxBracket = {
  min: number;
  max: number; // Infinity for the top bracket
  rate: number; // marginal rate, e.g. 0.18
  base: number; // cumulative tax owed at `min`
};

export type TaxYearTable = {
  /** SARS tax year label, e.g. "2025/26" covering 1 Mar 2025 - 28 Feb 2026 */
  year: string;
  brackets: TaxBracket[];
  rebates: {
    primary: number;
    secondary: number; // additional rebate from age 65
    tertiary: number; // additional rebate from age 75
  };
  taxThresholds: {
    under65: number;
    age65to74: number;
    age75Plus: number;
  };
  /** Medical scheme fees tax credit, per month */
  medicalCredit: {
    firstTwoMembers: number;
    additionalMember: number;
  };
  retirementDeduction: {
    annualCap: number;
    percentageOfIncome: number; // e.g. 0.275
  };
  interestExemption: {
    under65: number;
    age65Plus: number;
  };
};

/**
 * 2025/26 tax year (1 Mar 2025 - 28 Feb 2026) - assessed by SARS during
 * Filing Season 2026. Brackets unchanged from 2023/24 and 2024/25.
 * Source: docs/PROJECT_SPEC.md §2.2-2.9 (SARS published rates).
 */
export const TAX_YEAR_2025_26: TaxYearTable = {
  year: "2025/26",
  brackets: [
    { min: 0, max: 237_100, rate: 0.18, base: 0 },
    { min: 237_100, max: 370_500, rate: 0.26, base: 42_678 },
    { min: 370_500, max: 512_800, rate: 0.31, base: 77_362 },
    { min: 512_800, max: 673_000, rate: 0.36, base: 121_475 },
    { min: 673_000, max: 857_900, rate: 0.39, base: 179_147 },
    { min: 857_900, max: 1_817_000, rate: 0.41, base: 251_258 },
    { min: 1_817_000, max: Infinity, rate: 0.45, base: 644_489 },
  ],
  rebates: {
    primary: 17_235,
    secondary: 9_444,
    tertiary: 3_145,
  },
  taxThresholds: {
    under65: 95_750,
    age65to74: 148_217,
    age75Plus: 165_689,
  },
  medicalCredit: {
    firstTwoMembers: 364,
    additionalMember: 246,
  },
  retirementDeduction: {
    annualCap: 350_000,
    percentageOfIncome: 0.275,
  },
  interestExemption: {
    under65: 23_800,
    age65Plus: 34_500,
  },
};

/**
 * 2026/27 tax year (1 Mar 2026 - 28 Feb 2027) - first inflationary bracket
 * adjustment (+3.4%) since 2023/24. Full bracket table pending confirmation
 * against the official Budget 2026 Tax Guide; rebates/thresholds below are
 * confirmed. Retirement deduction cap rises to R430,000 from this year.
 */
export const TAX_YEAR_2026_27: TaxYearTable = {
  year: "2026/27",
  brackets: [
    { min: 0, max: 245_100, rate: 0.18, base: 0 },
    { min: 245_100, max: 383_000, rate: 0.26, base: 44_118 },
    { min: 383_000, max: 530_000, rate: 0.31, base: 80_112 },
    { min: 530_000, max: 696_100, rate: 0.36, base: 125_682 },
    { min: 696_100, max: 889_400, rate: 0.39, base: 185_478 },
    { min: 889_400, max: 1_879_800, rate: 0.41, base: 260_865 },
    { min: 1_879_800, max: Infinity, rate: 0.45, base: 667_129 },
  ],
  rebates: {
    primary: 17_820,
    secondary: 9_765,
    tertiary: 3_249,
  },
  taxThresholds: {
    under65: 99_000,
    age65to74: 153_250,
    age75Plus: 171_300,
  },
  medicalCredit: {
    firstTwoMembers: 376,
    additionalMember: 254,
  },
  retirementDeduction: {
    annualCap: 430_000,
    percentageOfIncome: 0.275,
  },
  interestExemption: {
    under65: 23_800,
    age65Plus: 34_500,
  },
};

export const TAX_YEAR_TABLES: Record<string, TaxYearTable> = {
  "2025/26": TAX_YEAR_2025_26,
  "2026/27": TAX_YEAR_2026_27,
};

export const DEFAULT_TAX_YEAR = "2025/26";
