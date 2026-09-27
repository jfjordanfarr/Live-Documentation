"""Exercises posting through the module import form and the package's wildcard export."""

import pytest

from ledger.services import posting
from ledger.storage.repository import Repository
from ledger import *  # noqa: F403


def test_transfer_balances_both_accounts() -> None:
    source = Account("source")
    target = Account("target")
    posting.PostingService(Repository()).transfer_units(source, target, 12.5)
    assert source.balance().cents == -1250
    assert target.balance().cents == 1250


def test_transfer_rejects_non_positive_amount() -> None:
    with pytest.raises(ValueError):
        posting.PostingService(Repository()).transfer(Account("a"), Account("b"), Money(0))
