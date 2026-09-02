// Package solver implements the exact minimum-purchase optimization.
package solver

import (
	"context"
	"errors"

	"github.com/arceoavs/papsolver/solver/internal/domain"
)

// ErrNoExactSolution means no nonnegative combination reaches the target.
var ErrNoExactSolution = errors.New("no exact solution")

type Assignment struct {
	TierID     string
	Label      *string
	PriceCents int64
	Quantity   int
}

type Result struct {
	TargetCents   int64
	PurchaseCount int
	Assignments   []Assignment
}

type activeTier struct {
	id              string
	label           *string
	priceCents      int64
	normalizedPrice int
}

// Solve returns a deterministic exact solution with the fewest purchases.
// Request order breaks ties between solutions with the same purchase count.
func Solve(ctx context.Context, problem domain.Problem) (Result, error) {
	if err := ctx.Err(); err != nil {
		return Result{}, err
	}

	targetCents := problem.Target().MinorUnits()
	tiers := problem.Tiers()
	active := make([]activeTier, 0, len(tiers))
	var divisor int64
	for _, tier := range tiers {
		price := tier.Price().MinorUnits()
		if price > targetCents {
			continue
		}
		var label *string
		if value, ok := tier.Label(); ok {
			label = &value
		}
		divisor = greatestCommonDivisor(divisor, price)
		active = append(active, activeTier{id: tier.ID(), label: label, priceCents: price})
	}
	if len(active) == 0 || targetCents%divisor != 0 {
		return Result{}, ErrNoExactSolution
	}

	normalizedTarget := int(targetCents / divisor)
	for index := range active {
		active[index].normalizedPrice = int(active[index].priceCents / divisor)
	}

	unreachable := normalizedTarget + 1
	purchaseCounts := make([]int, normalizedTarget+1)
	selectedTier := make([]int, normalizedTarget+1)
	for subtotal := 1; subtotal <= normalizedTarget; subtotal++ {
		purchaseCounts[subtotal] = unreachable
		selectedTier[subtotal] = -1
	}

	for subtotal := 1; subtotal <= normalizedTarget; subtotal++ {
		if subtotal&255 == 0 {
			if err := ctx.Err(); err != nil {
				return Result{}, err
			}
		}

		bestCount := unreachable
		bestTier := -1
		for tierIndex, tier := range active {
			previous := subtotal - tier.normalizedPrice
			if previous < 0 || purchaseCounts[previous] == unreachable {
				continue
			}
			candidate := purchaseCounts[previous] + 1
			if candidate < bestCount {
				bestCount = candidate
				bestTier = tierIndex
			}
		}
		purchaseCounts[subtotal] = bestCount
		selectedTier[subtotal] = bestTier
	}

	if selectedTier[normalizedTarget] == -1 {
		return Result{}, ErrNoExactSolution
	}

	quantities := make([]int, len(active))
	for subtotal := normalizedTarget; subtotal > 0; {
		tierIndex := selectedTier[subtotal]
		quantities[tierIndex]++
		subtotal -= active[tierIndex].normalizedPrice
	}

	assignments := make([]Assignment, 0, len(active))
	for index, quantity := range quantities {
		if quantity == 0 {
			continue
		}
		assignments = append(assignments, Assignment{
			TierID:     active[index].id,
			Label:      active[index].label,
			PriceCents: active[index].priceCents,
			Quantity:   quantity,
		})
	}

	return Result{
		TargetCents:   targetCents,
		PurchaseCount: purchaseCounts[normalizedTarget],
		Assignments:   assignments,
	}, nil
}

func greatestCommonDivisor(left, right int64) int64 {
	for right != 0 {
		left, right = right, left%right
	}
	return left
}
