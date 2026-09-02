// Package domain defines validated solver inputs and monetary values.
package domain

import (
	"errors"
	"fmt"
	"slices"
	"strings"
	"unicode/utf8"
)

const (
	MaxTargetCents  = int64(100_000)
	MaxPriceCents   = int64(1_000_000)
	MaxTiers        = 1_000
	MaxTierIDLength = 100
)

// ErrInvalidProblem identifies input that violates a domain constraint.
var ErrInvalidProblem = errors.New("invalid problem")

// Cents is a positive monetary amount represented in minor EUR units.
// Its representation is private so values can only be created by validation.
type Cents struct {
	minor int64
}

// MinorUnits returns the integer number of cents.
func (c Cents) MinorUnits() int64 {
	return c.minor
}

// Tier is a validated App Store price point.
type Tier struct {
	id    string
	price Cents
}

func (t Tier) ID() string   { return t.id }
func (t Tier) Price() Cents { return t.price }

// TierSpec is the primitive representation accepted at the domain boundary.
type TierSpec struct {
	ID         string
	PriceCents int64
}

// Problem is a fully validated exact-sum problem.
type Problem struct {
	target Cents
	tiers  []Tier
}

// NewProblem validates primitive API input and constructs a problem.
func NewProblem(targetCents int64, specs []TierSpec) (Problem, error) {
	if targetCents <= 0 {
		return Problem{}, invalid("targetCents must be positive")
	}
	if targetCents > MaxTargetCents {
		return Problem{}, invalid("targetCents must not exceed %d", MaxTargetCents)
	}
	if len(specs) == 0 {
		return Problem{}, invalid("tiers must contain at least one price point")
	}
	if len(specs) > MaxTiers {
		return Problem{}, invalid("tiers must not contain more than %d price points", MaxTiers)
	}

	tiers := make([]Tier, 0, len(specs))
	seenIDs := make(map[string]struct{}, len(specs))
	seenPrices := make(map[int64]struct{}, len(specs))
	for index, spec := range specs {
		id := strings.TrimSpace(spec.ID)
		if id == "" {
			return Problem{}, invalid("tiers[%d].id must not be blank", index)
		}
		if utf8.RuneCountInString(id) > MaxTierIDLength {
			return Problem{}, invalid("tiers[%d].id must not exceed %d characters", index, MaxTierIDLength)
		}
		if _, exists := seenIDs[id]; exists {
			return Problem{}, invalid("tier IDs must be unique: %q", id)
		}
		if spec.PriceCents <= 0 {
			return Problem{}, invalid("tiers[%d].priceCents must be positive", index)
		}
		if spec.PriceCents > MaxPriceCents {
			return Problem{}, invalid("tiers[%d].priceCents must not exceed %d", index, MaxPriceCents)
		}
		if _, exists := seenPrices[spec.PriceCents]; exists {
			return Problem{}, invalid("tier prices must be unique: %d", spec.PriceCents)
		}

		seenIDs[id] = struct{}{}
		seenPrices[spec.PriceCents] = struct{}{}
		tiers = append(tiers, Tier{id: id, price: Cents{minor: spec.PriceCents}})
	}

	return Problem{target: Cents{minor: targetCents}, tiers: tiers}, nil
}

func (p Problem) Target() Cents { return p.target }

// Tiers returns a shallow copy so callers cannot reorder the problem in place.
func (p Problem) Tiers() []Tier { return slices.Clone(p.tiers) }

func invalid(format string, args ...any) error {
	return fmt.Errorf("%w: %s", ErrInvalidProblem, fmt.Sprintf(format, args...))
}
