class ValidationError(Exception):
    """Raised when validation of a data series fails."""


def ensure_not_empty(values, label):
    if not values:
        raise ValidationError(f"series '{label}' contained no data")


def ensure_positive(values):
    for value in values:
        if value < 0:
            raise ValidationError("encountered negative sample")
