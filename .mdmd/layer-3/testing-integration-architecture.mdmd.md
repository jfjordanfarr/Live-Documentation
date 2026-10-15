# Integration Testing

_Current as of 2026-10-15._

Integration suites run the real generator and the real CLI over fixture workspaces. They live under `tests/integration/live-docs/` and run as the `integration` Vitest project (`npm run test:integration`). Nothing in them touches the VS Code API; the Electron harness that once hosted them was retired on 2026-09-27.

## Suites

| Suite                       | What it proves                                                                                                                                                                      |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `generation.test.ts`        | Regeneration is deterministic, preserves authored sections, and writes the graph index the docs derive to                                                                          |
| `round-trip.test.ts`        | Every committed Live Doc, and every doc generated for the sample programs, parses and renders back to the same bytes                                                                |
| `graph.test.ts`             | The graph of this repository: every link a committed doc writes lands on a file in the graph, and every edge is mirrored inbound                                                    |
| `polyglot-fixtures.test.ts` | C#, Java and Python fixtures generate the expected symbols, XML-doc sections and resolved dependency links                                                                          |
| `inspect-cli.test.ts`       | `live-docs:inspect`, spawned through `tsx`, finds paths across WebForms, Razor, Blazor, queue-worker, SPA, reflection and PowerShell fixtures, over docs the generator writes first, and prints the entry points' walk over the entry-points fixture |
| `entries.test.ts`           | Over the entry-points fixture: the `Entry` lines a manifest's scripts, binary and main module, a tsconfig, a declared stylesheet and a test produce, the dynamic import recorded as an edge, and the walk from the entries                            |
| `repository-entries.test.ts` | This repository as the oracle's subject: its own entry points read by hand into `expected/repository-entries.json` against the committed docs, every implementation file of its own code reached from them, the dynamic imports among the edges        |
| `estate.test.ts`            | The estate scanned as seven things draws the one-scan build's wires; and its files that serve an opening, read from the sources, carry `opening` entries, its manifests and configurations `tooling`                                                   |
| `rosettaParity.test.ts`     | The same program in eight languages yields the same topology; a canonical edge must be found in at least 6 of 8 languages; the main file carries the `program` entry in the six languages whose main is one, and the two library-shaped variants carry none |
| `oracle.test.ts`            | `oracle:compare` runs over every sample program that carries expectations and accounts for every expected edge as found or missing                                                  |

Rosetta parity is a smoke alarm for a regression in one adapter. It is not a measure of correctness; that is the job of the compiler-backed oracle described in [Architectural Decisions](architectural-decisions.mdmd.md) under "Accuracy Measurement".

## Fixtures

- `tests/integration/fixtures/`: hand-authored scenario workspaces (WebForms and Razor configuration chains, a queue worker, reflection, PowerShell, the C# XML-doc stress workspace, the entry-points workspace, and the SlopCop dogfood workspaces).
- `tests/integration/programs/`: per-language sample programs, including the eight Rosetta implementations. Seventeen of the twenty-one carry an `expected/` directory written by the oracle; see [Sample Programs](sample-programs.mdmd.md).

Each suite copies its fixture into a temporary directory before generating, so fixtures are never written to.

## How they run

- `vitest.config.ts` defines two projects: `unit` (package sources, `scripts/`, the SlopCop suites) and `integration` (this directory). Both import TypeScript sources directly; no build step is required.
- `tests/integration/tsconfig.json` is a `noEmit` project used by the gate to type-check the suites.
- The gate (`npm run verify`) runs lint, `tsc` for the packages, the test type-check, both Vitest projects and the documentation link check, in that order.
