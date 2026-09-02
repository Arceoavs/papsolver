import { afterEach, describe, expect, it, vi } from "vitest";
import { NoSolutionError, solveBalance, type SolveRequest } from "./solver";

const request: SolveRequest = {
  target: 198,
  tiers: [{ desc: "tier-99", price: { int: 99, full: 0.99 } }],
};

afterEach(() => vi.restoreAllMocks());

describe("solveBalance", () => {
  it("posts the established request contract to the proxied API", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({ assignment: [{ tier: "tier-99", value: 2 }] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    await expect(solveBalance(request)).resolves.toEqual({
      assignment: [{ tier: "tier-99", value: 2 }],
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
      new Response(JSON.stringify({ detail: "No exact solution" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(solveBalance(request)).rejects.toEqual(
      new NoSolutionError("No exact solution"),
    );
  });
});
