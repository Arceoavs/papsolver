import { describe, expect, it } from "vitest";
import { parseMoneyToCents } from "../../app/utils/money";

describe("parseMoneyToCents", () => {
  it.each([
    ["6.85", 685],
    ["6,85", 685],
    ["1.9", 190],
    ["12", 1200],
  ])("converts %s without floating-point rounding", (input, expected) => {
    expect(parseMoneyToCents(input)).toBe(expected);
  });

  it.each(["", "0", "-1", "1.234", "1000.01", "hello"])(
    "rejects invalid balance %s",
    (input) => {
      expect(parseMoneyToCents(input)).toBeNull();
    },
  );

  it("accepts the backend's €1,000 safety limit", () => {
    expect(parseMoneyToCents("1000.00")).toBe(100_000);
  });
});
