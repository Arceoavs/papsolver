from app.models import Tier
from app.solver import solve_exact


def make_tier(description: str, cents: int) -> Tier:
    return Tier.model_validate({"desc": description, "price": {"int": cents, "full": cents / 100}})


def test_greatest_common_divisor_normalization_preserves_solution() -> None:
    tiers = [make_tier("six", 6), make_tier("nine", 9)]

    assert solve_exact(tiers, 18) == [0, 2]


def test_returns_none_when_target_is_not_reachable() -> None:
    tiers = [make_tier("six", 6), make_tier("nine", 9)]

    assert solve_exact(tiers, 10) is None
