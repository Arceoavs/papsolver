const MONEY_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;
export const MAX_BALANCE_CENTS = 100_000;

export function parseMoneyToCents(value: string): number | null {
  const normalized = value.trim();
  if (!MONEY_PATTERN.test(normalized)) return null;

  const [whole, fraction = ""] = normalized.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));

  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_BALANCE_CENTS
    ? cents
    : null;
}

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}
