# packages/engine/src/live-docs/history/lens.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/lens.ts
- Generated At: 2026-10-22T16:47:53.214Z

## Authored
### Purpose
The lens's key: a hash of the generator's identity and the normalized configuration it applies to every commit, over JSON with every object's keys sorted, so that a summary is reused only under the lens that made it.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it; the cache is keyed by both; a new lens recomputes", from the owner's one lens of [Turn 3 of October 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3).
- The key is the first sixteen hexadecimal digits of a SHA-256 and names the cache's folder.
- Since the evening of 2026-10-18 the key is made of the generator's version, its committed and uncommitted tool inputs, with the configuration; the commit rides in the lens and does not key it. The tool checkout's root dependency lock joined those inputs on 2026-10-19, so a dependency-only change recomputes without treating the scanned project's lock as part of the tool.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `lensOf` {#symbol-lensof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/lens.ts#L19)
- Returns: [`HistoryLens`](./format.ts.mdmd.md#symbol-historylens)
- Parameters: `generator`: [`GeneratorIdentity`](./format.ts.mdmd.md#symbol-generatoridentity); `configuration`: [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `lensOf` — Summary
The lens of a generator and a normalized configuration, with its key. The key is made of the generator's version,
its committed code and tool dependency lock, its uncommitted changes to either, and the configuration; the commit
the generator runs from rides in the lens for the reader but does not key it, so unrelated commits keep the cache.

#### `canonicalJson` {#symbol-canonicaljson}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/lens.ts#L26)

##### `canonicalJson` — Summary
JSON with every object's keys in sorted order, so that two equal values always hash alike.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:crypto` - `createHash`
- [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`format.GeneratorIdentity`](./format.ts.mdmd.md#symbol-generatoridentity) (type-only)
- [`format.HistoryLens`](./format.ts.mdmd.md#symbol-historylens) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
