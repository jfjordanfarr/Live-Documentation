# Live Documentation over REA's TH04 reconstruction

_A probe of October 15, 2026, by the root Claude Code agent (Fable 5.1), made for the owner's instinct of that day ([Turn 6 of the day's record](../../../ChatHistory/2026/10/2026-10-15.1.record.md#turn-6)): "REA produces something code-like and then Live Documentation can render that something understandable to humans." The probe's pages are disposable and not committed; this record and its pictures are. Nothing in the product was changed for it._

## Brief

Take a repository that REA's own showcases name as a product of its process, run the shipped generator over it cold, build the Explorer over it, and look. The subject is [N0zoM1z0/th04](https://github.com/N0zoM1z0/th04), "Source reconstruction of 東方幻想郷 ～ Lotus Land Story", the repository REA's README links from its TH04 showcase: MIT, 1,842 files at the commit read (`83c94d1`), among them 349 `.cpp`, 172 `.hpp`, 170 `.inl`, 183 `.asm`, 562 `.py` and 257 `.md`. It was cloned shallow into the session's scratchpad and treated as data: nothing in it was run.

## Method

1. `generate.ts --workspace <clone>` with the shipped configuration: 49 files, because the shipped globs are path-shaped (`packages/**/src/**/*.ts`, `scripts/**/*.ts`) and match little of a repository shaped differently.
2. The same with every default suffix allowed anywhere (`**/*.cpp`, `**/*.py` and the rest, the suffix globs the sample builder uses): 940 files. Then once more with `**/*.hpp` added: 1,112 files. `inspect --reachable` over each.
3. `visualize-sample.ts --program <clone> --output dist/explorer/samples/th04`: 941 files and 1,862 edges, built in 9.7 s; served from `dist/explorer` and pictured with a script of the agent's own, since removed with the bundle.

## What it found

The numbers are from the run with the headers (1,112 docs); the pictures are of the sample build (941).

| Extension | Files | Files with symbols | Symbols | Edges | Resolved to a file |
| --- | ---: | ---: | ---: | ---: | ---: |
| `.py` | 562 | 552 | 8,027 | 8,075 | 3,171 |
| `.cpp` | 349 | 0 | 0 | 0 | 0 |
| `.hpp` | 172 | 0 | 0 | 0 | 0 |
| `.h` | 15 | 15 | 15 | 14 | 0 |
| `.json` | 5 | 4 | 37 | 519 | 519 |
| `.c` | 4 | 0 | 0 | 5 | 0 |
| `.java` | 3 | 3 | 15 | 19 | 0 |

- **The game's source got empty docs.** Every `.cpp` and `.hpp` doc reads "No public symbols detected" and "No dependencies documented yet", though `src/main/core/main.cpp` opens with five `#include` lines and `void main(void)`, and the 1,947 include lines under `src` name their targets. The cause is this project's: the C adapter's docstring says it handles `.cpp`, `.hpp`, `.cc` and `.cxx`, and its registration lists `.c` and `.h` only ([c.ts](../../../../.mdmd/layer-4/packages/engine/src/live-docs/adapters/c.ts.mdmd.md)). A file no adapter claims gets a doc with empty sections.
- **The includes that were read did not resolve.** The 14 edges of the `.h` files and the 5 of the `.c` files are all unresolved: the reconstruction includes by root-relative path (`#include "src/shared/hardware/graphics.hpp"`, 123 times; `th04/snd/snd.h`, 67), as a compiler given an include directory sees it, and the adapter tries only the including file's own directory.
- **The entry points are the tooling, not the game.** 541 entries: 535 Python scripts with a `__main__` guard, `probes/toolchain/compiler_probe.c` with `program main`, and 47 tests by archetype. The three C++ `main` functions (`src/main/core/main.cpp`, `src/zun/resident/main.cpp`, `src/zun/memchk/main.cpp`) are not marked, since the rule marks `.c` files only. So the walk reaches 18 files and calls every C++ file unreachable (382 in the sample build, 553 with the headers), and the Local Map lands on the root because the docs declare many entries.
- **The shipped globs carry no `*.hpp`, `*.inl`, `*.cc`, `*.cxx` or `*.asm`**, so a cold run misses the 172 headers and 170 inline files even when the suffixes are allowed anywhere.
- **The Python half mapped.** 552 of 562 scripts have symbols and 3,171 of their 8,075 imports resolve to a file; the rest are the standard library (`pathlib` 545, `argparse` 479, `json` 465) and `lib` (510), the repository's own `scripts/lib` package imported as a top-level name, which the adapter does not find. The catalog file `scripts/catalog/catalog.json` resolves 519 paths, so the panel says it "uses 519 files".
- **By eye.** A card for a file with no public symbols reads "+1 symbols" in the directory view (picture 05), where the pinned card shows an "Internals" row instead (picture 06): the count takes in the internals row. Not fixed here.

## Pictures

1. [The bundle's shape](01-knowledge-sources-shape.png): 941 files, 894 implementation and 47 test, 3,671 references; by directory `scripts` 520 and `src` 367; the most used files are Python probe scripts.
2. [Entry points](02-entry-points-programs-opened.png): 541, "541 entry points reach 18 of the other 400 files"; the Programs group is the Python tooling with one C probe.
3. [Unreachable from any entry](03-unreachable-from-any-entry.png): 382 implementation files, the game's `.cpp` files among them.
4. [The Local Map's landing](04-local-map-landing.png): the root's six directories, no wires.
5. [`src/main` opened](05-local-map-src-main.png): sixteen subdirectories and four files, "No public symbols" on each, no wires.
6. [The game's `main.cpp` pinned](06-local-map-main-cpp-pinned.png): a card with no symbols and no wires.

## What this says

The pipeline the owner named exists without a line of integration: the reconstruction is a folder of source, and the generator read it cold in ten seconds. What the picture shows is not REA's limit but this project's reading of C++: the registration, the include directories, the `main` rule and the default suffixes. With those four fixed, the same run would give the include graph of 539 files, the walk from `MAIN.EXE`'s entry and what nothing reaches. What it would still not give is anything the reconstruction's authors have not yet named, which is the part REA's showcases show an agent doing by hand; a raw decompiler export, functions without files or names, is the harder case this probe did not try.

## What could be done, not done here

Register the C++ extensions, with a fixture and tests; add the workspace root, and the include directories a build file names, as include candidates; mark `main` in `.cpp`; add the suffixes to the shipped defaults; make the card count public symbols only; then rerun this probe and look again. Each is the owner's call.
