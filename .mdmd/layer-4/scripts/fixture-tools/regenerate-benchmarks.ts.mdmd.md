# scripts/fixture-tools/regenerate-benchmarks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/regenerate-benchmarks.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-regenerate-benchmarks-ts
- Generated At: 2026-02-18T21:27:54.566Z

## Authored
### Purpose
Regenerates benchmark fixtures across all supported languages by invoking their compiler-backed oracles, merging manual overrides, and emitting refreshed `oracle.json`, `merged.json`, and diff reports so expected graphs stay honest ahead of benchmark runs ([oracle regeneration CLI rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3835-L5133)).

### Notes
- Debuted 2025-11-03 as `regenerate-ts-benchmarks.ts`, producing TypeScript oracle outputs and wiring package scripts to materialise per-fixture artifacts for review ([initial implementation](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3835-L5133)).
- Renamed and expanded 2025-11-05 to `regenerate-benchmarks.ts`, adding `--lang` routing for C, Rust, Java, Ruby, Python, and TypeScript plus new oracle modules and manifest metadata so every fixture records its provenance ([multi-language expansion](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L12-L289)).
- Added the `--write` pathway on 2025-11-05 and exercised it within safe-commit and CI loops, letting automated runs refresh `expected.json` whenever oracle output changes while logging alignment status ([expected.json sync hook](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L2673-L2684)).
- By 2025-11-06 the CLI regenerated every fixture (including libuv) end-to-end, confirming cross-language oracles, manifest cloning, and benchmark pipeline integration held together during full-suite execution ([full-suite verification](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L1160-L1258)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:54.566Z","inputHash":"001a6dc23e00e0e5"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `runRegenerationCli` {#symbol-runregenerationcli}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/regenerate-benchmarks.ts#L129)

##### `runRegenerationCli` — Summary
CLI entry point for regenerating benchmark expected.json oracles from fixture source code.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:child_process` - `execSync`
- `node:fs` - `existsSync`, `promises`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `pathToFileURL`
- [`fallbackInference.ArtifactSeed`](../../packages/shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)
- [`fallbackInference.inferFallbackGraph`](../../packages/shared/src/inference/fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)
- [`cFixtureOracle.CFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-cfixtureoracleoptions)
- [`cFixtureOracle.COracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedgerecord)
- [`cFixtureOracle.COracleEdgeRelation`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleedgerelation)
- [`cFixtureOracle.COracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-coracleoverrideconfig)
- [`cFixtureOracle.generateCFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-generatecfixturegraph)
- [`cFixtureOracle.mergeCOracleEdges`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-mergecoracleedges)
- [`cFixtureOracle.serializeCOracleEdges`](../../packages/shared/src/testing/fixtureOracles/cFixtureOracle.ts.mdmd.md#symbol-serializecoracleedges)
- [`rubyFixtureOracle.RubyFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyfixtureoracleoptions)
- [`rubyFixtureOracle.RubyOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedgerecord)
- [`rubyFixtureOracle.RubyOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleoverrideconfig)
- [`rubyFixtureOracle.generateRubyFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-generaterubyfixturegraph)
- [`rubyFixtureOracle.mergeRubyOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-mergerubyoracleedges)
- [`rubyFixtureOracle.serializeRubyOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-serializerubyoracleedges)
- [`benchmark-manifest.BENCHMARK_MANIFEST_SEGMENTS`](./benchmark-manifest.ts.mdmd.md#symbol-benchmark_manifest_segments)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
