"""Posting moves money between two accounts as a balanced pair of entries.

Note for readers: the text ``import os`` in this docstring is not an import,
and neither is the commented one below.
"""

from __future__ import annotations

# from nowhere import nothing
from typing import TYPE_CHECKING

import ledger.util.money as money
from ledger.models import (
    Account,
    Entry,
    EntryKind,
)

if TYPE_CHECKING:
    from ledger.storage.repository import Repository


class PostingService:
    """Posts balanced transfers and records them in a repository."""

    def __init__(self, repository: Repository) -> None:
        self._repository = repository

    def transfer(self, source: Account, target: Account, amount: money.Money, memo: str = "") -> None:
        """Debit ``target`` and credit ``source`` by ``amount``."""
        source.post(Entry(EntryKind.CREDIT, amount, memo))
        target.post(Entry(EntryKind.DEBIT, amount, memo))
        self._repository.save(source)
        self._repository.save(target)

    def transfer_units(self, source: Account, target: Account, units: float) -> None:
        """Like :meth:`transfer`, taking a decimal amount."""
        self.transfer(source, target, money.Money.of(units))


def open_account(name: str) -> Account:
    """Create an empty account and record it, importing the repository lazily."""
    from ledger.storage.repository import Repository

    account = Account(name)
    Repository.shared().save(account)
    return account
