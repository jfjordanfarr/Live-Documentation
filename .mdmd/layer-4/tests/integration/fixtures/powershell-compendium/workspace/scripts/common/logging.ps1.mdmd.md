# tests/integration/fixtures/powershell-compendium/workspace/scripts/common/logging.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/workspace/scripts/common/logging.ps1
- Generated At: 2026-09-27T23:21:32.860Z

## Authored
### Purpose
Provide the dot-sourced logging helper consumed by the PowerShell inspect fixture.

### Notes
- Keeps the implementation intentionally tiny so the generated Live Doc highlights the dependency hop back to `scripts/deploy.ps1`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Write-DeploymentLog` {#symbol-writedeploymentlog}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/fixtures/powershell-compendium/workspace/scripts/common/logging.ps1#L8)

##### `Write-DeploymentLog` — Summary
Writes a deployment log entry to standard output.

##### `Write-DeploymentLog` — Parameters
- `Message`: The content to emit in the log entry.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
