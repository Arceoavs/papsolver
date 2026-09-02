import { describe, expect, it } from "vitest";
import { parseCustomPriceList } from "../../app/utils/customPrices";

describe("parseCustomPriceList", () => {
  it("accepts prices alone and labels with common separators", () => {
    const result = parseCustomPriceList(
      ["0.99", "Coffee, 2.50", "Lunch — 7,25 €", "€10.00 Gift card"].join("\n"),
    );

    expect(result.errors).toEqual([]);
    expect(result.tiers).toEqual([
      { id: "custom-99", priceCents: 99 },
      { id: "custom-250", priceCents: 250, label: "Coffee" },
      { id: "custom-725", priceCents: 725, label: "Lunch" },
      { id: "custom-1000", priceCents: 1000, label: "Gift card" },
    ]);
  });

  it("deduplicates equal prices and keeps the first useful label", () => {
    const result = parseCustomPriceList("0.99\nSmall app, 0,99\nOther, 0.99");

    expect(result.tiers).toEqual([
      { id: "custom-99", priceCents: 99, label: "Small app" },
    ]);
    expect(result.duplicateCount).toBe(2);
  });

  it("reports invalid input with its original line number", () => {
    const result = parseCustomPriceList("Coffee\n\nFree, 0\nHuge, 10000.01");

    expect(result.tiers).toEqual([]);
    expect(result.errors.map(({ line }) => line)).toEqual([1, 3, 4]);
    expect(result.errors[0].input).toBe("Coffee");
  });

  it("ignores blank lines and accepts integer prices", () => {
    const result = parseCustomPriceList("\nTicket: 5\n  \n");

    expect(result.errors).toEqual([]);
    expect(result.tiers).toEqual([
      { id: "custom-500", priceCents: 500, label: "Ticket" },
    ]);
  });

  it("rejects labels longer than 120 characters", () => {
    const result = parseCustomPriceList(`${"x".repeat(121)}, 1.00`);

    expect(result.tiers).toEqual([]);
    expect(result.errors[0].message).toContain("120 characters");
  });

  it("rejects control characters in labels before submission", () => {
    const result = parseCustomPriceList("Hot\tCoffee, 2.50");

    expect(result.tiers).toEqual([]);
    expect(result.errors[0]?.message).toContain("control characters");
  });
});
