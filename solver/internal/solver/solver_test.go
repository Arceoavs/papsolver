package solver_test

import (
	"context"
	"errors"
	"strconv"
	"testing"

	"github.com/arceoavs/papsolver/solver/internal/domain"
	"github.com/arceoavs/papsolver/solver/internal/solver"
)

func problem(t *testing.T, target int64, tiers ...domain.TierSpec) domain.Problem {
	t.Helper()
	value, err := domain.NewProblem(target, tiers)
	if err != nil {
		t.Fatalf("NewProblem() error = %v", err)
	}
	return value
}

func TestSolveMinimizesPurchases(t *testing.T) {
	t.Parallel()

	result, err := solver.Solve(context.Background(), problem(t, 12,
		domain.TierSpec{ID: "three", PriceCents: 3},
		domain.TierSpec{ID: "four", PriceCents: 4},
	))
	if err != nil {
		t.Fatalf("Solve() error = %v", err)
	}
	if result.PurchaseCount != 3 {
		t.Fatalf("purchase count = %d, want 3", result.PurchaseCount)
	}
	if len(result.Assignments) != 1 || result.Assignments[0].TierID != "four" || result.Assignments[0].Quantity != 3 {
		t.Fatalf("assignments = %#v, want three purchases of four", result.Assignments)
	}
}

func TestSolveUsesRequestOrderAsTieBreaker(t *testing.T) {
	t.Parallel()

	result, err := solver.Solve(context.Background(), problem(t, 6,
		domain.TierSpec{ID: "four", PriceCents: 4},
		domain.TierSpec{ID: "three", PriceCents: 3},
		domain.TierSpec{ID: "two", PriceCents: 2},
	))
	if err != nil {
		t.Fatal(err)
	}
	if len(result.Assignments) != 2 || result.Assignments[0].TierID != "four" || result.Assignments[1].TierID != "two" {
		t.Fatalf("assignments = %#v, want four then two", result.Assignments)
	}
}

func TestSolveNormalizesGreatestCommonDivisor(t *testing.T) {
	t.Parallel()

	result, err := solver.Solve(context.Background(), problem(t, 18,
		domain.TierSpec{ID: "six", PriceCents: 6},
		domain.TierSpec{ID: "nine", PriceCents: 9},
	))
	if err != nil {
		t.Fatal(err)
	}
	if result.PurchaseCount != 2 || result.Assignments[0].TierID != "nine" {
		t.Fatalf("result = %#v, want two nines", result)
	}
}

func TestSolveReturnsNoSolution(t *testing.T) {
	t.Parallel()

	tests := []domain.Problem{
		problem(t, 7, domain.TierSpec{ID: "four", PriceCents: 4}, domain.TierSpec{ID: "six", PriceCents: 6}),
		problem(t, 5, domain.TierSpec{ID: "expensive", PriceCents: 99}),
	}
	for _, test := range tests {
		_, err := solver.Solve(context.Background(), test)
		if !errors.Is(err, solver.ErrNoExactSolution) {
			t.Fatalf("Solve() error = %v, want ErrNoExactSolution", err)
		}
	}
}

func TestSolveHonorsCancellation(t *testing.T) {
	t.Parallel()

	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err := solver.Solve(ctx, problem(t, 99, domain.TierSpec{ID: "one", PriceCents: 1}))
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("Solve() error = %v, want context.Canceled", err)
	}
}

func FuzzSolveIsExact(f *testing.F) {
	f.Add(int64(12), int64(3), int64(4))
	f.Add(int64(7), int64(4), int64(6))
	f.Fuzz(func(t *testing.T, target, first, second int64) {
		if target <= 0 || target > 500 || first <= 0 || first > 500 || second <= 0 || second > 500 || first == second {
			return
		}
		value := problem(t, target,
			domain.TierSpec{ID: "first", PriceCents: first},
			domain.TierSpec{ID: "second", PriceCents: second},
		)
		result, err := solver.Solve(context.Background(), value)
		minimum := bruteForceMinimum(target, first, second)
		if minimum == -1 && errors.Is(err, solver.ErrNoExactSolution) {
			return
		}
		if err != nil {
			t.Fatalf("Solve() error = %v", err)
		}
		if result.PurchaseCount != minimum {
			t.Fatalf("purchase count = %d, want minimum %d", result.PurchaseCount, minimum)
		}
		var total int64
		var count int
		for _, assignment := range result.Assignments {
			total += assignment.PriceCents * int64(assignment.Quantity)
			count += assignment.Quantity
		}
		if total != target || count != result.PurchaseCount {
			t.Fatalf("result = %#v: total = %d, count = %d", result, total, count)
		}
	})
}

func bruteForceMinimum(target, first, second int64) int {
	minimum := -1
	for firstCount := int64(0); firstCount*first <= target; firstCount++ {
		remaining := target - firstCount*first
		if remaining%second != 0 {
			continue
		}
		count := int(firstCount + remaining/second)
		if minimum == -1 || count < minimum {
			minimum = count
		}
	}
	return minimum
}

func BenchmarkSolveMaximumRequest(b *testing.B) {
	tiers := make([]domain.TierSpec, 800)
	for index := range tiers {
		tiers[index] = domain.TierSpec{ID: "tier-" + strconv.Itoa(index+1), PriceCents: int64(index + 1)}
	}
	value, err := domain.NewProblem(domain.MaxTargetCents, tiers)
	if err != nil {
		b.Fatal(err)
	}
	b.ResetTimer()
	for range b.N {
		if _, err := solver.Solve(context.Background(), value); err != nil {
			b.Fatal(err)
		}
	}
}
