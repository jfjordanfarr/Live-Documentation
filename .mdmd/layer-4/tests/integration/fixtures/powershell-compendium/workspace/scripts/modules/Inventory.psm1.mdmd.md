# tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1
- Live Doc ID: LD-implementation-tests-integration-fixtures-powershell-compendium-workspace-scripts-modules-inventory-psm1
- Generated At: 2025-12-06T22:49:54.357Z

## Authored
### Purpose
Expose the exported inventory module that the deploy script loads during inspect CLI regression tests.

### Notes
- Only `Get-InventorySnapshot` is exported so the adapter and heuristic coverage can verify module filtering and inter-script edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:54.357Z","inputHash":"c23732f288d3475e"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Get-InventorySnapshot` {#symbol-getinventorysnapshot}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/fixtures/powershell-compendium/workspace/scripts/modules/Inventory.psm1#L8)

##### `Get-InventorySnapshot` — Summary
Retrieves the latest deployment inventory snapshot for a region.

##### `Get-InventorySnapshot` — Parameters
- `REGION`: The region identifier used to scope the inventory query.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
