# packages/generator/src/history/generatorIdentity.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/generator/src/history/generatorIdentity.ts
- Generated At: 2026-10-22T16:47:56.961Z

## Authored
### Purpose
The generator's half of the history's lens: its package version and, when it runs from this tool's checkout, the commit and the committed and uncommitted identities of its code and dependency lock.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it". The commit alone would let a cache made before an edit serve a run after it; the diff and untracked files under `packages/engine` and `packages/generator` close that.
- A checkout of this repository is recognized by the generator standing at `packages/generator` of the git top level, so a copy installed into another repository reports no commit.
- The code as committed (the evening of 2026-10-18): the tree ids of the engine and the generator at the commit, read by one `git rev-parse` and hashed, so that the lens follows the code and not the commit; the commit is still named for the reader.
- This tool checkout's root `package-lock.json` also belongs to the lens: its committed Git entry joins the code hash, and the working file's actual blob is compared with that entry whether Git tracks or ignores it. A differing blob joins the modified hash; an absent lock has a stable marker. The scanned project's lock never enters the generator identity; an installed copy without this tool checkout retains the existing version-only identity rather than borrowing its host's lock. This corrects the cache-identity gap found in the [October 19 generation-cost investigation](../../../../../../AI-Agent-Workspace/Probes/2026-10-19/generation-cost/README.md#the-cache-boundary-to-investigate).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `generatorIdentity` {#symbol-generatoridentity}
- Type: function
- Source: [source](../../../../../../packages/generator/src/history/generatorIdentity.ts#L35)

##### `generatorIdentity` — Summary
The generator's package version and, when it runs from a checkout of this
repository, a hash of its code and tool dependency lock as committed (the
engine and generator tree ids and the lock entry at the commit), the commit
it runs from, and a hash of uncommitted changes to those inputs. The lock's
working bytes are compared to its committed blob even when Git ignores it.
An absent lock has its own stable identity; a scanned project's lock is never read.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- `node:fs` - `promises`
- `node:path` - `path`
- [`gitUtils.execFileAsync`](../../../engine/src/live-docs/gitUtils.ts.mdmd.md#symbol-execfileasync)
- [`format.GeneratorIdentity`](../../../engine/src/live-docs/history/format.ts.mdmd.md#symbol-generatoridentity) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
