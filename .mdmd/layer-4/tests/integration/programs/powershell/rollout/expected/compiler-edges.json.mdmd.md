# tests/integration/programs/powershell/rollout/expected/compiler-edges.json

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/expected/compiler-edges.json
- Generated At: 2026-10-16T22:20:46.081Z

## Authored
### Purpose
The file-to-file edges PowerShell's own parser gives for the rollout program, written by `npm run oracle:index` through `pwsh`: dot-sources, module imports, `using module` and the manifest's root module, each carried by the text that makes it; the ground truth `oracle:compare` measures the adapter against.

### Notes
- Never hand-edited; regenerate with `oracle:index` after changing the program (2026-10-16). Paths are relative to this file. A relative path is taken from its file's directory, as the oracle states.

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
- [`Invoke-Rollout`](../Invoke-Rollout.ps1.mdmd.md)
- [`targets`](../config/targets.psd1.mdmd.md)
- [`Logging`](../lib/Logging.ps1.mdmd.md)
- [`Settings`](../lib/Settings.ps1.mdmd.md)
- [`Rollout.Notify`](../modules/Rollout.Notify/Rollout.Notify.psm1.mdmd.md)
- [`Rollout.Steps`](../modules/Rollout.Steps/Rollout.Steps.psd1.mdmd.md)
- [`Rollout.Steps`](../modules/Rollout.Steps/Rollout.Steps.psm1.mdmd.md)
- [`Rollout.Targets`](../modules/Rollout.Targets/Rollout.Targets.psm1.mdmd.md)
- [`Show-RolloutPlan`](../scripts/Show-RolloutPlan.ps1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
