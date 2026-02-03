# scripts/fixture-tools/scip-to-expected.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/scip-to-expected.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-scip-to-expected-ts
- Generated At: 2026-02-03T21:55:41.680Z

## Authored
### Purpose
CLI script that converts SCIP protobuf indexes (`index.scip`) into `expected.json` ground-truth fixtures for benchmark accuracy testing. Parses SCIP occurrences and emits edge relationships (`references`, `extends`, `implements`).

### Notes
Origin: [2026-01-27.1.SUMMARIZED.md](../../../../AI-Agent-Workspace/ChatHistory/2026/01/Summarized/2026-01-27.1.SUMMARIZED.md) — created to establish a polyglot oracle pipeline. Delegates language-specific normalization to `ScipNormalizer` adapters. Requires external SCIP indexers (scip-typescript, scip-go, etc.) to generate input files.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.680Z","inputHash":"6269d5356ec7f2ab"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `readFileSync`, `writeFileSync`
- `node:path` - `path`
- `node:process` - `process`
- [`ScipNormalizer`](../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-scipnormalizer)
- [`scipNormalizer.getScipNormalizer`](../../packages/shared/src/testing/fixtureOracles/scipNormalizer.ts.mdmd.md#symbol-getscipnormalizer)
<!-- LIVE-DOC:END Dependencies -->
