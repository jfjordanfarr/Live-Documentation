# packages/generator/src/history/generatorIdentity.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/generatorIdentity.ts
- Generated At: 2026-10-18T00:39:23.826Z

## Authored
### Purpose
The generator's half of the history's lens: its package version, and, when it runs from a checkout of this repository, the commit it runs from and a hash of any uncommitted change to the engine or the generator, so that a generator edited in place is a new lens.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it". The commit alone would let a cache made before an edit serve a run after it; the hash of the diff and of the untracked files under `packages/engine` and `packages/generator` closes that. The installed packages under `node_modules`, the grammars among them, are not in the lens; the lockfile at the commit names them.
- A checkout of this repository is recognized by the generator standing at `packages/generator` of the git top level, so a copy installed into another repository reports no commit.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `generatorIdentity` {#symbol-generatoridentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L31)

##### `generatorIdentity` — Summary
The generator's package version and, when it runs from a checkout of this
repository, the commit it runs from and a hash of any uncommitted change to
the engine or the generator there, so that a generator edited in place is a
new lens rather than the commit it started from.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path` - `path`
- [`gitUtils.execFileAsync`](../../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`format.GeneratorIdentity`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-generatoridentity) (type-only)
<!-- LIVE-DOC:END Dependencies -->
