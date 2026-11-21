# `tests/integration/programs/compiler-differences.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/compiler-differences.json`
- Generated At: 2026-11-21T05:42:36.183Z

## Authored
### Purpose
The ledger of every difference between the readers and the compiler on the sample programs, by cause: each cause says in a sentence what the reader does and what the compiler does, whether it is a gap the readers mean to close or a difference of grain they may keep, and lists the missing and extra edges it explains, program by program. `tests/integration/live-docs/oracle.test.ts` fails on a difference no cause lists and on a listed one no longer found, so a reader's regression on any sample program fails the gate, and a mend removes its edges in the same commit.

### Notes
- Written on 2026-11-21 ([the account](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)), after the comparison had reported these differences for months while its test asserted only the bookkeeping. It is kept once at the programs' root, not beside each program's `compiler-edges.json`, because one cause explains edges of several programs: C's header against the `.c` that defines a function explains thirty-three edges in four. Each cause was confirmed by reading its language's reader (`c.ts`, `go.ts`, `python.ts`, `rust.ts`) and the files the edges join.
- The kinds were proposed by the builder and ruled by the root the same day. Three causes are gaps. The first is C's call to the file that defines a function, the builder's proposed grain overruled: a caller that does not reach the file implementing what it calls leaves the map answering what is reachable from `main.c` with headers only, and a `.c` nothing reaches looking like dead code, the two questions the tool is for. It waits on a rule measured against scip-clang on real C repositories. The other two are C's names reached through a header another header includes and, across Go, Python and Rust, a method called on a value whose type the code does not write. Go's package symbol, Python's `__init__.py` and Rust's crate root are grain, each for the reason its sentence gives.
- An edge the program's hand-verified list asserts is no extra, since that list holds what is true and the compiler cannot see; the estate's HTTP call from the portal's gateway client, once this ledger's one edge of a third kind, left it so.
- Paths are relative to each program; `program` is `<language>/<program>`, as the test names the programs it walks.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `convention` {#symbol-convention}
- Type: key

#### `causes` {#symbol-causes}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
