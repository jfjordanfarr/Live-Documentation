"""In-memory storage of accounts by name."""

from __future__ import annotations

from ledger import Account


class Repository:
    """Keeps accounts by name; one shared instance serves the process."""

    _instance: Repository | None = None

    def __init__(self) -> None:
        self._accounts: dict[str, Account] = {}

    @classmethod
    def shared(cls) -> Repository:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def save(self, account: Account) -> None:
        self._accounts[account.name] = account

    def get(self, name: str) -> Account | None:
        return self._accounts.get(name)

    def names(self) -> list[str]:
        return sorted(self._accounts)
