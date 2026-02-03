# scripts/fixture-tools/generate-scip-indexes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/generate-scip-indexes.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-generate-scip-indexes-ts
- Generated At: 2026-02-03T21:55:41.614Z

## Authored
### Purpose
Batch script that invokes external SCIP indexers (e.g., `scip-typescript`) across benchmark fixture directories to generate `index.scip` files. Intended for developer-machine use in preparing ground-truth oracles.

### Notes
Origin: [2026-01-27.2.SUMMARIZED.md](../../../../AI-Agent-Workspace/ChatHistory/2026/01/Summarized/2026-01-27.2.SUMMARIZED.md) — companion to `scip-to-expected.ts`. Requires language-specific SCIP indexers installed globally. Not run in CI; indexes are committed as fixtures.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:41.614Z","inputHash":"00eedabd9cb0a25d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execSync`
- `node:fs` - `existsSync`, `readdirSync`, `rmSync`, `statSync`
- `node:path` - `path`
- `node:process` - `process`
<!-- LIVE-DOC:END Dependencies -->
