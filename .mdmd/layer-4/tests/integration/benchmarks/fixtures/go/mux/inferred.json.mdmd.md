# tests/integration/benchmarks/fixtures/go/mux/inferred.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/go/mux/inferred.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-go-mux-inferred-json
- Generated At: 2026-02-03T21:55:43.377Z

## Authored
### Purpose
Heuristic-derived edges inferred by the Go fallback analyzer for gorilla/mux. Contains edges detected via the refined filename-matching strategy (`foo_test.go → foo.go`).

### Notes
Created during [2026-01-27 Chat 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-27.2.md) alongside the SCIP oracle to quantify the gap between compiler-based and heuristic-based analysis.

**Heuristic strategy:** The Go heuristic uses two approaches:
1. **Filename matching** — `mux_test.go → mux.go` when both exist
2. **Small package fallback** — If ≤2 implementation files exist, assume tests reference them

For gorilla/mux (single package with many impl files), only strategy 1 applies.

**Fundamental limitation:** Single-package Go libraries have no imports to trace. This low recall is inherent — the fixture exists precisely to demonstrate SCIP's value for such codebases.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:43.377Z","inputHash":"90d12026576e9ead"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
