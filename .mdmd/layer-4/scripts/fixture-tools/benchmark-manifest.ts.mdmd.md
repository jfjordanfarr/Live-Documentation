# scripts/fixture-tools/benchmark-manifest.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/benchmark-manifest.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-benchmark-manifest-ts
- Generated At: 2026-02-18T21:27:54.513Z

## Authored
### Purpose
Defines the benchmark fixture manifest schema plus helpers to load entries and compute SHA-256 integrity digests, giving fixture tooling a single source of truth for provenance, curated file sets, and workspace materialisation ([manifest-driven integrity rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4440-L4560)).

### Notes
- Authored 2025-11-01 alongside `verify-fixtures.ts` and `sync-ast-doc.ts` so every vendored benchmark declares its repo, commit, file list, and hash, letting `npm run fixtures:verify` recompute digests and audit docs automatically ([initial integration](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4440-L4560)).
- Feeding this schema into `materializeFixture` unlocked ephemeral clones for benchmark runs and regeneration, keeping integrity tracking and documentation aligned across ky, libuv, and subsequent fixtures ([materializer coordination](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5094-L5335)).
- Extended 2025-11-06 while onboarding C# fixtures, using `computeIntegrityDigest` to stamp the new `csharp-webforms` hash set and enforce algorithm selection during verification ([C# integrity update](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L5520-L5638)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.513Z","inputHash":"a907209ac4170270"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `FixtureSummary` {#symbol-fixturesummary}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L22)

##### `FixtureSummary` — Summary
Optional human-written blurb attached to a benchmark fixture definition.

#### `FixtureProvenance` {#symbol-fixtureprovenance}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L32)

##### `FixtureProvenance` — Summary
Source-of-truth metadata describing where a fixture's source code
was obtained from (vendor repo, synthetic generation, etc.).

#### `FixtureIntegritySpec` {#symbol-fixtureintegrityspec}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L49)

##### `FixtureIntegritySpec` — Summary
Declarative integrity specification for a fixture.

Used by {@link computeIntegrityDigest} to hash the fixture's source
files and compare against the recorded `rootHash`. Files are resolved
via either an explicit `paths` list or a `fileSet` glob specification.

#### `FixtureThresholds` {#symbol-fixturethresholds}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L63)

##### `FixtureThresholds` — Summary
Per-fixture precision/recall threshold overrides.
Allows stress-test fixtures to have lower thresholds than the global defaults.

#### `OracleConfig` {#symbol-oracleconfig}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L73)

##### `OracleConfig` — Summary
Oracle configuration for expected.json regeneration and validation.

#### `BenchmarkFixtureDefinition` {#symbol-benchmarkfixturedefinition}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L87)

##### `BenchmarkFixtureDefinition` — Summary
Top-level definition for a single benchmark fixture in the manifest.
Carries identity, paths, oracle config, integrity spec, and optional
threshold overrides.

#### `IntegrityDigest` {#symbol-integritydigest}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L116)

##### `IntegrityDigest` — Summary
Return type of {@link computeIntegrityDigest}, carrying the per-file
hashes and the aggregate root hash for a single fixture.

#### `FixtureFileSetSpec` {#symbol-fixturefilesetspec}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L127)

##### `FixtureFileSetSpec` — Summary
Glob-based file selection for integrity hashing and materialisation.
Used by {@link FixtureIntegritySpec} and {@link FixtureGitMaterialization}.

#### `FixtureMaterialization` {#symbol-fixturematerialization}
- Type: type
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L137)
- Returns: [`FixtureGitMaterialization`](#symbol-fixturegitmaterialization)

##### `FixtureMaterialization` — Summary
Discriminated union describing how a fixture's source code is
materialised on disk — either already present in the workspace
(`"workspace"`) or cloned from a git repository (`"git"`).

#### `FixtureGitMaterialization` {#symbol-fixturegitmaterialization}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L149)

##### `FixtureGitMaterialization` — Summary
Git-based materialisation spec used by `fixtureMaterializer.ts`
to clone, sparse-checkout, and pin a vendor fixture at a specific
commit.

#### `BENCHMARK_MANIFEST_SEGMENTS` {#symbol-benchmark_manifest_segments}
- Type: const
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L167)

##### `BENCHMARK_MANIFEST_SEGMENTS` — Summary
Path segments from repo root to the canonical fixture manifest file.
Joined with `path.join` by {@link loadBenchmarkManifest} and consumers
like `regenerate-benchmarks.ts`.

#### `loadBenchmarkManifest` {#symbol-loadbenchmarkmanifest}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L181)

##### `loadBenchmarkManifest` — Summary
Loads and parses the benchmark fixture manifest from disk.

Accepts either a bare JSON array or an object with a `fixtures` key
(the latter was used in an earlier manifest schema revision).

#### `computeIntegrityDigest` {#symbol-computeintegritydigest}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L208)
- Parameters: `fixture`: [`BenchmarkFixtureDefinition`](#symbol-benchmarkfixturedefinition)

##### `computeIntegrityDigest` — Summary
Computes a deterministic SHA-256 integrity digest for a fixture.

Source files are resolved from the fixture's {@link FixtureIntegritySpec}
(via `fileSet` globs or explicit `paths`). Line endings are normalised
to LF before hashing to ensure cross-platform reproducibility
(fix added 2025-12-14, commit `bf1c7ca`).

##### `computeIntegrityDigest` — Returns
An {@link IntegrityDigest} whose `rootHash` can be compared
against the manifest's declared `integrity.rootHash`.

#### `normalizeRelative` {#symbol-normalizerelative}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-manifest.ts#L266)

##### `normalizeRelative` — Summary
Normalises backslashes to forward slashes for platform-agnostic path comparison.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
