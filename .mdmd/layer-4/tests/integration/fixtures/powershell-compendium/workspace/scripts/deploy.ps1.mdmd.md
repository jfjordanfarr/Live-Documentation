# tests/integration/fixtures/powershell-compendium/workspace/scripts/deploy.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/workspace/scripts/deploy.ps1
- Entry: program
- Generated At: 2026-10-16T16:49:43.844Z

## Authored
### Purpose
Fixture entry point that simulates an ops deployment script for inspect CLI regression coverage.

### Notes
- Dot-sources the logging helper and imports the inventory module so graph pathfinding can prove PowerShell edges are materialised from Live Docs.
- Dot-sources `./Common/Logging.ps1` for the file `common/logging.ps1` (since 2026-10-16), as a script written on Windows may: the inspect test copies this workspace to a case-sensitive folder, so the edge it finds proves resolution without regard to case through the generator, and the oracle resolves the path as Windows would.
- Lives under the `powershell-compendium` fixture workspace and mirrors the patterns covered by the unit-level adapter tests.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Invoke-Deployment` {#symbol-invoke-deployment}
- Type: function
- Source: [source](../../../../../../../../tests/integration/fixtures/powershell-compendium/workspace/scripts/deploy.ps1#L17)

##### `Invoke-Deployment` — Summary
Deploys compiled artifacts to the requested region.

##### `Invoke-Deployment` — Remarks
Wraps shared logging and inventory refresh helpers so deployments stay observable.

##### `Invoke-Deployment` — Parameters
- `Region`: The geographic region to target during deployment operations.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Management`
- `Microsoft.PowerShell.Utility`
- [`logging`](./common/logging.ps1.mdmd.md)
- [`Inventory`](./modules/Inventory.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
