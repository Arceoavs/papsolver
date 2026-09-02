export interface Tier {
  id: string;
  priceCents: number;
}

export interface SolveRequest {
  tiers: Tier[];
  targetCents: number;
}

export interface Assignment {
  tierId: string;
  priceCents: number;
  quantity: number;
}

export interface SolveResponse {
  targetCents: number;
  purchaseCount: number;
  assignments: Assignment[];
}

interface ErrorResponse {
  error?: {
    message?: string;
  };
}

export class NoSolutionError extends Error {
  constructor(message = "No exact combination exists for this balance.") {
    super(message);
    this.name = "NoSolutionError";
  }
}

async function readError(response: Response): Promise<string | undefined> {
  try {
    const body = (await response.json()) as ErrorResponse;
    return typeof body.error?.message === "string"
      ? body.error.message
      : undefined;
  } catch {
    return undefined;
  }
}

export async function solveBalance(
  request: SolveRequest,
  signal?: AbortSignal,
): Promise<SolveResponse> {
  const response = await fetch("/api/solve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal,
  });

  if (response.status === 409) {
    throw new NoSolutionError(await readError(response));
  }

  if (!response.ok) {
    const detail = await readError(response);
    throw new Error(detail ?? `The solver returned HTTP ${response.status}.`);
  }

  return (await response.json()) as SolveResponse;
}
