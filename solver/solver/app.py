from flask import Flask
from ortools.linear_solver import pywraplp
import os
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS Routes
CORS(app)

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
            price = tier["price"]["int"]
            var = self.solver.IntVar(0.0, self.solver.infinity(), tier["desc"])
            
            constraint.SetCoefficient(var, price)
            objective.SetCoefficient(var, price)

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


@app.route("/", methods=["GET"])
def status():
    title = "PapSolver"
    version = "v1.0"
    description = "REST API for calculating a set of values that add up to a specific, pre-defined value. Used for bringing down my dad's prepaid balance. This is accomplished by using linear optimization methods."
    return {"title": title, "version": version, "description": description}


@app.route("/solve", methods=["POST"])
def solve():
    tiers = app.current_request.json_body["tiers"]
    target = app.current_request.json_body["target"]
    PREPAID_SOLVER = PrepaidSolver(tiers, target)

    if not tiers or not target:
        raise BadRequestError("Please provide a non-empty problem!")

    return PREPAID_SOLVER.solveLinear()

if __name__ == '__main__':
    app.run()
