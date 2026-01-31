# scripts/fixture-tools/regenerate-benchmarks.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/regenerate-benchmarks.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-regenerate-benchmarks-ts
- Generated At: 2026-01-30T23:50:04.353Z

## Authored
### Purpose
Regenerates benchmark fixtures across all supported languages by invoking their compiler-backed oracles, merging manual overrides, and emitting refreshed `oracle.json`, `merged.json`, and diff reports so expected graphs stay honest ahead of benchmark runs ([oracle regeneration CLI rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3835-L5133)).

### Notes
- Debuted 2025-11-03 as `regenerate-ts-benchmarks.ts`, producing TypeScript oracle outputs and wiring package scripts to materialise per-fixture artifacts for review ([initial implementation](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-03.md#L3835-L5133)).
- Renamed and expanded 2025-11-05 to `regenerate-benchmarks.ts`, adding `--lang` routing for C, Rust, Java, Ruby, Python, and TypeScript plus new oracle modules and manifest metadata so every fixture records its provenance ([multi-language expansion](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L12-L289)).
- Added the `--write` pathway on 2025-11-05 and exercised it within safe-commit and CI loops, letting automated runs refresh `expected.json` whenever oracle output changes while logging alignment status ([expected.json sync hook](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L2673-L2684)).
- By 2025-11-06 the CLI regenerated every fixture (including libuv) end-to-end, confirming cross-language oracles, manifest cloning, and benchmark pipeline integration held together during full-suite execution ([full-suite verification](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L1160-L1258)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T23:50:04.353Z","inputHash":"5f1559c6ef56b0b3"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `runRegenerationCli` {#symbol-runregenerationcli}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/regenerate-benchmarks.ts#L232)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:child_process` - `execSync`
- `node:fs` - `promises`
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
- [`csharpFixtureOracle.CSharpFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharpfixtureoracleoptions)
- [`csharpFixtureOracle.CSharpOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleedgerecord)
- [`csharpFixtureOracle.CSharpOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-csharporacleoverrideconfig)
- [`csharpFixtureOracle.generateCSharpFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-generatecsharpfixturegraph)
- [`csharpFixtureOracle.mergeCSharpOracleEdges`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-mergecsharporacleedges)
- [`csharpFixtureOracle.serializeCSharpOracleEdges`](../../packages/shared/src/testing/fixtureOracles/csharpFixtureOracle.ts.mdmd.md#symbol-serializecsharporacleedges)
- [`goFixtureOracle.GoFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gofixtureoracleoptions)
- [`goFixtureOracle.GoOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleedgerecord)
- [`goFixtureOracle.GoOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-gooracleoverrideconfig)
- [`goFixtureOracle.generateGoFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-generategofixturegraph)
- [`goFixtureOracle.mergeGoOracleEdges`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-mergegooracleedges)
- [`goFixtureOracle.serializeGoOracleEdges`](../../packages/shared/src/testing/fixtureOracles/goFixtureOracle.ts.mdmd.md#symbol-serializegooracleedges)
- [`javaFixtureOracle.JavaFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javafixtureoracleoptions)
- [`javaFixtureOracle.JavaOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleedgerecord)
- [`javaFixtureOracle.JavaOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-javaoracleoverrideconfig)
- [`javaFixtureOracle.generateJavaFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-generatejavafixturegraph)
- [`javaFixtureOracle.mergeJavaOracleEdges`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-mergejavaoracleedges)
- [`javaFixtureOracle.serializeJavaOracleEdges`](../../packages/shared/src/testing/fixtureOracles/javaFixtureOracle.ts.mdmd.md#symbol-serializejavaoracleedges)
- [`pythonFixtureOracle.PythonFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonfixtureoracleoptions)
- [`pythonFixtureOracle.PythonOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleedgerecord)
- [`pythonFixtureOracle.PythonOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-pythonoracleoverrideconfig)
- [`pythonFixtureOracle.generatePythonFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-generatepythonfixturegraph)
- [`pythonFixtureOracle.mergePythonOracleEdges`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-mergepythonoracleedges)
- [`pythonFixtureOracle.serializePythonOracleEdges`](../../packages/shared/src/testing/fixtureOracles/pythonFixtureOracle.ts.mdmd.md#symbol-serializepythonoracleedges)
- [`rubyFixtureOracle.RubyFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyfixtureoracleoptions)
- [`rubyFixtureOracle.RubyOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleedgerecord)
- [`rubyFixtureOracle.RubyOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-rubyoracleoverrideconfig)
- [`rubyFixtureOracle.generateRubyFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-generaterubyfixturegraph)
- [`rubyFixtureOracle.mergeRubyOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-mergerubyoracleedges)
- [`rubyFixtureOracle.serializeRubyOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rubyFixtureOracle.ts.mdmd.md#symbol-serializerubyoracleedges)
- [`rustFixtureOracle.RustFixtureOracleOptions`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustfixtureoracleoptions)
- [`rustFixtureOracle.RustOracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleedgerecord)
- [`rustFixtureOracle.RustOracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-rustoracleoverrideconfig)
- [`rustFixtureOracle.generateRustFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-generaterustfixturegraph)
- [`rustFixtureOracle.mergeRustOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-mergerustoracleedges)
- [`rustFixtureOracle.serializeRustOracleEdges`](../../packages/shared/src/testing/fixtureOracles/rustFixtureOracle.ts.mdmd.md#symbol-serializerustoracleedges)
- [`typeScriptFixtureOracle.OracleEdgeRecord`](../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleedgerecord)
- [`typeScriptFixtureOracle.OracleOverrideConfig`](../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-oracleoverrideconfig)
- [`typeScriptFixtureOracle.generateTypeScriptFixtureGraph`](../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-generatetypescriptfixturegraph)
- [`typeScriptFixtureOracle.mergeOracleEdges`](../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-mergeoracleedges)
- [`typeScriptFixtureOracle.serializeOracleEdges`](../../packages/shared/src/testing/fixtureOracles/typeScriptFixtureOracle.ts.mdmd.md#symbol-serializeoracleedges)
- [`benchmark-manifest.BENCHMARK_MANIFEST_SEGMENTS`](./benchmark-manifest.ts.mdmd.md#symbol-benchmark_manifest_segments)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
