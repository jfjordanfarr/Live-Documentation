"""Money as an integer number of cents, so sums are exact."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

CENTS_PER_UNIT = 100


@dataclass(frozen=True)
class Money:
    """An amount in cents."""

    cents: int

    @classmethod
    def of(cls, units: float) -> Money:
        """Build from a decimal amount such as 12.34."""
        return cls(_round_half_up(units * CENTS_PER_UNIT))

    def negate(self) -> Money:
        return Money(-self.cents)

    def is_positive(self) -> bool:
        return self.cents > 0

    def __add__(self, other: Money) -> Money:
        return Money(self.cents + other.cents)

    def __str__(self) -> str:
        return f"{self.cents / CENTS_PER_UNIT:.2f}"


def total(amounts: Iterable[Money]) -> Money:
    """Sum of the amounts; zero when there are none."""
    result = Money(0)
    for amount in amounts:
        result = result + amount
    return result


def _round_half_up(value: float) -> int:
    return int(value + 0.5) if value >= 0 else -int(-value + 0.5)
