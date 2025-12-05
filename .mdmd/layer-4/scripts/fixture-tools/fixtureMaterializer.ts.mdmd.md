# scripts/fixture-tools/fixtureMaterializer.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/fixtureMaterializer.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-fixturematerializer-ts
- Generated At: 2025-12-05T04:16:20.362Z

## Authored
### Purpose
Creates ephemeral benchmark workspaces by cloning or copying fixtures defined in `fixtures.manifest.json`, returning cleanup hooks so verification and regeneration commands operate on fresh checkouts with integrity digests ([materializer introduction](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5094-L5335)).

### Notes
- Authored 2025-11-01 to unblock ky/libuv onboarding; `verify-fixtures.ts` now calls `materializeFixture` so each audit clones into `AI-Agent-Workspace/tmp/benchmarks/vendor/<id>` and computes SHA-256 digests from the staged tree ([manifest integration](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5094-L5335)).
- The same commit series rewired `astAccuracy.test.ts` to use the materializer, ensuring benchmark runs spin up disposable workspaces and tear them down after comparison ([benchmark harness update](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L5200-L5335)).
- On 2025-11-06 we validated the helper across new fixtures (e.g., java-okhttp) while computing integrity digests, proving ephemeral mode cleans up after multi-repo clones ([ephemeral verification](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-06.md#L1910-L1913)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.362Z","inputHash":"f3eb92e85e936c83"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `MaterializeResult` {#symbol-materializeresult}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/fixtureMaterializer.ts#L12)

#### `materializeFixture` {#symbol-materializefixture}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/fixtureMaterializer.ts#L18)
- Parameters: `fixture`: `BenchmarkFixtureDefinition`; `options`: `MaterializeOptions`

#### `MaterializeOptions` {#symbol-materializeoptions}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/fixtureMaterializer.ts#L159)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
- `node:fs` - `promises`
- `node:os` - `os`
- `node:path` - `path`
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.FixtureGitMaterialization`](./benchmark-manifest.ts.mdmd.md#symbol-fixturegitmaterialization)
- [`benchmark-manifest.FixtureMaterialization`](./benchmark-manifest.ts.mdmd.md#symbol-fixturematerialization)
<!-- LIVE-DOC:END Dependencies -->
