"""
Utility helpers for the Rosetta benchmark fixture.

Pure functions with no external dependencies - testing
that adapters correctly identify leaf nodes in the graph.
"""

from typing import List


def format_value(value: float) -> str:
    """Formats a numeric value for display."""
    return f"{value:,.2f}"


def validate(input_str: str) -> bool:
    """Validates that a string is a valid identifier."""
    import re
    return bool(re.match(r'^[a-zA-Z][a-zA-Z0-9_-]*$', input_str))


def sum_values(values: List[float]) -> float:
    """Computes the sum of numeric values."""
    return sum(values)


def average(values: List[float]) -> float:
    """Computes the average of numeric values."""
    if not values:
        return 0.0
    return sum_values(values) / len(values)
