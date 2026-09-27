# ledger

A small double-entry ledger, written the way Python packages are written rather than the way a line scanner would like them to be. It is the program the Python adapter is measured on; `expected/compiler-edges.json` holds what `scip-python` resolves.

What it exercises, and where:

| Shape                                                       | Where                                                   |
| ----------------------------------------------------------- | ------------------------------------------------------- |
| Barrel re-exports (`from .x import Y` in `__init__.py`)     | `ledger/__init__.py`, `ledger/models/__init__.py`       |
| Importing through the barrel (`from ledger import Account`) | `ledger/storage/repository.py`, `tests/test_posting.py` |
| Relative imports, one and two dots                          | `ledger/models/account.py`, `ledger/models/entry.py`    |
| Multi-line parenthesized import                             | `ledger/services/posting.py`                            |
| Aliased module import and attribute use (`money.Money`)     | `ledger/services/posting.py`, `ledger/models/account.py` |
| Import inside a function                                    | `ledger/services/posting.py` (`open_account`)           |
| Import under `if TYPE_CHECKING:`                            | `ledger/services/posting.py`                            |
| Wildcard import                                             | `tests/test_posting.py`                                 |
| Import text inside a docstring and a comment                | `ledger/services/posting.py` (must not count)           |
| Nested class, property, classmethod, private helper         | `ledger/models/account.py`, `ledger/util/money.py`      |

Run it: `python -m ledger.cli 12.5`. Test it: `python -m pytest`.
