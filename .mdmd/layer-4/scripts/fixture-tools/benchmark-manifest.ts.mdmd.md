# scripts/fixture-tools/benchmark-manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/benchmark-manifest.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-benchmark-manifest-ts
- Generated At: 2025-12-07T21:41:19.697Z

## Authored
### Purpose
Defines the benchmark fixture manifest schema plus helpers to load entries and compute SHA-256 integrity digests, giving fixture tooling a single source of truth for provenance, curated file sets, and workspace materialisation ([manifest-driven integrity rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4440-L4560)).

### Notes
- Authored 2025-11-01 alongside `verify-fixtures.ts` and `sync-ast-doc.ts` so every vendored benchmark declares its repo, commit, file list, and hash, letting `npm run fixtures:verify` recompute digests and audit docs automatically ([initial integration](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4440-L4560)).
- Feeding this schema into `materializeFixture` unlocked ephemeral clones for benchmark runs and regeneration, keeping integrity tracking and documentation aligned across ky, libuv, and subsequent fixtures ([materializer coordination](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5094-L5335)).
- Extended 2025-11-06 while onboarding C# fixtures, using `computeIntegrityDigest` to stamp the new `csharp-webforms` hash set and enforce algorithm selection during verification ([C# integrity update](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5520-L5638)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T21:41:19.697Z","inputHash":"161b6613bc317c13"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FixtureSummary` {#symbol-fixturesummary}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L6)

#### `FixtureProvenance` {#symbol-fixtureprovenance}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L12)

#### `FixtureIntegritySpec` {#symbol-fixtureintegrityspec}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L22)

#### `BenchmarkFixtureDefinition` {#symbol-benchmarkfixturedefinition}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L32)

#### `IntegrityDigest` {#symbol-integritydigest}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L46)

#### `FixtureFileSetSpec` {#symbol-fixturefilesetspec}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L53)

#### `FixtureMaterialization` {#symbol-fixturematerialization}
- Type: type
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L58)
- Returns: [`FixtureGitMaterialization`](#symbol-fixturegitmaterialization)

#### `FixtureGitMaterialization` {#symbol-fixturegitmaterialization}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L65)

#### `BENCHMARK_MANIFEST_SEGMENTS` {#symbol-benchmark_manifest_segments}
- Type: const
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L78)

#### `loadBenchmarkManifest` {#symbol-loadbenchmarkmanifest}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L86)

#### `computeIntegrityDigest` {#symbol-computeintegritydigest}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L102)
- Parameters: `fixture`: [`BenchmarkFixtureDefinition`](#symbol-benchmarkfixturedefinition)

#### `normalizeRelative` {#symbol-normalizerelative}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L157)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->
