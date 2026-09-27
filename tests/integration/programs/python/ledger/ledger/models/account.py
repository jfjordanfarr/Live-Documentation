"""An account accumulates entries and knows its balance."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable

from ..util import money
from .entry import Entry, EntryKind


@dataclass
class Account:
    """A named account with the entries posted to it."""

    name: str
    entries: list[Entry] = field(default_factory=list)

    def post(self, entry: Entry) -> None:
        """Append an entry. Rejects an entry whose amount is not positive."""
        if not entry.amount.is_positive():
            raise ValueError("an entry must move a positive amount")
        self.entries.append(entry)

    def balance(self) -> money.Money:
        """Debits minus credits over every entry."""
        return money.total(entry.signed for entry in self.entries)

    def entries_of(self, kind: EntryKind) -> Iterable[Entry]:
        return (entry for entry in self.entries if entry.kind is kind)

    class Snapshot:
        """The balance at a point in time, for reports."""

        def __init__(self, account: Account) -> None:
            self.name = account.name
            self.balance = account.balance()
