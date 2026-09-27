# tests/integration/fixtures/slopcop-symbols/workspace/slopcop.config.json

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/slopcop-symbols/workspace/slopcop.config.json
- Live Doc ID: LD-asset-tests-integration-fixtures-slopcop-symbols-workspace-slopcop-config-json
- Generated At: 2026-09-27T18:34:31.273Z

## Authored
### Purpose
Configuration file driving the SlopCop symbol audit fixture, defining heading and anchor expectations for sample markdown files.

### Notes
- Enables intentional symbol lint failures so integration tests can validate error messaging and waiver handling.
- Coordinates with fixture markdown to model common mistakes (duplicate headings, missing anchors) the audit must detect.
- Adjust whenever lint rules evolve; document changes in fixture notes to keep expectations aligned.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:34:31.273Z","inputHash":"f5ef468e28d83fc8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `symbols` {#symbol-symbols}
- Type: key

#### `symbols:enabled` {#symbol-symbolsenabled}
- Type: key

#### `symbols:duplicateHeadingSeverity` {#symbol-symbolsduplicateheadingseverity}
- Type: key

#### `symbols:missingAnchorSeverity` {#symbol-symbolsmissinganchorseverity}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
