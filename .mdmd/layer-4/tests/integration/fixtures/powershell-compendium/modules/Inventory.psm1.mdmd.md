# tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1
- Live Doc ID: LD-implementation-tests-integration-fixtures-powershell-compendium-modules-inventory-psm1
- Generated At: 2025-12-06T22:49:50.925Z

## Authored
### Purpose
Model a simple inventory module so the adapter can prove it honors Export-ModuleMember filters when reporting public functions.

### Notes
`Get-InventorySecret` remains unexported on purpose to ensure the test catches any leakage of internal helpers into Live Docs output.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:50.925Z","inputHash":"122913b35589da6b"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-InventorySnapshot` {#symbol-getinventorysnapshot}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
