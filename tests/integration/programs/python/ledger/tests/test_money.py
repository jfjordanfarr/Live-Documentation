from ledger.util.money import Money, total


def test_of_rounds_to_cents() -> None:
    assert Money.of(12.345).cents == 1235


def test_total_of_nothing_is_zero() -> None:
    assert total([]).cents == 0
