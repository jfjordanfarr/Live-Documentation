# Internal Tooling Reference

## Metadata

- Layer: 2
- Audience: Contributors

Commands used to **develop** Live Documentation, as opposed to using it. Adopters never need these; the user-facing catalog is the [CLI Reference](../layer-1/guides/cli-reference.mdmd.md). Several of these tools are scheduled for removal or replacement; the order of work is in [the vision](../layer-1/vision.mdmd.md).

---

## Pre-commit gate

### `npm run safe:commit`

Runs, in order:

1. `verify`: ESLint, Vitest unit tests, the VS Code integration suite, documentation link enforcement
2. Live Docs regeneration (`live-docs:generate`)
3. Fixture workspace verification (`fixtures:verify`)
4. Documentation link enforcement (`docs:links:enforce`)
5. Live Docs lint and precision report (`livedocs -- --skip-generate --report`)
6. SlopCop markdown, asset and symbol audits
7. Technical debt detection (`tech-debt -- --stale-limit 10`)

Flags: `--benchmarks` appends the AST accuracy benchmark; `--e2e` appends an Explorer build and the Playwright suite; `--skip-git-status` skips the clean-tree check, which is what CI does as `npm run ci-check`.

The integration suite launches VS Code through `@vscode/test-electron`. On Linux, run the gate under `xvfb-run -a`. If your terminal was spawned by VS Code, unset `ELECTRON_RUN_AS_NODE` first, or Electron starts as plain Node and fails to load the test workspace:

```bash
env -u ELECTRON_RUN_AS_NODE xvfb-run -a npm run safe:commit
```

### `npm run verify`

Lint, unit and integration tests, and link enforcement, without the rest of the chain. `--mode ast` adds the AST benchmark; `--report` refreshes `reports/test-report.ast.md`.

---

## Tests

| Command                    | What it runs                                                                                                                                                                       |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run test:unit`        | Vitest across `packages/*/src`, `scripts/` and the SlopCop suites; no VS Code required                                                                                             |
| `npm run test:integration` | Mocha suites under the VS Code Electron harness (`tests/integration/`), including CLI pathfinding across languages, cross-language Rosetta parity, and polyglot fixture generation |
| `npm run test:e2e`         | Playwright against a built Explorer (`tests/e2e/`): Membrane Map behaviour and visual stability                                                                                    |
| `npm run test:benchmarks`  | AST accuracy benchmark over `tests/integration/benchmarks/fixtures`; `--mode ast` or `--mode all`                                                                                  |

The benchmark currently scores an inference path the product does not ship, against per-fixture thresholds. Rebuilding it around the shipped adapters and SCIP ground truth is step 2 of the vision's order of work.

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
