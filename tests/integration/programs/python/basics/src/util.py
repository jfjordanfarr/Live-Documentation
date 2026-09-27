from typing import Iterable


def summarize_values(values: Iterable[int]) -> str:
    total = sum(values)
    count = len(list(values)) if not isinstance(values, list) else len(values)
    average = total / count if count else 0
    return f"total={total};count={count};average={average:.2f}"
