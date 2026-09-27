"""Command line entry point: opens two accounts and moves money between them."""

import sys

from ledger.services.posting import PostingService, open_account
from ledger.storage.repository import Repository


def main(argv: list[str]) -> int:
    """Transfer the amount given on the command line and print both balances."""
    units = float(argv[1]) if len(argv) > 1 else 10.0
    cash = open_account("cash")
    sales = open_account("sales")
    PostingService(Repository.shared()).transfer_units(sales, cash, units)
    for name in Repository.shared().names():
        account = Repository.shared().get(name)
        print(f"{name}: {account.balance()}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
