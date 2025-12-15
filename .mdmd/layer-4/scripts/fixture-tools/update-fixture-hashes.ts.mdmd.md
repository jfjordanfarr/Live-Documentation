# scripts/fixture-tools/update-fixture-hashes.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/update-fixture-hashes.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-update-fixture-hashes-ts
- Generated At: 2025-12-15T00:38:07.392Z

## Authored
### Purpose
Materializes each vendored benchmark fixture, computes its integrity digest using CRLF-normalized SHA-256 hashing, and updates `fixtures.manifest.json` when hashes differ—ensuring cross-platform consistency between Windows (`npm run safe:commit`) and Linux (GitHub Actions CI) fixture verification.

### Notes
- Created 2025-12-13 as an automated replacement for manual hash computation after CI integration test failures revealed platform-specific line-ending discrepancies ([chat log](../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-13.1.md#L3200-L3500), Turn 34–40).
- Introduced alongside `computeIntegrityDigest()` CRLF→LF normalization in benchmark-manifest.ts to resolve the root cause: Windows with `core.autocrlf=true` wrote CRLF-based hashes that failed on Linux LF checkouts ([commit `bf1c7ca2`](../../AI-Agent-Workspace/ChatHistory/2025/12/2025-12-14.1.md#L8-L18)).
- Invoked via `npm run fixtures:update-hashes`; supports `--dry-run` for preview mode before modifying the manifest.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.392Z","inputHash":"3b25f944f2e40270"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- `node:process` - `process`
- [`benchmark-manifest.BENCHMARK_MANIFEST_SEGMENTS`](./benchmark-manifest.ts.mdmd.md#symbol-benchmark_manifest_segments)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.computeIntegrityDigest`](./benchmark-manifest.ts.mdmd.md#symbol-computeintegritydigest)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
