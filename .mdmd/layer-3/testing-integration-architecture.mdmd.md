# Integration Testing Architecture

## Metadata
- Layer: 3
- Component IDs: COMP-008

## Components

### COMP-008 Integration Test Harness
Executes end-to-end scenarios against compiled output: Live Documentation regeneration, evidence population, CLI pathfinding across languages, cross-language parity, and the SlopCop audits.

## Responsibilities

### Deterministic Execution
- Build fresh extension/server bundles before runs and clean stale artifacts with `tests/integration/clean-dist.mjs`.
- Launch the VS Code harness (`tests/integration/vscode/runTests.ts`) to execute suites against compiled output rather than source mocks.

### Fixture Stewardship
- Maintain the simple workspace fixture (`tests/integration/fixtures/simple-workspace`) as the canonical testbed for the generation and evidence suites.
- Provide specialised fixtures (scenario workspaces, the eight-language Rosetta apps, vendored benchmark repositories) for targeted suites without duplicating workspace state.

### Scenario Coverage
- `live-docs/generation.test.ts` and `live-docs/evidence.test.ts`: regeneration determinism, authored-section preservation, evidence population.
- `live-docs/inspect-cli.test.ts`: CLI pathfinding across languages.
- `live-docs/rosettaParity.test.ts` and `live-docs/polyglot-fixtures.test.ts`: the same application in eight languages produces the same shape, and every adapter generates cleanly.
- `live-docs/system-output.test.ts`: on-demand system views.
- `slopcop/*.test.ts` and `benchmarks/astAccuracy.test.ts`: the audits and the accuracy benchmark (the benchmark is being rebuilt; see [Architectural Decisions](architectural-decisions.mdmd.md)).
- The ripple and diagnostics suites (`us1` through `us5`) were removed with the diagnostics subsystem on 2026-02-18.

### Harness Strategy & Options
- **Immediate path (Options 1 + 4)**: retain the VS Code harness for UI/diagnostics flows while carving out a lightweight headless runner that replays the same suites against compiled artifacts using a sandboxed fixture. This preserves UX coverage and gives us a deterministic harness for CLI, generator, and hosted showcase rehearsal without pulling Electron into every scenario.
- **Option 2 headless harness**: `npm run live-docs:headless -- --scenario <name>` now copies benchmark fixtures into a temp workspace, drives the shared generator/system builders, and writes timestamped reports under `AI-Agent-Workspace/tmp/headless-harness/<scenario>/`. Scenarios (`ruby-cli`, `python-basics`, `csharp-advanced`) live in `packages/server/src/features/live-docs/harness/scenarios.ts`, guaranteeing every language bridge remains green without launching VS Code.
- **Option 3 container harness**: passing `--container-spec` emits `container-spec.json` beside each headless report describing the Node 22 image, mount expectations, and command invocation so the Cloudflare hosted showcase can replay scenarios verbatim. These specs keep hosted rehearsals honest while remaining optional for local runs.
- Keep VS Code and headless/container harnesses independent even after the core extraction so regressions in one surface do not mask the other. Hosted showcase validations must point to the headless/container harness to guarantee parity with the Cloudflare runner while acknowledging the marketing-only positioning.

### Artefact Capture
- Persist run outputs (snapshot JSON, logs, Live Doc markdown fixtures, provenance files) in per-suite temp directories for inspection and regression comparisons.
- Headless harness runs deposit `report.json` + optional `container-spec.json` inside `AI-Agent-Workspace/tmp/headless-harness/<scenario>/<timestamp>/` and leave the generated `.live-documentation/` mirrors inside the copied workspace whenever `--keep-workspace` is supplied for manual spot checks.

## Interfaces

### Inbound Interfaces
- `npm run test:integration` (and safe-to-commit) orchestrations that call the VS Code harness.
- Fixture configuration toggles controlling which suites execute, allowing targeted regression runs.

### Outbound Interfaces
- Mocha logs, snapshot files, and staged Live Doc mirrors stored under `tests/integration/.tmp` for debugging.
- Report contributions consumed by the benchmark/reporting pipeline, including Live Doc precision/recall metrics.

## Linked Implementations

### IMP-401 vscodeIntegrationHarness
Bootstraps VS Code with compiled artifacts and loads suites. [VS Code Integration Harness](../layer-4/tests/integration/vscode/runTests.ts.mdmd.md)

### IMP-402 simpleWorkspaceFixture
Primary workspace assets used by the generation and evidence suites (`tests/integration/fixtures/simple-workspace/`).

### IMP-403 Core Suites
Live Docs integration suites covering generation, evidence, and inspection. [Live Docs Generation Suite](../layer-4/tests/integration/live-docs/generation.test.ts.mdmd.md)

### IMP-404 cleanDistUtility
Removes stale bundles before integration runs. [`tests/integration/clean-dist.mjs`](../../tests/integration/clean-dist.mjs)

### IMP-405 liveDocsGenerationSuite
Exercises regeneration CLI, authored preservation, and deterministic output. [Stage‑0 Live Doc](../layer-4/tests/integration/live-docs/generation.test.ts.mdmd.md)

### IMP-406 liveDocsEvidenceSuite
Validates evidence ingestion, lint warnings, and `_No automated evidence found_` behaviour. [Stage‑0 Live Doc](../layer-4/tests/integration/live-docs/evidence.test.ts.mdmd.md)

### IMP-407 liveDocsInspectCliSuite
Traces dependency paths across every supported language through the CLI. [Inspect CLI Suite](../layer-4/tests/integration/live-docs/inspect-cli.test.ts.mdmd.md)

### IMP-409 integrationHarnessTsconfig
Primary TypeScript compiler surface for the integration harness runtime. [Integration Harness `tsconfig.json`](../layer-4/tests/integration/tsconfig.json.mdmd.md)

### IMP-410 vscodeHarnessTsconfig
Bundles VS Code integration harness sources with matching module/target settings for the test runner bootstrap. [VS Code Harness `tsconfig.json`](../layer-4/tests/integration/vscode/tsconfig.json.mdmd.md)

## Evidence
- The suites above run inside CI (`npm run ci-check`) and `npm run test:integration`; `safe:commit` depends on their success.
- None of them use the VS Code API, although they still run through the Electron harness; moving them under Vitest is part of the engine work described in the vision.

## Operational Notes
- Snapshot directories remain isolated per suite to ease diffing pre/post change.
- Adding a new scenario requires extending the fixture set and documenting its responsibility here to preserve traceability.
- Maintain distinct runbooks for the VS Code harness and the headless/container harness so hosted showcase rehearsals (Cloudflare pipeline) never depend on Electron-specific behaviours; both harnesses must share compiled artifacts but publish independent logs.
