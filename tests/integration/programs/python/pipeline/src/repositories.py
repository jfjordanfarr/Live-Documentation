from typing import List

from validators import ValidationError

_DATASETS = {
    "baseline": [10, 14, 21, 16],
    "spiky": [5, 40, 2, 33],
}


def load_series(series_id: str) -> List[int]:
    if series_id == "missing":
        raise ValidationError("dataset unavailable")
    return list(_DATASETS.get(series_id, [1, 1, 1]))
