# tests/integration/fixtures/powershell-compendium/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/fixtures/powershell-compendium/expected/compiler-edges.json
- Generated At: 2026-10-16T22:20:42.804Z

## Authored
### Purpose
The file-to-file edges PowerShell's own parser gives for the PowerShell compendium fixture, written by `npm run oracle:index` through `pwsh`: the dot-sources and the module import of its two layouts.

### Notes
- Never hand-edited; regenerate with `oracle:index` after changing the fixture (2026-10-16). Paths are relative to this file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `tool` {#symbol-tool}
- Type: key

#### `projects` {#symbol-projects}
- Type: key

#### `documents` {#symbol-documents}
- Type: key

#### `outside` {#symbol-outside}
- Type: key

#### `edges` {#symbol-edges}
- Type: key

#### `ambiguous` {#symbol-ambiguous}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`logging`](../common/logging.ps1.mdmd.md)
- [`settings`](../config/settings.psd1.mdmd.md)
- [`Inventory`](../modules/Inventory.psm1.mdmd.md)
- [`deploy`](../scripts/deploy.ps1.mdmd.md)
- [`logging`](../workspace/scripts/common/logging.ps1.mdmd.md)
- [`deploy`](../workspace/scripts/deploy.ps1.mdmd.md)
- [`Inventory`](../workspace/scripts/modules/Inventory.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
