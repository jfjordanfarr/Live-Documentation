# scripts/fixture-tools/benchmark-doc.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/fixture-tools/benchmark-doc.ts
- Live Doc ID: LD-implementation-scripts-fixture-tools-benchmark-doc-ts
- Generated At: 2025-12-05T04:16:20.343Z

## Authored
### Purpose
Regenerates the AST benchmark documentation by rendering manifest-sourced vendor inventories into `astAccuracyFixtures` so provenance, file counts, and integrity hashes stay in sync with the fixture registry ([doc generator introduction](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4370-L4476)).

### Notes
- Landed 2025-11-01 alongside the manifest/helpers, letting `fixtures:sync-docs` rewrite the vendor sections from structured data instead of hand-maintained tables ([initial automation](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-01.md#L4440-L4560)).
- Repointed 2025-11-16 to emit into `.live-documentation/source/benchmarks/astAccuracyFixtures.md`, preserving the Stage-0 `.md` mirror while keeping sync-ast-doc.ts and verify-fixtures.ts aligned with the new location ([mirror alignment](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-16.md#L2700-L2820)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:20.343Z","inputHash":"df1648b79d3e96b9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `VENDOR_SECTION_START` {#symbol-vendor_section_start}
- Type: const
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L13)

#### `VENDOR_SECTION_END` {#symbol-vendor_section_end}
- Type: const
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L14)

#### `RenderOptions` {#symbol-renderoptions}
- Type: interface
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L16)

#### `resolveAstFixtureDocPath` {#symbol-resolveastfixturedocpath}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L21)

#### `ensureVendorSection` {#symbol-ensurevendorsection}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L32)
- Parameters: `fixtures`: `BenchmarkFixtureDefinition`[]; `options`: `RenderOptions`

#### `renderVendorInventory` {#symbol-rendervendorinventory}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L45)
- Parameters: `fixtures`: `BenchmarkFixtureDefinition`[]; `_options`: `RenderOptions`

#### `extractVendorInventory` {#symbol-extractvendorinventory}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L77)

#### `replaceDelimitedSection` {#symbol-replacedelimitedsection}
- Type: function
- Source: [source](../../../../scripts/fixture-tools/benchmark-doc.ts#L90)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `promises`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`benchmark-manifest.BenchmarkFixtureDefinition`](./benchmark-manifest.ts.mdmd.md#symbol-benchmarkfixturedefinition)
- [`benchmark-manifest.FixtureFileSetSpec`](./benchmark-manifest.ts.mdmd.md#symbol-fixturefilesetspec)
- [`benchmark-manifest.FixtureIntegritySpec`](./benchmark-manifest.ts.mdmd.md#symbol-fixtureintegrityspec)
- [`benchmark-manifest.FixtureMaterialization`](./benchmark-manifest.ts.mdmd.md#symbol-fixturematerialization)
- [`benchmark-manifest.FixtureProvenance`](./benchmark-manifest.ts.mdmd.md#symbol-fixtureprovenance)
<!-- LIVE-DOC:END Dependencies -->
