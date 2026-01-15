# scripts/fixture-tools/sync-ast-doc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/sync-ast-doc.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-sync-ast-doc-ts
- Generated At: 2026-01-15T02:41:18.861Z

## Authored
### Purpose
Rebuilds the AST benchmark Live Doc from `fixtures.manifest.json`, ensuring the vendored Ky/libuv inventories stay synchronised with their recorded SHA-256 digests and upstream provenance so fixture audits remain deterministic ([fixture integrity rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4372-L4440)).

### Notes
- Created 2025-11-01 to automate regenerating `astAccuracyFixtures` after we codified per-file hashes and provenance inside the benchmark manifest, removing manual markdown edits ([automation step](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4372-L4440)).
- Updated 2025-11-03 while validating benchmark deltas so fixture regeneration could run alongside snapshot comparisons without reintroducing stale inventories ([benchmark follow-up](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L1300-L1460)).
- Repointed 2025-11-16 to the `.live-documentation/source` mirror after the Stage‑0 cleanup, keeping manifest-driven docs intact without reviving the deprecated `.mdmd/layer-4` tree ([mirror alignment](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2680-L2840)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.861Z","inputHash":"95e0492beae27f56"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- [`benchmark-doc.ensureVendorSection`](./benchmark-doc.ts.mdmd.md#symbol-ensurevendorsection)
- [`benchmark-doc.resolveAstFixtureDocPath`](./benchmark-doc.ts.mdmd.md#symbol-resolveastfixturedocpath)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
<!-- LIVE-DOC:END Dependencies -->
