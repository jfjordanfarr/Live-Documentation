# tests/integration/benchmarks/fixtures/go/mux/expected.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/go/mux/expected.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-go-mux-expected-json
- Generated At: 2026-02-03T21:55:43.362Z

## Authored
### Purpose
SCIP-derived oracle of dependency edges for the gorilla/mux HTTP router (Go). This fixture represents the ground truth extracted by `scip-go` and normalized via the Go-specific SCIP normalizer.

### Notes
Created during [2026-01-27 Chat 2](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-27.2.md) to stress-test the Go heuristic's capability against a real-world third-party library.

**Why gorilla/mux?** A popular, production-grade Go HTTP router with idiomatic single-package structure. This structure is deliberately challenging for import-based heuristics because all source files share the same package — there are no inter-package imports to detect.

**Key finding:** This oracle demonstrates the value of SCIP compiler analysis for single-package Go libraries. Fallback heuristics can only detect edges via `_test.go → matching impl.go` filename patterns, missing the symbol-level references that SCIP captures.

**Integrity:** Generated via `scip-go` from commit `db9d1d0073d27a0a2d9a8c1bc52aa0af4374d265`. Spurious go-build cache edges were filtered by the Go normalizer.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:43.362Z","inputHash":"45c10132f7bb7bbb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
