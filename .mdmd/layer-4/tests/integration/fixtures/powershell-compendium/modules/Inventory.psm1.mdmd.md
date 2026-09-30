# tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1
- Generated At: 2026-09-30T16:22:06.381Z

## Authored
### Purpose
Model a simple inventory module so the adapter can prove it honors Export-ModuleMember filters when reporting public functions.

### Notes
`Get-InventorySecret` remains unexported on purpose to ensure the test catches any leakage of internal helpers into Live Docs output.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-InventorySnapshot` {#symbol-get-inventorysnapshot}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-compendium/modules/Inventory.psm1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
