# tests/integration/integrity/hygiene/broken-links.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/integrity/hygiene/broken-links.test.ts
- Live Doc ID: LD-test-tests-integration-integrity-hygiene-broken-links-test-ts
- Generated At: 2026-01-07T20:20:40.201Z

## Authored
### Purpose
Validates that documentation link drift is detected when referenced markdown files are renamed or moved. Exercises the ripple analyzer's ability to surface broken cross-document links as diagnostics on the source document.

### Notes
- Originally `us3/markdownLinkDrift.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- Uses `simple-workspace` fixture with `docs/link-source.md` → `docs/link-target.md` relationship
- Tests rename/restore cycle to verify diagnostics appear when links break and clear when restored
- Part of the **integrity/hygiene** test category for structural workspace health checks

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.201Z","inputHash":"8d45798f6d45e73b"}]} -->
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
