# tests/integration/live-docs/rosettaParity.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/rosettaParity.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-rosettaparity-test-ts
- Generated At: 2026-03-23T20:06:03.123Z

## Authored
### Purpose

Cross-language integration test that runs the full Live Documentation pipeline (`generateLiveDocs`) against all 8 Rosetta Stone benchmark fixtures (TypeScript, Java, C#, Python, Rust, Go, C, PowerShell) and compares the generated markdown across languages to enforce structural parity. This is Phase 1 of LD-208: Rosetta Parity Enforcement.

### Notes

- Created on [Dev Day 77](../../../../../AI-Agent-Workspace/ChatHistory/2026/03/Summarized/2026-03-11.1.SUMMARIZED.md) (2026-03-11) as the first concrete implementation of the Rosetta parity enforcement plan designed during Dev Day 76. The commit (`0e6e156`) landed with the title "LD-208 Phase 1: Rosetta parity test + C/C#/Java adapter fixes (96/96 green)".
- Validates 7 assertions per fixture: error-free generation, file processing, canonical node role coverage (all 8 roles per fixture), leaf invariant (helpers has no outgoing production deps), foundation invariant (types has no outgoing production deps), edge topology consensus (≥6/8 languages agree), and symbol name consensus (≥6/8 languages agree).
- Parses generated markdown to extract Dependencies and Public Symbols sections, classifying dependency targets into canonical roles (`types`, `helpers`, `models`, `services`, `controllers`, `config`, `entrypoint`, `middleware`) using exact segment matching rather than substring heuristics (the `classifyNamespaceSegment` approach, chosen after `classifyByKeyword` misclassified `ctype.h` as "types").
- Each fixture runs in an isolated temp directory to prevent cross-contamination. The test produces a diagnostic matrix file (`rosetta-parity-matrix.md`) with per-language per-assertion results for debugging failures.
- This test is distinct from the AST accuracy benchmarks (which compare SCIP oracle against adapter inference) and from `polyglot-fixtures.test.ts` (which runs 2 language-specific fixtures but does not compare across languages).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-23T20:06:03.123Z","inputHash":"426c33fd94ffa440"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:fs/promises`
- `node:os`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
