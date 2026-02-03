# tests/integration/fixtures/powershell-compendium/scripts/deploy.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/scripts/deploy.ps1
- Live Doc ID: LD-implementation-tests-integration-fixtures-powershell-compendium-scripts-deploy-ps1
- Generated At: 2026-02-03T21:55:48.274Z

## Authored
### Purpose
Simulate a deployment entry point that dot-sources helpers, imports a custom module, and declares `#requires` metadata for adapter coverage tests.

### Notes
Pairs with the module and logging fixtures to exercise dependency fan-out, ensuring Live Docs records module, requirement, and dot-source edges.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:48.274Z","inputHash":"b9f2f0f31e8a71ed"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Invoke-Deployment` {#symbol-invokedeployment}
- Type: function
- Source: [source](../../../../../../../tests/integration/fixtures/powershell-compendium/scripts/deploy.ps1#L12)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Management`
- `MyCompany.Inventory`
- [`logging`](../common/logging.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
