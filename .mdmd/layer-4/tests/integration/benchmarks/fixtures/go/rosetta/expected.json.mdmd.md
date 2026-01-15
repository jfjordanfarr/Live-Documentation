# tests/integration/benchmarks/fixtures/go/rosetta/expected.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/go/rosetta/expected.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-go-rosetta-expected-json
- Generated At: 2026-01-15T18:39:07.016Z

## Authored
### Purpose
Canonical ground-truth dependency graph for the go-rosetta benchmark fixture. Contains 6 edges representing the expected import relationships between Go source files.

### Notes
- Created during [2026-01-15 dev session](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-15.1.md) as part of Go Rosetta fixture implementation
- Part of the Rosetta Stone fixture family for cross-language benchmark comparison
- Uses idiomatic Go package structure (package-per-directory) unlike the flat structure in other Rosetta fixtures
- Graph shape mirrors other Rosetta variants: main → models/processor, processor → helpers/models/types, models → types

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T18:39:07.016Z","inputHash":"c445f6e72de99520"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`helpers`](./src/helpers/helpers.go.mdmd.md)
- [`main`](./src/main/main.go.mdmd.md)
- [`models`](./src/models/models.go.mdmd.md)
- [`processor`](./src/processor/processor.go.mdmd.md)
- [`types`](./src/types/types.go.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
