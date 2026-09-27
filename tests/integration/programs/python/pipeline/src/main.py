from pipeline import build_report
from validators import ValidationError


def run(series_id: str) -> dict:
    report = build_report(series_id)
    if report.status != "ok":
        raise ValidationError("report failed validation")
    return report.payload
