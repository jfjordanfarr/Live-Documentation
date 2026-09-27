"""An entry is one side of a posting: a debit or a credit of some money."""

from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

from ..util.money import Money


class EntryKind(Enum):
    """Which side of the ledger an entry lands on."""

    DEBIT = "debit"
    CREDIT = "credit"


@dataclass(frozen=True)
class Entry:
    """One debit or credit, with the money it moves and when it was posted."""

    kind: EntryKind
    amount: Money
    memo: str = ""
    posted_at: datetime = field(default_factory=datetime.utcnow)

    @property
    def signed(self) -> Money:
        """The amount with the sign of its side: debits positive, credits negative."""
        return self.amount if self.kind is EntryKind.DEBIT else self.amount.negate()

    def describe(self) -> str:
        return f"{self.kind.value} {self.amount} {self.memo}".strip()
