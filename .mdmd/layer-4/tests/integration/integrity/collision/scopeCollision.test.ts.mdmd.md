# tests/integration/integrity/collision/scopeCollision.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/integrity/collision/scopeCollision.test.ts
- Live Doc ID: LD-test-tests-integration-integrity-collision-scopecollision-test-ts
- Generated At: 2026-01-07T20:20:40.199Z

## Authored
### Purpose
Guards against false-positive diagnostics caused by scoped identifier collisions — changes to local variables should not ripple to unrelated files that happen to use similar identifier names.

### Notes
- Originally `us4/scopeCollision.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- **Test case currently skipped**: The fixture's `architecture.md` now documents both `dataAlpha.ts` and `dataBeta.ts` together, creating a legitimate ripple path. The test premise ("unrelated files") is obsolete
- Part of the **integrity/collision** test category for graph isolation guarantees

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.199Z","inputHash":"f836ee90adece2ed"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert` - `assert`
- `vscode` - `vscode`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
