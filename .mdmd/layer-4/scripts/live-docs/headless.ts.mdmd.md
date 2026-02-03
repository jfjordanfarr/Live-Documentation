# scripts/live-docs/headless.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/live-docs/headless.ts
- Live Doc ID: LD-implementation-scripts-live-docs-headless-ts
- Generated At: 2026-02-03T21:55:41.801Z

## Authored
### Purpose
Runs the Live Docs headless harness scenarios (e.g. seed fixtures, run generator, capture reports) so we can regression-test the pipeline outside of VS Code.

### Notes
Created for the 2024 headless smoke tests that reproduce user journeys without the extension UI. Supports multi-scenario runs, container-spec emission, and optional System-layer skips to keep scenario execution aligned with our CI diagnostics flows.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.801Z","inputHash":"d518b87dc5987aac"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path` - `path`
- `node:process` - `process`
- [`headlessHarness.runHeadlessHarness`](../../packages/server/src/features/live-docs/harness/headlessHarness.ts.mdmd.md#symbol-runheadlessharness)
- [`scenarios.getScenarioByName`](../../packages/server/src/features/live-docs/harness/scenarios.ts.mdmd.md#symbol-getscenariobyname)
- [`scenarios.listScenarios`](../../packages/server/src/features/live-docs/harness/scenarios.ts.mdmd.md#symbol-listscenarios)
<!-- LIVE-DOC:END Dependencies -->
