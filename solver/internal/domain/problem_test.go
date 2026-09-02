package domain_test

import (
	"errors"
	"strings"
	"testing"

	"github.com/arceoavs/papsolver/solver/internal/domain"
)

func TestNewProblem(t *testing.T) {
	t.Parallel()

	problem, err := domain.NewProblem(198, []domain.TierSpec{{ID: " tier-99 ", PriceCents: 99}})
	if err != nil {
		t.Fatalf("NewProblem() error = %v", err)
	}
	if got := problem.Target().MinorUnits(); got != 198 {
		t.Fatalf("target = %d, want 198", got)
	}
	tiers := problem.Tiers()
	if got := tiers[0].ID(); got != "tier-99" {
		t.Fatalf("trimmed tier ID = %q, want tier-99", got)
	}
	if got := tiers[0].Price().MinorUnits(); got != 99 {
		t.Fatalf("price = %d, want 99", got)
	}
}

func TestNewProblemRejectsInvalidInput(t *testing.T) {
	t.Parallel()

	validTier := domain.TierSpec{ID: "tier", PriceCents: 99}
	tests := []struct {
		name   string
		target int64
		tiers  []domain.TierSpec
	}{
		{name: "zero target", target: 0, tiers: []domain.TierSpec{validTier}},
		{name: "large target", target: domain.MaxTargetCents + 1, tiers: []domain.TierSpec{validTier}},
		{name: "no tiers", target: 99},
		{name: "blank ID", target: 99, tiers: []domain.TierSpec{{ID: "  ", PriceCents: 99}}},
		{name: "long ID", target: 99, tiers: []domain.TierSpec{{ID: strings.Repeat("x", 101), PriceCents: 99}}},
		{name: "zero price", target: 99, tiers: []domain.TierSpec{{ID: "free", PriceCents: 0}}},
		{name: "large price", target: 99, tiers: []domain.TierSpec{{ID: "large", PriceCents: domain.MaxPriceCents + 1}}},
		{name: "duplicate ID", target: 99, tiers: []domain.TierSpec{{ID: "same", PriceCents: 49}, {ID: "same", PriceCents: 50}}},
		{name: "duplicate price", target: 99, tiers: []domain.TierSpec{{ID: "a", PriceCents: 99}, {ID: "b", PriceCents: 99}}},
	}

	tooMany := make([]domain.TierSpec, domain.MaxTiers+1)
	for index := range tooMany {
		tooMany[index] = domain.TierSpec{ID: string(rune(index + 1)), PriceCents: int64(index + 1)}
	}
	tests = append(tests, struct {
		name   string
		target int64
		tiers  []domain.TierSpec
	}{name: "too many tiers", target: 99, tiers: tooMany})

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			t.Parallel()
			_, err := domain.NewProblem(test.target, test.tiers)
			if !errors.Is(err, domain.ErrInvalidProblem) {
				t.Fatalf("NewProblem() error = %v, want ErrInvalidProblem", err)
			}
		})
	}
}

func TestTiersReturnsCopy(t *testing.T) {
	t.Parallel()

	problem, err := domain.NewProblem(198, []domain.TierSpec{{ID: "a", PriceCents: 99}, {ID: "b", PriceCents: 198}})
	if err != nil {
		t.Fatal(err)
	}
	first := problem.Tiers()
	first[0], first[1] = first[1], first[0]
	if got := problem.Tiers()[0].ID(); got != "a" {
		t.Fatalf("mutating returned tiers changed problem order: first ID = %q", got)
	}
}
