import { describe, expect, it } from "vitest";
import pricing from "../../app/data/de-prices.json";

const highlightedDescriptions = new Map<number, string>([
  [29, "Minimum price point for promotions and win-back offers"],
  [49, "Entry-level pricing for introductory and promotional offers"],
  [99, "Traditional Tier 1 choice for paid consumables in freemium apps"],
  [149, "A sub-Tier 2 option for promotions or one-off feature access"],
  [199, "Popular low-cost in-app purchase"],
  [299, "Suited to an indie paid app or permanent unlock"],
  [399, "Typical starting point for a monthly subscription"],
  [499, "Widely used monthly subscription price"],
  [999, "Monthly subscription level for professional plans"],
  [1_299, "Higher-end monthly subscription price"],
  [1_999, "One-time price for an indie game or professional app"],
  [2_999, "Typical starting point for an annual subscription"],
  [4_999, "Widely used annual subscription price"],
  [5_999, "Higher-end annual subscription price"],
  [7_999, "Annual subscription level for professional plans"],
  [9_999, "Upper end of traditional broadly marketed annual plans"],
  [19_999, "Premium annual price for professional or enterprise offerings"],
  [109_999, "Former maximum legacy tier before the 2023 pricing expansion"],
]);

describe("Germany pricing snapshot", () => {
  it("preserves all ordered price-point IDs and integer-cent values", () => {
    expect(pricing.metadata.recordCount).toBe(800);
    expect(pricing.prices).toHaveLength(800);

    pricing.prices.forEach((price, index) => {
      expect(price.id).toBe(`deu-${index.toString().padStart(4, "0")}`);
      expect(Number.isInteger(price.priceCents)).toBe(true);
      expect(price.priceCents).toBeGreaterThan(0);
      if (index > 0) {
        expect(price.priceCents).toBeGreaterThan(
          pricing.prices[index - 1]!.priceCents,
        );
      }
    });
  });

  it("contains the maintained paraphrases for exactly 18 highlighted prices", () => {
    expect(pricing.metadata.summaryAnnotations).toEqual({
      sourceTable: "canonical summary",
      sourceColumn: "Common use",
      sourcePublisher: "Galva",
      sourceUrl: "https://galva.io/tools/apple-pricing-tiers/region/de",
      contentTreatment:
        "Project-maintained paraphrases of the source's highlighted descriptions",
      recordCount: highlightedDescriptions.size,
    });

    const describedPrices = pricing.prices.filter(
      (price): price is typeof price & { description: string } =>
        "description" in price,
    );
    expect(describedPrices).toHaveLength(highlightedDescriptions.size);
    expect(describedPrices.map((price) => price.priceCents)).toEqual([
      ...highlightedDescriptions.keys(),
    ]);

    for (const price of describedPrices) {
      expect(price.description).toBe(highlightedDescriptions.get(price.priceCents));
    }
  });
});
