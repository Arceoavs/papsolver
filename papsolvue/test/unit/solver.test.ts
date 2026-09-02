import { afterEach, describe, expect, it, vi } from "vitest";
import {
  NoSolutionError,
  solveBalance,
  type SolveRequest,
} from "../../app/services/solver";

const request: SolveRequest = {
  targetCents: 198,
  tiers: [{ id: "tier-99", priceCents: 99, label: "Small app" }],
};

afterEach(() => vi.restoreAllMocks());

describe("solveBalance", () => {
  it("posts the integer-cent request contract to the proxied API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          targetCents: 198,
          purchaseCount: 2,
          assignments: [
            {
              tierId: "tier-99",
              priceCents: 99,
              quantity: 2,
              label: "Small app",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(solveBalance(request)).resolves.toEqual({
      targetCents: 198,
      purchaseCount: 2,
      assignments: [
        {
          tierId: "tier-99",
          priceCents: 99,
          quantity: 2,
          label: "Small app",
        },
      ],
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/solve",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(request),
      }),
    );
  });

  it("turns a 409 response into an explicit no-solution result", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: { code: "no_exact_solution", message: "No exact solution" },
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    await expect(solveBalance(request)).rejects.toEqual(
      new NoSolutionError("No exact solution"),
    );
  });
});
