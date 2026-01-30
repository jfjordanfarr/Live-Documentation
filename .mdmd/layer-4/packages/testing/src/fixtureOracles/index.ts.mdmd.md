# packages/testing/src/fixtureOracles/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/testing/src/fixtureOracles/index.ts
- Live Doc ID: LD-implementation-packages-testing-src-fixtureoracles-index-ts
- Generated At: 2026-01-30T00:04:21.326Z

## Authored
### Purpose
Barrel export for fixture oracles. Re-exports all language-specific oracle implementations (C, C#, Go, Java, Python, Ruby, Rust, TypeScript) plus the SCIP normalizer utilities.

### Notes
Created during [Dev Day 65 (2026-01-29)](../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-29.1.md). These oracles generate ground-truth `expected.json` files for benchmark fixtures, enabling precision/recall measurement of the heuristic inference engine.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-30T00:04:21.326Z","inputHash":"067871402038544b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `./cFixtureOracle.js` (re-export)
- `./csharpFixtureOracle.js` (re-export)
- `./goFixtureOracle.js` (re-export)
- `./javaFixtureOracle.js` (re-export)
- `./pythonFixtureOracle.js` (re-export)
- `./rubyFixtureOracle.js` (re-export)
- `./rustFixtureOracle.js` (re-export)
- `./scipNormalizer.js` (re-export)
- `./typeScriptFixtureOracle.js` (re-export)
<!-- LIVE-DOC:END Dependencies -->
