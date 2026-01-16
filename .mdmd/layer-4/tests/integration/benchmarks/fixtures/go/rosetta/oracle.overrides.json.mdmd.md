# tests/integration/benchmarks/fixtures/go/rosetta/oracle.overrides.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/go/rosetta/oracle.overrides.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-go-rosetta-oracle-overrides-json
- Generated At: 2026-01-16T19:17:00.071Z

## Authored
### Purpose
Manual edge overrides for the go-rosetta benchmark fixture. Allows specifying edges that static analysis cannot detect (e.g., reflection-based dependencies).

### Notes
- Created during [2026-01-15 dev session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- Currently empty — the Go oracle detects all edges in the Rosetta fixture via static import analysis
- Format: `{ "manualEdges": [{ "source": "...", "target": "...", "relation": "..." }] }`
- Used by `npm run fixtures:regenerate -- --fixture go-rosetta` when merging oracle edges

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-16T19:17:00.071Z","inputHash":"450a303e6e7db238"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers`](./src/helpers/helpers.go.mdmd.md)
- [`helpers_test`](./src/helpers/helpers_test.go.mdmd.md)
- [`pipeline_test`](./src/main/pipeline_test.go.mdmd.md)
- [`models`](./src/models/models.go.mdmd.md)
- [`processor`](./src/processor/processor.go.mdmd.md)
- [`processor_test`](./src/processor/processor_test.go.mdmd.md)
- [`types`](./src/types/types.go.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
