# packages/engine/src/live-docs/history/directories.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/engine/src/live-docs/history/directories.ts
- Generated At: 2026-10-22T16:47:53.133Z

## Authored
### Purpose
The directories a step renamed whole, derived from the file renames git infers, so that the CLI can say "renamed whole" and the picture can keep a hub's object under its new name (scenario 3 of [the plan](../../../../../../../.mdmd/layer-3/change-over-time.mdmd.md)).

### Notes
- Written 2026-10-17 for C1. The rule is git's own for detecting a directory's rename in a merge, as git's documentation states it (`Documentation/technical/directory-rename-detection.adoc` in git's source, read 2026-10-17): a directory that still exists is not renamed, and when renames split a directory the target with the most renames wins. One condition is the plan's: a directory that already held files is never another's new name, since a merge into it is the files' renames and the merged directory's death (the probe found two, at `86a74a76` and `1e36b33e`). One is this module's: a tie names no winner, so a split with no clear destination is listed as the file renames it is.
- A fork held open for the owner: the plan's wording of the rule, "every surviving file at the same relative place under the new one", makes none of the three package renames of September 2026 whole, since each moved its manifests in place while flattening or splitting its sources (`packages/server/src/features/live-docs` into `packages/generator/src`; part of `packages/shared/src/tooling` into `scripts/`; `packages/scripts/src/live-docs/explorer` into `packages/explorer/src`). The hand reading of 2026-10-16 calls all three whole, and so does git's rule, which is why it is the one built; [history-renames.test.ts](../../../../../tests/integration/live-docs/history-renames.test.ts.mdmd.md) holds it to that reading.
- Every renamed directory is listed, its renamed subdirectories too: a subdirectory that did not move with its parent cannot be told by the parent's prefix from one that did (at `cad63bdd`, `packages/server/src` is not renamed while `packages/server/src/features/live-docs` becomes `packages/generator/src`).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `directoryRenames` {#symbol-directoryrenames}
- Type: function
- Source: [source](../../../../../../../packages/engine/src/live-docs/history/directories.ts#L38)
- Parameters: `before`: `Iterable`; `after`: `Iterable`; `renamed`: `ReadonlyArray`

##### `directoryRenames` — Summary
The directories renamed whole by a step, from the old path to the new,
sorted by the old path. Every renamed directory is listed, its renamed
subdirectories too.

##### `directoryRenames` — Parameters
- `after`: Every file path after the step.
- `before`: Every file path before the step.
- `renamed`: The files the version control says the step renamed, from the old path to the new.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
