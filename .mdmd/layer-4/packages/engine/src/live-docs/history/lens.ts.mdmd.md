# `packages/engine/src/live-docs/history/lens.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/engine/src/live-docs/history/lens.ts`
- Generated At: 2026-11-20T14:56:05.720Z

## Authored
### Purpose
The lens's key: a hash of the generator's identity and the normalized configuration it applies to every commit, over JSON with every object's keys sorted, so that a summary is reused only under the lens that made it.

### Notes
- Written 2026-10-17 for C1, scenario 13 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md): "A sequence says which generator and configuration made it; the cache is keyed by both; a new lens recomputes", from the owner's one lens of [Turn 3 of October 16](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/10/2026-10-16/2026-10-16.1.record.md#turn-3).
- The key is the first sixteen hexadecimal digits of a SHA-256 and names the cache's folder.
- Since the evening of 2026-10-18 the key is made of the generator's version, its committed and uncommitted tool inputs, with the configuration; the commit rides in the lens and does not key it. The tool checkout's root dependency lock joined those inputs on 2026-10-19, so a dependency-only change recomputes without treating the scanned project's lock as part of the tool. The runtime's version of Unicode joined them on 2026-11-19, once the engine's order and its anchors were made to depend on nothing else of the runtime.
- Since 2026-11-19 the configuration's bundle exclusions do not key it: a summary keeps every linked and citing document and the exclusions are applied where the summaries are read (`bundled.ts`), so an edit of them rewrites the sequence from the cache rather than discarding it; the lens still carries the whole configuration for its reader ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#every-name-of-a-commits-tree-stands-and-the-bundles-exclusions-apply-where-summaries-are-read-recorded-2026-11-19)).
- Since a later edit of 2026-11-19 one function, `summarizedConfiguration`, gives the configuration a summary is made under, the lens's without `bundleExclude` and without `board`, which no module of the engine or the generator reads; the key hashes it and the history command hands it to the summarizing process, so that what is keyed is by construction what a summary is made under. The module is in the key since (`SUMMARY_MODULES`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `lensOf` {#symbol-lensof}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/lens.ts#L28)
- Returns: [`HistoryLens`](./format.ts.mdmd.md#symbol-historylens)
- Parameters: `generator`: [`GeneratorIdentity`](./format.ts.mdmd.md#symbol-generatoridentity); `configuration`: [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `lensOf` — Summary
The lens of a generator and a normalized configuration, with its key. The key is made of the generator's version,
its committed code and tool dependency lock, its uncommitted changes to either, the runtime's version of Unicode,
and the configuration a summary is made under ({@link summarizedConfiguration}); the commit the generator runs from
rides in the lens for the reader but does not key it, so unrelated commits keep the cache. The lens itself carries
the whole configuration, for the reader.

With the configuration goes what the repository itself decides of how a summary is made: whether its version control
matches names without regard to case (`VersionControl.ignoresCase`, for git its own `core.ignorecase`), which the
generator applies to `exclude`, so that a clone made on Windows excludes `Docs/` where a pattern names `docs/`. Since
2026-11-20 it keys the lens, and the trees' environment answers the generator with the value keyed, so that the key and
the summary read one value; before, it reached summaries unkeyed, and a cache moved between machines could hold
summaries made under the other. Where it is false the key is made as before it was keyed.

#### `summarizedConfiguration` {#symbol-summarizedconfiguration}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/lens.ts#L47)
- Returns: [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- Parameters: `configuration`: [`LiveDocumentationConfig`](../../config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)

##### `summarizedConfiguration` — Summary
The configuration a commit's summary is made under: the lens's, without what only the reading of summaries uses.
The history command hands the summarizing process exactly this, and the lens's key holds exactly this, so that what
is keyed is by construction what a summary is made under.

##### `summarizedConfiguration` — Remarks
Since 2026-11-19 the bundle's exclusions (`bundleExclude`) are applied where summaries are read (`bundled.ts`), and a
summary keeps every linked and citing document, so an edit of them rewrites the sequence from the cache. No module of
the engine or the generator reads the board (`board`, read by the Explorer's builder and the board command), so it
goes the same way. `requireRelativeLinks` and `slugDialect` are read by no module of either package either, by a
search of their sources, and stay in until that is shown by more than a search.

#### `canonicalJson` {#symbol-canonicaljson}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/lens.ts#L53)

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
