from dataclasses import dataclass

from metrics import compute_summary
from repositories import load_series
from validators import ensure_not_empty


@dataclass
class Report:
    status: str
    payload: dict


def build_report(series_id: str) -> Report:
    samples = load_series(series_id)
    ensure_not_empty(samples, series_id)
    payload = compute_summary(samples)
    return Report(status="ok", payload=payload)
