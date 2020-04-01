from chalice import (
    Chalice,
    Response,
    CORSConfig,
    AuthResponse,
    AuthRoute,
)
from chalice import NotFoundError, BadRequestError

# from operationsresearch.prepaid import PrepaidSolver
from ortools.linear_solver import pywraplp
import os

app = Chalice(app_name="solver")

# Configure CORS Routes
cors_allow_origin = os.getenv("CORS_ALLOW_ORIGIN", "*")
cors_config = CORSConfig(allow_origin=cors_allow_origin)

# Configure debug output
environment = os.getenv("CHALICE_ENVIRONMENT", "development")
if environment == "development":
    app.debug = True


class PrepaidSolver:
    def __init__(self, tiers: dict, target: float):
        self.solver = pywraplp.Solver(
            "TierSolver", pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING
        )
        self.tiers = tiers
        self.target = target

    def get_solver(self):
        return self.solver

    def buildSolver(self):
        constraint = self.solver.Constraint(-self.solver.infinity(), self.target)
        objective = self.solver.Objective()
        objective.SetMaximization()

        for tier in self.tiers:
            if not tier["active"]:
                break
            else:
                var = self.solver.IntVar(0.0, self.solver.infinity(), tier["desc"])
                constraint.SetCoefficient(var, tier["price"])
                objective.SetCoefficient(var, tier["price"])

    def formatSolution(self):
        max_object_value = int(self.solver.Objective().Value())

        assignment = []
        for variable in self.solver.variables():
            assignment.append(
                {"tier": variable.name(), "value": int(variable.solution_value())}
            )

        return {"max_object_value": max_object_value, "assignment": assignment}

    def solveLinear(self):
        self.buildSolver()
        self.solver.Solve()
        return self.formatSolution()


@app.route("/", api_key_required=True)
def status():
    title = "PapSolver"
    version = "v1.0"
    description = "REST API for calculating a set of values that add up to a specific, pre-defined value. Used for bringing down my dad's prepaid balance. This is accomplished by using linear optimization methods."
    return {"title": title, "version": version, "description": description}


@app.route("/solve", methods=["POST"], api_key_required=True)
def solve():
    tiers = app.current_request.json_body["tiers"]
    target = app.current_request.json_body["target"]
    PREPAID_SOLVER = PrepaidSolver(tiers, target)

    if not tiers or not target:
        raise BadRequestError("Please provide a non-empty problem!")

    return PREPAID_SOLVER.solveLinear()
