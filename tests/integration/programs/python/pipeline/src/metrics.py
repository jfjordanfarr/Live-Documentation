from typing import Sequence

from validators import ensure_not_empty, ensure_positive


def compute_summary(values: Sequence[int]) -> dict:
    ensure_not_empty(values, "metrics")
    ensure_positive(values)
    total = sum(values)
    count = len(values)
    average = total / count if count else 0
    return {"total": total, "count": count, "average": average}
