# Internal Tooling Reference

## Metadata

- Layer: 2
- Audience: Contributors

Commands used to **develop** Live Documentation, as opposed to using it. Adopters never need these; the user-facing catalog is the [CLI Reference](../layer-1/guides/cli-reference.mdmd.md). Several of these tools are scheduled for removal or replacement; the order of work is in [the vision](../layer-1/vision.mdmd.md).

---

## Pre-commit gate

### `npm run safe:commit`

Runs, in order:

1. `verify`: ESLint, `tsc` for the packages, a type-check of the test suites, the Vitest `unit` and `integration` projects, documentation link enforcement
2. Live Docs regeneration (`live-docs:generate`)
3. Live Docs lint (`livedocs -- --skip-generate`)
4. SlopCop markdown, asset and symbol audits

Flags: `--e2e` appends an Explorer build and the Playwright suite; `--skip-git-status` skips the clean-tree check, which is what CI does as `npm run ci-check`.

### `npm run verify`

Lint, build, type-check, both Vitest projects, and link enforcement, without the rest of the chain.

---

## Tests

| Command                    | What it runs                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`        | The Vitest `unit` project: `packages/*/src`, `scripts/` and the SlopCop suites                                                                                 |
| `npm run test:integration` | The Vitest `integration` project (`tests/integration/live-docs/`): generator determinism, polyglot fixtures, CLI pathfinding, Rosetta parity, the oracle (~20 s)   |
| `npm run test:e2e`         | Playwright against a built Explorer (`tests/e2e/`): Membrane Map behaviour and visual stability                                                                |

Both Vitest projects import TypeScript sources directly, so neither needs a build first. The Playwright specs check the Membrane Map's plumbing (state in the URL, containment, stable layout), not whether the picture is right; the owner said as much on 2026-09-28, and the views are being redesigned (vision step 3). The AST accuracy benchmark was retired on 2026-09-27: it scored an inference path the product did not ship, against per-fixture thresholds as low as 5% recall. Its replacement is the oracle below.

---

## Oracle

The oracle measures the shipped generator against a compiler, which shares no mechanism with it. Both commands take a fixture directory and never write into it except under `expected/`.

| Command                               | What it does                                                                                                                                                                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run oracle:index -- <fixture>`   | Copies the fixture, runs the SCIP indexer its project file selects (`scip-dotnet`, `scip-go`, `rust-analyzer`, `scip-java`, `scip-typescript`, or `scip-python` for a directory of `.py` files), and writes every compiler-resolved edge to `expected/compiler-edges.json` |
| `npm run oracle:compare -- <fixture>` | Runs the generator over a copy of the fixture and lists every disagreement with `expected/compiler-edges.json` and, if present, `expected/hand-verified-edges.json`. A list, not a score; exit code 0 either way. `--json` for data                                        |

The converter lives in `scripts/oracle/scip-edges.ts` with its unit test beside it.

---

## SlopCop audits

Markdown and asset hygiene for every `.md` in the repository. The chat archive, notes and scripts under `AI-Agent-Workspace/` are excluded; its README and `Memory/` are audited. See `slopcop.config.json`.

| Command                    | Checks                                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| `npm run slopcop:markdown` | Relative links resolve; heading anchors match the configured slug dialect |
| `npm run slopcop:assets`   | HTML and CSS asset references resolve                                     |
| `npm run slopcop:symbols`  | Live Doc symbol anchors are well-formed                                   |

All accept `--json`.

---

## Fixtures

Fixture workspaces live under `tests/integration/fixtures/` (hand-authored scenarios) and `tests/integration/programs/` (per-language sample programs, including the eight Rosetta implementations). They are plain directories that the integration suites and the oracle copy into a temporary workspace; the only thing written back is a fixture's `expected/` directory, by `oracle:index`. See [Sample Programs](../layer-3/sample-programs.mdmd.md).

---

## Other maintainer commands

| Command                                   | Purpose                                                                                                                                           |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run live-docs:generate -- --dry-run` | Report mirror drift without writing; the cheapest "is the mirror current?" check                                                                  |
| `npm run live-docs:orphans`               | Live Docs whose source file no longer exists. The generator never prunes a doc that has authored content, so run this after deleting source files |
| `npm run build`                           | `tsc` for shared, generator and scripts                                                                                                           |

---

## Related

- [AGENTS.md](../../AGENTS.md) — working rules and the commands that matter day to day
- [CLI Reference](../layer-1/guides/cli-reference.mdmd.md) — user-facing commands
