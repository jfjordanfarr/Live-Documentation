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
3. Fixture workspace verification (`fixtures:verify`)
4. Live Docs lint and precision report (`livedocs -- --skip-generate --report`)
5. SlopCop markdown, asset and symbol audits
6. Technical debt detection (`tech-debt -- --stale-limit 10`)

Flags: `--e2e` appends an Explorer build and the Playwright suite; `--skip-git-status` skips the clean-tree check, which is what CI does as `npm run ci-check`.

### `npm run verify`

Lint, build, type-check, both Vitest projects, and link enforcement, without the rest of the chain.

---

## Tests

| Command                    | What it runs                                                                                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`        | The Vitest `unit` project: `packages/*/src`, `scripts/` and the SlopCop suites                                                                                 |
| `npm run test:integration` | The Vitest `integration` project (`tests/integration/live-docs/`): generator determinism, evidence, polyglot fixtures, CLI pathfinding, Rosetta parity (~20 s) |
| `npm run test:e2e`         | Playwright against a built Explorer (`tests/e2e/`): Membrane Map behaviour and visual stability                                                                |

Both Vitest projects import TypeScript sources directly, so neither needs a build first. The AST accuracy benchmark was retired on 2026-09-27: it scored an inference path the product did not ship, against per-fixture thresholds as low as 5% recall. Its replacement, a compiler-backed oracle over the shipped generator, is step 2 of the vision's order of work.

---

## SlopCop audits

Markdown and asset hygiene for every `.md` in the repository. The historical `AI-Agent-Workspace/` is excluded; see `slopcop.config.json`.

| Command                    | Checks                                                                    |
| -------------------------- | ------------------------------------------------------------------------- |
| `npm run slopcop:markdown` | Relative links resolve; heading anchors match the configured slug dialect |
| `npm run slopcop:assets`   | HTML and CSS asset references resolve                                     |
| `npm run slopcop:symbols`  | Live Doc symbol anchors are well-formed                                   |

All accept `--json`.

---

## Fixtures

| Command                            | Purpose                                                                                             |
| ---------------------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run fixtures:verify`          | Scenario workspaces pass their SlopCop configs; the benchmark manifest is complete and hashes match |
| `npm run fixtures:update-hashes`   | Re-record fixture hashes after an intentional fixture change                                        |
| `npm run fixtures:regenerate`      | Regenerate benchmark expectations (needs the SCIP indexers installed in the devcontainer)           |
| `npm run fixtures:sync-docs`       | Sync the AST benchmark documentation with current output                                            |
| `npm run fixtures:record-fallback` | Record fallback-inference output for the benchmark; goes away with that path                        |

The fixture corpora under `tests/integration/` are the durable part: the eight-language Rosetta apps, vendored real repositories, and hand-authored scenario workspaces (reflection, WebForms and Razor configuration, queue workers). Keep those; the scripts around them will shrink.

---

## Other maintainer commands

| Command                                   | Purpose                                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run live-docs:generate -- --dry-run` | Report mirror drift without writing; the cheapest "is the mirror current?" check                              |
| `npm run live-docs:orphans`               | Live Docs whose source file no longer exists                                                                  |
| `npm run live-docs:report`                | Precision and recall of generated sections against a re-run of the same analyzer. Tautological; being removed |
| `npm run tech-debt`                       | Flags large and long-unmodified files. Being removed                                                          |
| `npm run audit:network`                   | Asserts no network calls in product code. Being removed; the product makes none                               |
| `npm run build`                           | `tsc` for shared, scripts, server and extension                                                               |

---

## Related

- [AGENTS.md](../../AGENTS.md) — working rules and the commands that matter day to day
- [CLI Reference](../layer-1/guides/cli-reference.mdmd.md) — user-facing commands
