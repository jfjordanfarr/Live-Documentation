from util import summarize_values
from helpers import validate_seed


def run(seed: int) -> str:
    if not validate_seed(seed):
        raise ValueError("Seed must be non-negative")

    values = [seed, seed + 1, seed + 2]
    summary = summarize_values(values)
    return f"seed={seed}:{summary}"
