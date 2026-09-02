import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import BalanceSolver from "../../app/components/BalanceSolver.vue";

afterEach(() => vi.restoreAllMocks());

async function fillValidForm(wrapper: ReturnType<typeof mount>): Promise<void> {
  await wrapper.get("#balance").setValue("1.98");
  const selectAll = wrapper
    .findAll("button")
    .find((button) => button.text() === "Select all");
  if (!selectAll) throw new Error("Select-all button not found");
  await selectAll.trigger("click");
}

describe("balance solver view", () => {
  it("shows the returned exact purchase combination", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          targetCents: 198,
          purchaseCount: 2,
          assignments: [
            { tierId: "deu-0009", priceCents: 99, quantity: 2 },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const wrapper = mount(BalanceSolver);
    expect(wrapper.get("#tiers").text()).toContain(
      "Traditional Tier 1 choice for paid consumables in freemium apps",
    );
    await fillValidForm(wrapper);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Exact match for");
    expect(wrapper.text()).toContain("2×");
    expect(wrapper.text()).toContain("0,99");
    expect(wrapper.text()).toContain(
      "Traditional Tier 1 choice for paid consumables in freemium apps",
    );
  });

  it("renders an actionable message when no exact solution exists", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: "no_exact_solution",
            message: "No exact combination exists.",
          },
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );
    const wrapper = mount(BalanceSolver);
    await fillValidForm(wrapper);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("No exact combination found.");
    expect(wrapper.text()).toContain("Try selecting more price points");
  });

  it("keeps invalid forms local instead of calling the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const wrapper = mount(BalanceSolver);

    await wrapper.get("form").trigger("submit");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Enter a valid balance");
    expect(wrapper.text()).toContain("Choose at least one price point");
  });

  it("selects and highlights the described common price points", async () => {
    const wrapper = mount(BalanceSolver);
    const selectCommon = wrapper
      .findAll("button")
      .find((button) => button.text() === "Select common");

    if (!selectCommon) throw new Error("Select-common button not found");
    await selectCommon.trigger("click");

    expect(wrapper.findAll(".tier-option.selected")).toHaveLength(18);
    expect(wrapper.findAll(".tier-option.selected.common")).toHaveLength(18);
    expect(wrapper.text()).toContain("18 of 800 selected");
  });

  it("parses a custom list locally, merges duplicates, and submits labels", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          targetCents: 500,
          purchaseCount: 2,
          assignments: [
            { tierId: "custom-250", priceCents: 250, quantity: 2 },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const wrapper = mount(BalanceSolver);

    await wrapper.get('input[value="custom"]').setValue();
    await wrapper.get("#custom-prices").setValue(
      "Coffee, 2.50\nCoffee duplicate, 2,50\nSnack — 1.25",
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("2 unique prices ready");
    expect(wrapper.text()).toContain("1 duplicate was merged");

    await wrapper.get("#balance").setValue("5.00");
    await wrapper.get("form").trigger("submit");
    await flushPromises();

    const [, options] = fetchMock.mock.calls[0];
    expect(JSON.parse(String(options?.body))).toEqual({
      targetCents: 500,
      tiers: [
        { id: "custom-250", priceCents: 250, label: "Coffee" },
        { id: "custom-125", priceCents: 125, label: "Snack" },
      ],
    });
    expect(wrapper.text()).toContain("Coffee");
    expect(wrapper.text()).toContain("2×");
  });

  it("shows custom parse errors and does not silently submit partial input", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const wrapper = mount(BalanceSolver);

    await wrapper.get('input[value="custom"]').setValue();
    await wrapper.get("#custom-prices").setValue("Coffee, 2.50\nnot a price");
    await wrapper.get("#balance").setValue("5.00");
    await wrapper.get("form").trigger("submit");

    expect(wrapper.text()).toContain("1 line needs attention");
    expect(wrapper.text()).toContain("Line 2");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
