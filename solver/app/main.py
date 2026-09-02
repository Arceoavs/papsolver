from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    Assignment,
    HealthResponse,
    ServiceInfo,
    SolveRequest,
    SolveResponse,
)
from .solver import solve_exact

app = FastAPI(
    title="PapSolver",
    summary="Find an exact combination of purchases for a prepaid balance.",
    version="2.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/", response_model=ServiceInfo)
def service_info() -> ServiceInfo:
    return ServiceInfo(
        title="PapSolver",
        version=app.version,
        description="Find an exact, minimum-purchase combination for a prepaid balance.",
    )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post("/solve", response_model=SolveResponse)
def solve(problem: SolveRequest) -> SolveResponse:
    values = solve_exact(problem.tiers, problem.target)
    if values is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No combination of the supplied tiers adds up to the target exactly.",
        )

    return SolveResponse(
        max_object_value=problem.target,
        assignment=[
            Assignment(tier=tier.desc, value=value)
            for tier, value in zip(problem.tiers, values, strict=True)
        ],
    )
