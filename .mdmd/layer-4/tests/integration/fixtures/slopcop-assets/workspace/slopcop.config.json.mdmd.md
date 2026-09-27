# tests/integration/fixtures/slopcop-assets/workspace/slopcop.config.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/slopcop-assets/workspace/slopcop.config.json
- Live Doc ID: LD-asset-tests-integration-fixtures-slopcop-assets-workspace-slopcop-config-json
- Generated At: 2026-09-27T18:34:31.177Z

## Authored
### Purpose
Configuration used by the SlopCop asset audit fixture to trigger intentional pass/fail scenarios during integration tests.

### Notes
- Declares known-missing and expected asset paths so tests can confirm lint output matches our waiver strategy.
- Shared between safe-commit runs and targeted `npm run slopcop:assets` executions; edits here directly influence lint coverage.
- Update in sync with fixture asset files and record any waiver additions in the fixture README.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:31.177Z","inputHash":"2c11abb46831c7df"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `assets` {#symbol-assets}
- Type: key

#### `assets:includeGlobs` {#symbol-assetsincludeglobs}
- Type: key

#### `assets:rootDirectories` {#symbol-assetsrootdirectories}
- Type: key

#### `assets:ignoreTargets` {#symbol-assetsignoretargets}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
