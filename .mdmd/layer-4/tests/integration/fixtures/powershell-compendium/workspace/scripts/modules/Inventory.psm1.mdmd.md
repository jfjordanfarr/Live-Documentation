# tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1
- Generated At: 2026-09-30T16:22:06.429Z

## Authored
### Purpose
Expose the exported inventory module that the deploy script loads during inspect CLI regression tests.

### Notes
- Only `Get-InventorySnapshot` is exported so the adapter and heuristic coverage can verify module filtering and inter-script edges.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-InventorySnapshot` {#symbol-get-inventorysnapshot}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1#L8)

##### `Get-InventorySnapshot` — Summary
Retrieves the latest deployment inventory snapshot for a region.

##### `Get-InventorySnapshot` — Parameters
- `Region`: The region identifier used to scope the inventory query.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
