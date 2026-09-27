# Integration Testing

_Current as of 2026-09-27._

Integration suites run the real generator and the real CLI over fixture workspaces. They live under `tests/integration/live-docs/` and run as the `integration` Vitest project (`npm run test:integration`). Nothing in them touches the VS Code API; the Electron harness that once hosted them was retired on 2026-09-27.

## Suites

| Suite                       | What it proves                                                                                                                                |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `generation.test.ts`        | Regeneration is deterministic and preserves authored sections                                                                                 |
| `evidence.test.ts`          | Coverage manifests and waivers populate the Observed Evidence and Targets sections                                                            |
| `polyglot-fixtures.test.ts` | C#, Java and Python fixtures generate the expected symbols, XML-doc sections and resolved dependency links                                    |
| `inspect-cli.test.ts`       | `live-docs:inspect`, spawned through `tsx`, finds paths across WebForms, Razor, Blazor, queue-worker, SPA, reflection and PowerShell fixtures |
| `rosettaParity.test.ts`     | The same program in eight languages yields the same topology; a canonical edge must be found in at least 6 of 8 languages                     |
| `oracle.test.ts`            | `oracle:compare` runs over the two C# fixtures that carry expectations and accounts for every expected edge as found or missing               |

Rosetta parity is a smoke alarm for a regression in one adapter. It is not a measure of correctness; that is the job of the compiler-backed oracle described in [Architectural Decisions](architectural-decisions.mdmd.md) under "Accuracy Measurement".

## Fixtures

- `tests/integration/fixtures/`: hand-authored scenario workspaces (WebForms and Razor configuration chains, a queue worker, reflection, PowerShell, the C# XML-doc stress workspace, and the SlopCop dogfood workspaces).
- `tests/integration/programs/`: per-language sample programs, including the eight Rosetta implementations. Two C# programs carry an `expected/` directory written by the oracle; see [Sample Programs](sample-programs.mdmd.md).

Each suite copies its fixture into a temporary directory before generating, so fixtures are never written to.

## How they run

- `vitest.config.ts` defines two projects: `unit` (package sources, `scripts/`, the SlopCop suites) and `integration` (this directory). Both import TypeScript sources directly; no build step is required.
- `tests/integration/tsconfig.json` is a `noEmit` project used by the gate to type-check the suites.
- The gate (`npm run verify`) runs lint, `tsc` for the packages, the test type-check, both Vitest projects and the documentation link check, in that order.
