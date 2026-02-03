# tests/integration/benchmarks/fixtures/csharp/newtonsoft-json/expected.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/benchmarks/fixtures/csharp/newtonsoft-json/expected.json
- Live Doc ID: LD-asset-tests-integration-benchmarks-fixtures-csharp-newtonsoft-json-expected-json
- Generated At: 2026-02-03T21:55:42.905Z

## Authored
### Purpose
Heuristic-derived oracle of dependency edges for Newtonsoft.Json (C#). This fixture replaced the Roslyn sparse checkout as a more maintainable third-party C# benchmark.

### Notes
Created during [2026-01-27 Chat 1](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-27.1.md) as a replacement for the Roslyn fixture which was too large and complex for reliable benchmarking.

**Why Newtonsoft.Json?** A ubiquitous, well-maintained JSON library with clear structure, MIT license, and appropriate size for fixture generation. The selection criteria were: buildable with `scip-dotnet`, permissively licensed, and representative of typical C# library architecture.

**Note on oracle kind:** Unlike the smaller C# fixtures which use SCIP, Newtonsoft.Json currently uses the heuristic oracle due to the complexity of SCIP integration for large vendor fixtures. This is a known area for future improvement.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:42.905Z","inputHash":"19602b819d2b8277"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
