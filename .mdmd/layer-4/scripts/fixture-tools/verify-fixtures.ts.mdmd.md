# scripts/fixture-tools/verify-fixtures.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/verify-fixtures.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-verify-fixtures-ts
- Generated At: 2026-01-15T02:41:18.865Z

## Authored
### Purpose
Verifies every benchmark fixture declared in `fixtures.manifest.json` by materialising the workspace, running `graph:snapshot`, `graph:audit`, and SlopCop suites so the `safe:commit` pipeline catches regressions before they land ([manifest verifier launch](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-27.md#L6200-L7179)).

### Notes
- Added 2025-10-27 alongside `npm run fixtures:verify` to replace ad-hoc manual fixture checks with a deterministic loop that records audit output per workspace ([initial rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-27.md#L6336-L7179)).
- Extended 2025-10-28 with optional `slopcopSuites` manifest entries so asset/symbol fixtures skip redundant lint runners, trimming iteration time while keeping coverage intact ([suite filtering update](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-28.md#L1268-L1334)).
- Integrated 2025-10-30 into the broader fixture maintenance guide and safe commit workflow, ensuring `verify-fixtures.ts` executes automatically during pre-commit validation ([safe commit wiring](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5348-L5453)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.865Z","inputHash":"3d72af8713e37345"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
- `node:fs` - `promises`
- `node:path`
- `node:process` - `process`
- [`benchmark-doc.extractVendorInventory`](./benchmark-doc.ts.mdmd.md#symbol-extractvendorinventory)
- [`benchmark-doc.renderVendorInventory`](./benchmark-doc.ts.mdmd.md#symbol-rendervendorinventory)
- [`benchmark-doc.resolveAstFixtureDocPath`](./benchmark-doc.ts.mdmd.md#symbol-resolveastfixturedocpath)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.computeIntegrityDigest`](./benchmark-manifest.ts.mdmd.md#symbol-computeintegritydigest)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
