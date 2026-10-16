# tests/integration/programs/powershell/rollout/lib/Logging.ps1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/lib/Logging.ps1
- Entry: program
- Generated At: 2026-10-16T16:49:47.908Z

## Authored
### Purpose
The rollout program's log and banner helpers, dot-sourced by both of its scripts.

### Notes
- Help stands above a keyword; the banner is a here-string whose `#` lines and the word `function` are text, which a reader of the text alone would take for comments and a definition; the prefix helper is `script:`-scoped.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Write-RolloutLog` {#symbol-write-rolloutlog}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/powershell/rollout/lib/Logging.ps1#L8)

##### `Write-RolloutLog` — Summary
Writes one line of the rollout log, stamped with the time.

##### `Write-RolloutLog` — Parameters
- `Message`: The line to write.

#### `Write-RolloutBanner` {#symbol-write-rolloutbanner}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/powershell/rollout/lib/Logging.ps1#L16)

#### `script:Get-LogPrefix` {#symbol-scriptget-logprefix}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/powershell/rollout/lib/Logging.ps1#L27)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
