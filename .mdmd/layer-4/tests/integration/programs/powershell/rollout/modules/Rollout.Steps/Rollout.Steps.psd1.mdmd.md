# tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1
- Entry: tooling
- Generated At: 2026-10-16T21:50:05.273Z

## Authored
### Purpose
The manifest of the `Rollout.Steps` module: its root module, version, the module it requires and the functions it exports; the entry script imports the module through it.

### Notes
- Read as a manifest since 2026-10-16: the module `Rollout.Steps` is its symbol, its root module a dependency and the `module` entry it declares, and `Microsoft.PowerShell.Utility@7.0.0.0` an external dependency, from a `RequiredModules` specification added that day so that a version is measured against the oracle. The program still runs under PowerShell 7, which carries that module.
- A `tooling` entry by the package it publishes, since a `.psd1`'s name cannot tell a manifest from a data file such as `config/targets.psd1`, which is no entry.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Rollout.Steps` {#symbol-rolloutsteps}
- Type: package
- Source: [source](../../../../../../../../../tests/integration/programs/powershell/rollout/modules/Rollout.Steps/Rollout.Steps.psd1#L1)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `Microsoft.PowerShell.Utility@7.0.0.0`
- [`Rollout.Steps`](./Rollout.Steps.psm1.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
