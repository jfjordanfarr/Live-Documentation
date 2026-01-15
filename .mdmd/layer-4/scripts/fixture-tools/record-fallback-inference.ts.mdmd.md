# scripts/fixture-tools/record-fallback-inference.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/record-fallback-inference.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-record-fallback-inference-ts
- Generated At: 2026-01-15T16:26:54.050Z

## Authored
### Purpose
Captures deterministic fallback-inference graphs for benchmark fixtures by materialising workspaces, running the heuristics engine, and writing sorted `inferred.json` samples (or updating fixtures with `--write`) so we can baseline heuristic behaviour against oracle truth ([fallback capture CLI introduction](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1310-L1430)).

### Notes
- Introduced 2025-11-05 to pair with the oracle regeneration loop; the CLI landed alongside heuristic tracing updates and the new `npm run fixtures:record-fallback` script, giving us a reproducible way to review captures before committing them ([initial rollout](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1310-L1430)).
- Iterated the same day across Rust, Java, Ruby, and C fixtures via the language filter flags, using the tool to tighten heuristics and refresh `inferred.json` until benchmarks stabilised ([multi-language capture sweep](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-05.md#L1356-L1555)).
- Expanded 2025-11-06 with `--lang csharp`, dynamic language listings, and `.cs` defaults so the new C# fixtures slot into the same verification pipeline as other languages ([C# support update](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L3520-L3600)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T16:26:54.050Z","inputHash":"93894b24d7dd18c0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `runCli` {#symbol-runcli}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/record-fallback-inference.ts#L101)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs` - `promises`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`, `pathToFileURL`
- [`artifacts.LinkRelationshipKind`](../../packages/shared/src/domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
- [`fallbackInference.ArtifactSeed`](../../packages/shared/src/inference/fallbackInference.ts.mdmd.md#symbol-artifactseed)
- [`fallbackInference.FallbackInferenceResult`](../../packages/shared/src/inference/fallbackInference.ts.mdmd.md#symbol-fallbackinferenceresult)
- [`fallbackInference.inferFallbackGraph`](../../packages/shared/src/inference/fallbackInference.ts.mdmd.md#symbol-inferfallbackgraph)
- [`benchmark-manifest.BENCHMARK_MANIFEST_SEGMENTS`](./benchmark-manifest.ts.mdmd.md#symbol-benchmark_manifest_segments)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.loadBenchmarkManifest`](./benchmark-manifest.ts.mdmd.md#symbol-loadbenchmarkmanifest)
- [`fixtureMaterializer.materializeFixture`](./fixtureMaterializer.ts.mdmd.md#symbol-materializefixture)
<!-- LIVE-DOC:END Dependencies -->
