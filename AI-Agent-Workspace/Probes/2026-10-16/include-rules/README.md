# The include rule, chosen by which candidate disagrees least with the compiler

_A probe of October 16, 2026, by the root Claude Code agent (Fable 5.1), for the rule the C and C++ adapter uses to resolve a quoted `#include` without reading the build. The owner asked that the rule be "testable as to whether it's not better than an alternative" and, told that the oracle would judge it, "**Profound**. I quite like this." ([Turn 8 and Turn 9 of the October 15 session](../../../ChatHistory/2026/10/2026-10-15.1.record.md#turn-8)). The script is disposable and not committed; this record and the fixture it ran on are._

## Method

scip-clang indexes a fixture from its compilation database and records, for every `#include` it resolved, a reference to the included file's own symbol (`` `<file>/src/models.h`/ ``), so the compiler's resolution of each include is an edge in the fixture's `expected/compiler-edges.json`, written by `npm run oracle:index`. The adapter's `analyzeCSource` resolves the same includes under each candidate strategy, and the script counts, per strategy, the includes it resolved to the compiler's file (agree), to another file (differ), to nothing (unresolved), and the files it resolved that the compiler did not include (extra). Three fixtures: the C rosetta sample (`tests/integration/programs/c/rosetta`, flat `src/`, compiled with `-I src`), the C++ rosetta sample (`tests/integration/programs/cpp/rosetta`, the same shape), and the include-directories fixture (`tests/integration/fixtures/include-dirs`, laid out to tell the rules apart: a sibling include, an `-I include` include, an `-I src` include, an `-I .` include, and two decoys with the same tails that nothing includes; its README says what each rule should make of each include).

The candidates:

- **including-directory**: only the including file's directory, today's rule.
- **ancestors**: the including file's directory, then each ancestor up to and including the workspace root.
- **any-directory**: any directory in the workspace whose tail matches the include's directory part, nearest first and then alphabetical; greedy, and able to pick a decoy.
- **ancestors-with-include-directories**: the ancestors rule, trying at each ancestor the specifier itself, then under its `include/`, then under its `src/`; the common `-I include` and `-I src` layouts without reading a build file.

## What it found

Agreements with the compiler, out of the includes it resolved, with what went wrong where it did:

| Fixture (includes) | including-directory | ancestors | any-directory | ancestors-with-include-directories |
| --- | ---: | ---: | ---: | ---: |
| `fixtures/include-dirs` (8) | 4; four unresolved | 5; three unresolved | 6; two resolved to the decoy `extra/core/engine.hpp` | 8 |
| `programs/c/rosetta` (15) | 15 | 15 | 15 | 15 |
| `programs/cpp/rosetta` (15) | 15 | 15 | 15 | 15 |
| `programs/c/basics` (2) | 2 | 2 | 2 | 2 |
| `programs/c/modular` (8) | 8 | 8 | 8 | 8 |

On a flat `src/` every rule is right, which is why the scanner's rule had never been found wanting by the samples. The include fixture separates them: today's rule cannot see past the including file's directory, so `core/engine.hpp` and `shared/log.hpp` stay unresolved; the ancestors rule reaches the workspace root and so finds `src/shared/log.hpp`, but no ancestor holds `core/engine.hpp` or `shared/log.hpp` directly; the greedy rule finds every file and, breaking its ties alphabetically, takes `extra/core/engine.hpp` for the two `core/engine.hpp` includes, a header the compiler never saw; the ancestors rule with each ancestor's `include/` and `src/` tried agrees with the compiler on all eight, since `include/core/engine.hpp` lies under the root's `include/` and `src/shared/log.hpp` under its `src/`.

Before the fixture gained the decoy that sorts first (`extra/`), the greedy rule had scored 8 of 8 as well, by the luck of its tie-break; the decoy was added so that the measurement would tell luck from a rule, which is what a measurement is for.

## What was chosen

`ancestors-with-include-directories` is the adapter's default (`DEFAULT_INCLUDE_STRATEGY` in `adapters/c.ts`): it disagreed least, by disagreeing nowhere. The three others stay exported for the next measurement. The fixture keeps the rule honest after this probe: `tests/integration/live-docs/include-dirs.test.ts` generates the fixture's docs and asserts that every include the adapter resolved is the file the compiler resolved, and nothing else.

What the measurement does not say: a layout the fixture does not hold (an `-I third_party/foo/include`, a generated header in a build directory) can still leave an include unresolved, and the doc then carries the include as an external dependency, which is what the Knowledge Sources panel reports. Reading include directories from build files is the declared-basis refinement that waits with the project archetypes.
