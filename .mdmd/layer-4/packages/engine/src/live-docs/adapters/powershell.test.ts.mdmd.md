# packages/engine/src/live-docs/adapters/powershell.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/engine/src/live-docs/adapters/powershell.test.ts
- Generated At: 2026-09-27T23:21:30.837Z

## Authored
### Purpose
Exercise the PowerShell adapter against the compendium fixtures to confirm symbol extraction, dependency mapping, and module export filtering.

### Notes
The suite mirrors the fixtures into a temporary workspace, skips automatically when no PowerShell runtime is available, and expects Export-ModuleMember to gate public surface area.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs/promises`
- `node:os`
- `node:path` - `path`
- [`powershell.powershellAdapter`](./powershell.ts.mdmd.md#symbol-powershelladapter)
- `vitest` - `afterEach`, `beforeEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
