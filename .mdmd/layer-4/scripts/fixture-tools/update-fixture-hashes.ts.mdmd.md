# scripts/fixture-tools/update-fixture-hashes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/update-fixture-hashes.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-update-fixture-hashes-ts
- Generated At: 2026-01-15T02:41:18.862Z

## Authored
### Purpose
Materializes each vendored benchmark fixture, computes its integrity digest using CRLF-normalized SHA-256 hashing, and updates `fixtures.manifest.json` when hashes differ—ensuring cross-platform consistency between Windows (`npm run safe:commit`) and Linux (GitHub Actions CI) fixture verification.

### Notes
- Created 2025-12-13 as an automated replacement for manual hash computation after CI integration test failures revealed platform-specific line-ending discrepancies ([chat log](../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-13.1.md), Turn 34–40).
- ESLint warnings fixed 2025-12-15 by removing unused imports (`BENCHMARK_MANIFEST_SEGMENTS`, `BenchmarkFixtureDefinition`) during Phase 1 CI failure remediation ([chat log](../../../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-15.1.md)).
- Invoked via `npm run fixtures:update-hashes`; supports `--dry-run` for preview mode before modifying the manifest.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.862Z","inputHash":"b81537ff51dcc069"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path`
- `node:process` - `process`
- [`benchmark-manifest.computeIntegrityDigest`](./benchmark-manifest.ts.mdmd.md#symbol-computeintegritydigest)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
