import json
from ortools.linear_solver import pywraplp


# unused; for testing
def loadData(file: str):
    with open(file, "r") as data:
        return json.load(data)["tiers"]


def initSolver():
    return pywraplp.Solver("TierSolver", pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING)


def buildSolver(tiers: dict, target: float):
    solver = initSolver()

    constraint = solver.Constraint(-solver.infinity(), target)
    objective = solver.Objective()
    objective.SetMaximization()

    for tier in tiers:
        if not tier["active"]:
            break
        else:
            var = solver.IntVar(0.0, solver.infinity(), tier["desc"])
            constraint.SetCoefficient(var, tier["price"])
            objective.SetCoefficient(var, tier["price"])
    return solver


def solveLinear(data, target):
    tiers = data
    solver = buildSolver(tiers, target)
    solver.Solve()
    return formatSolution(solver)


def formatSolution(solver):
    max_object_value = int(solver.Objective().Value())

    assignment = []
    for variable in solver.variables():
        assignment.append(
            {"tier": variable.name(), "value": int(variable.solution_value())}
        )

    return {"max_object_value": max_object_value, "assignment": assignment}
