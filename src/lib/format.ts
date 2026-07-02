const ZAR_FORMATTER = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number): string {
  return ZAR_FORMATTER.format(amount);
}
