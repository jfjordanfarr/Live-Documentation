# Tests of reader.py

Run everything with `python3 -I tests/run_all.py`:

- the three samples: `read` gives each `.txt` byte for byte, `name` of each `.txt` gives the name its `.fpk`'s end holds, `graph` answers;
- `make_cases.py` writes 188 files that must be refused into `refuse/` (binary cases with correct hashes and ends, so that the check named is the one reached), listed with their sections in `refuse/CASES.tsv`; `run_refusals.py` runs the program on each (`-v` shows each reason);
- `roundtrip.py` makes random valid scans with awkward strings and up to 600 files, serialized by Python's `json` (not by the reader), and checks that `name` accepts the text, that the packed file reads back to the same text with the same name, and that `graph` equals a graph derived separately from section 5; a few are kept in `valid/`;
- `mutate.py` mutates the samples' bytes and, re-sealed with correct hashes, their uncompressed sections; each answer must be a refusal or facts, and any facts must be canonical (their text valid, with the same name).

`stress.py` and `make_big.py` build valid files near the 64× inflation bound and past the text bound in `tests/big/` and time the reader on them (run by hand; they take minutes).
