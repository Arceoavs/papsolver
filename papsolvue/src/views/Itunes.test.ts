import { flushPromises, mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import Itunes from "./Itunes.vue";

afterEach(() => vi.restoreAllMocks());

async function fillValidForm(wrapper: ReturnType<typeof mount>): Promise<void> {
  await wrapper.get("#balance").setValue("1.98");
  const selectAll = wrapper
    .findAll("button")
    .find((button) => button.text() === "Select all");
  if (!selectAll) throw new Error("Select-all button not found");
  await selectAll.trigger("click");
}

describe("iTunes solver view", () => {
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
    const wrapper = mount(Itunes);
    await fillValidForm(wrapper);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("Exact match for");
    expect(wrapper.text()).toContain("2×");
    expect(wrapper.text()).toContain("0,99");
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
    const wrapper = mount(Itunes);
    await fillValidForm(wrapper);

    await wrapper.get("form").trigger("submit");
    await flushPromises();

    expect(wrapper.text()).toContain("No exact combination found.");
    expect(wrapper.text()).toContain("Try selecting more price points");
  });

  it("keeps invalid forms local instead of calling the API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const wrapper = mount(Itunes);

    await wrapper.get("form").trigger("submit");

    expect(fetchMock).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain("Enter a valid balance");
    expect(wrapper.text()).toContain("Choose at least one price point");
  });
});
