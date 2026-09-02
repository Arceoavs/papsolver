from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator

MAX_TARGET_CENTS = 100_000
MAX_PRICE_CENTS = 1_000_000
MAX_TIERS = 1_000

TierDescription = Annotated[
    str,
    StringConstraints(strip_whitespace=True, min_length=1, max_length=100),
]
TargetCents = Annotated[int, Field(strict=True, gt=0, le=MAX_TARGET_CENTS)]
PriceCents = Annotated[int, Field(strict=True, gt=0, le=MAX_PRICE_CENTS)]


class Price(BaseModel):
    model_config = ConfigDict(extra="forbid")

    int: PriceCents
    full: Annotated[float, Field(strict=True, gt=0, allow_inf_nan=False)]


class Tier(BaseModel):
    model_config = ConfigDict(extra="forbid")

    desc: TierDescription
    price: Price


class SolveRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tiers: Annotated[list[Tier], Field(min_length=1, max_length=MAX_TIERS)]
    target: TargetCents

    @model_validator(mode="after")
    def tiers_are_unique_and_consistent(self) -> Self:
        descriptions = [tier.desc for tier in self.tiers]
        if len(descriptions) != len(set(descriptions)):
            raise ValueError("tier descriptions must be unique")

        prices = [tier.price.int for tier in self.tiers]
        if len(prices) != len(set(prices)):
            raise ValueError("tier prices must be unique")

        inconsistent = [
            tier.desc for tier in self.tiers if round(tier.price.full * 100) != tier.price.int
        ]
        if inconsistent:
            raise ValueError("each price.full value must match price.int cents")

        return self


class Assignment(BaseModel):
    tier: str
    value: Annotated[int, Field(ge=0)]


class SolveResponse(BaseModel):
    max_object_value: int
    assignment: list[Assignment]


class ServiceInfo(BaseModel):
    title: str
    version: str
    description: str


class HealthResponse(BaseModel):
    status: str
