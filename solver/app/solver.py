from collections.abc import Sequence
from functools import reduce
from math import gcd

from .models import Tier


def solve_exact(tiers: Sequence[Tier], target: int) -> list[int] | None:
    """Return a deterministic minimum-purchase assignment, or ``None``.

    The tier order is the tie-breaker: when equally small assignments exist, the
    first tier in the request is preferred at the first differing choice.
    """
    active_tiers = [
        (tier_index, tier.price.int)
        for tier_index, tier in enumerate(tiers)
        if tier.price.int <= target
    ]
    if not active_tiers:
        return None

    prices = [price for _, price in active_tiers]
    common_divisor = reduce(gcd, prices)
    if target % common_divisor:
        return None

    normalized_target = target // common_divisor
    normalized_prices = [price // common_divisor for price in prices]
    unreachable = normalized_target + 1
    purchase_counts = [unreachable] * (normalized_target + 1)
    selected_tier = [-1] * (normalized_target + 1)
    purchase_counts[0] = 0

    for subtotal in range(1, normalized_target + 1):
        best_count = unreachable
        best_tier = -1
        for tier_index, price in enumerate(normalized_prices):
            previous = subtotal - price
            if previous < 0 or purchase_counts[previous] == unreachable:
                continue

            candidate = purchase_counts[previous] + 1
            if candidate < best_count:
                best_count = candidate
                best_tier = tier_index

        purchase_counts[subtotal] = best_count
        selected_tier[subtotal] = best_tier

    if selected_tier[normalized_target] == -1:
        return None

    assignment = [0] * len(tiers)
    subtotal = normalized_target
    while subtotal:
        active_tier_index = selected_tier[subtotal]
        original_tier_index = active_tiers[active_tier_index][0]
        assignment[original_tier_index] += 1
        subtotal -= normalized_prices[active_tier_index]

    return assignment
