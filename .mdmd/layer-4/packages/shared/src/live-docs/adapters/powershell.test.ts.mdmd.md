# packages/shared/src/live-docs/adapters/powershell.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/shared/src/live-docs/adapters/powershell.test.ts
- Live Doc ID: LD-test-packages-shared-src-live-docs-adapters-powershell-test-ts
- Generated At: 2026-01-15T02:41:18.692Z

## Authored
### Purpose
Exercise the PowerShell adapter against the compendium fixtures to confirm symbol extraction, dependency mapping, and module export filtering.

### Notes
The suite mirrors the fixtures into a temporary workspace, skips automatically when no PowerShell runtime is available, and expects Export-ModuleMember to gate public surface area.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-15T02:41:18.692Z","inputHash":"ce7238402b658d1a"}]} -->
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

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/shared/src/live-docs: [core.ts](../core.ts.mdmd.md)
- packages/shared/src/live-docs/adapters: [adapters/index.ts](./index.ts.mdmd.md), [powershell.ts](./powershell.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
