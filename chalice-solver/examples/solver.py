from ortools.linear_solver import pywraplp


def IntegerProgrammingExample():
    solver = pywraplp.Solver(
        "IntegerProgrammingExample", pywraplp.Solver.CBC_MIXED_INTEGER_PROGRAMMING
    )

    # x, y, and z are non-negative integer variables.
    x = solver.IntVar(0.0, solver.infinity(), "x")
    y = solver.IntVar(0.0, solver.infinity(), "y")
    z = solver.IntVar(0.0, solver.infinity(), "z")

    # ... <= target
    constraint0 = solver.Constraint(-solver.infinity(), 26)
    constraint0.SetCoefficient(x, 1)
    constraint0.SetCoefficient(y, 2)
    constraint0.SetCoefficient(z, 3)

    # Maximize ...
    objective = solver.Objective()
    objective.SetCoefficient(x, 1)
    objective.SetCoefficient(y, 2)
    objective.SetCoefficient(z, 3)
    objective.SetMaximization()

    # Solve the problem and print the solution.
    solver.Solve()
    # Print the objective value of the solution.
    print("Maximum objective function value = %d" % solver.Objective().Value())
    print()
    # Print the value of each variable in the solution.
    for variable in [x, y, z]:
        print("%s = %d" % (variable.name(), variable.solution_value()))


IntegerProgrammingExample()
