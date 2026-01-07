# tests/integration/core/graph/codeImpact.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/core/graph/codeImpact.test.ts
- Live Doc ID: LD-test-tests-integration-core-graph-codeimpact-test-ts
- Generated At: 2026-01-07T20:20:40.040Z

## Authored
### Purpose
Confirms that saving implementation files raises diagnostics on every dependent module, honours debounce behaviour, and surfaces transitive dependency ripples. The foundational "does change impact propagate?" test.

### Notes
- Originally `us1/codeImpact.test.ts`, relocated during Dev Day 53 (2026-01-07) test restructure
- Uses `simple-workspace` fixture with `core.ts` → `feature.ts` → `util.ts` dependency chain
- Validates both direct and transitive (multi-hop) diagnostic propagation
- Tests debounce behaviour to ensure rapid saves don't flood the diagnostic system
- Part of the **core/graph** test category for foundational change-impact validation

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-07T20:20:40.040Z","inputHash":"7215b03d59ed6d76"}]} -->
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
