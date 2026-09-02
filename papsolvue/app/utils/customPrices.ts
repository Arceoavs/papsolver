import type { Tier } from "../services/solver";

export const MAX_CUSTOM_PRICE_CENTS = 1_000_000;
export const MAX_CUSTOM_TIERS = 1_000;
export const MAX_CUSTOM_LABEL_LENGTH = 120;

export interface CustomPriceParseError {
  line: number;
  input: string;
  message: string;
}

export interface CustomPriceParseResult {
  tiers: Tier[];
  errors: CustomPriceParseError[];
  duplicateCount: number;
}

interface ParsedLine {
  label?: string;
  priceCents: number;
}

const PRICE_AT_END = /(?:€\s*)?(\d+(?:[.,]\d{1,2})?)\s*€?\s*$/;
const PRICE_AT_START = /^(?:€\s*)?(\d+(?:[.,]\d{1,2})?)\s*€?(?:\s*[,;:|\t–—-]\s*|\s+)(.+)$/;
const TRAILING_SEPARATOR = /[\s,;:|\t–—-]+$/;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f-\u009f]/u;

function decimalToCents(value: string): number | null {
  const [whole, fraction = ""] = value.replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (
    !Number.isSafeInteger(cents) ||
    cents <= 0 ||
    cents > MAX_CUSTOM_PRICE_CENTS
  ) {
    return null;
  }
  return cents;
}

function normalizeLabel(value: string): string | undefined {
  const label = value.trim().replace(TRAILING_SEPARATOR, "").trim();
  return label || undefined;
}

function parseLine(input: string): ParsedLine | null {
  const endMatch = input.match(PRICE_AT_END);
  if (endMatch?.index !== undefined) {
    const priceText = endMatch[1];
    if (!priceText) return null;
    const priceCents = decimalToCents(priceText);
    if (priceCents === null) return null;
    const label = normalizeLabel(input.slice(0, endMatch.index));
    return { priceCents, ...(label ? { label } : {}) };
  }

  const startMatch = input.match(PRICE_AT_START);
  if (!startMatch) return null;
  const priceText = startMatch[1];
  const rawLabel = startMatch[2];
  if (!priceText || !rawLabel) return null;
  const priceCents = decimalToCents(priceText);
  if (priceCents === null) return null;
  const label = rawLabel.trim();
  return label ? { priceCents, label } : null;
}

export function parseCustomPriceList(value: string): CustomPriceParseResult {
  const tiersByPrice = new Map<number, Tier>();
  const errors: CustomPriceParseError[] = [];
  let duplicateCount = 0;

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const input = rawLine.trim();
    if (!input) return;

    const parsed = parseLine(input);
    if (!parsed) {
      errors.push({
        line: index + 1,
        input,
        message: `Use a positive price up to €10,000, for example “Coffee, 2.50”.`,
      });
      return;
    }

    if (
      parsed.label &&
      Array.from(parsed.label).length > MAX_CUSTOM_LABEL_LENGTH
    ) {
      errors.push({
        line: index + 1,
        input,
        message: `Labels must not exceed ${MAX_CUSTOM_LABEL_LENGTH} characters.`,
      });
      return;
    }

    if (parsed.label && CONTROL_CHARACTER.test(parsed.label)) {
      errors.push({
        line: index + 1,
        input,
        message: "Labels must not contain control characters.",
      });
      return;
    }

    const existing = tiersByPrice.get(parsed.priceCents);
    if (existing) {
      duplicateCount += 1;
      if (!existing.label && parsed.label) existing.label = parsed.label;
      return;
    }

    if (tiersByPrice.size >= MAX_CUSTOM_TIERS) {
      errors.push({
        line: index + 1,
        input,
        message: `Only ${MAX_CUSTOM_TIERS.toLocaleString("en")} unique prices can be used at once.`,
      });
      return;
    }

    tiersByPrice.set(parsed.priceCents, {
      id: `custom-${parsed.priceCents}`,
      priceCents: parsed.priceCents,
      ...(parsed.label ? { label: parsed.label } : {}),
    });
  });

  return {
    tiers: [...tiersByPrice.values()],
    errors,
    duplicateCount,
  };
}
