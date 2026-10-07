# scripts/layout-lab/signals.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: scripts/layout-lab/signals.test.ts
- Generated At: 2026-10-07T21:57:25.102Z

## Authored
### Purpose
Tests of the lab's signals that need no scene: today the fragments count, which says how far the files' real directories are broken up in the columns when the membrane rule is relaxed.

### Notes
- Hand-made columns of paths: directories together count nothing, a directory split around another counts one run beyond its first, two split directories two, columns are summed, and files at the root share the empty directory (2026-10-07, the wall's lever).
- The two shape signals' cases (2026-10-07): steps summed top and bottom, nothing read from the root, a lane or a one-column membrane; the k-th pairing taken in the columns' order, a card of another membrane ignored, a card with no partner in the next column uncounted.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`branch-scene.SceneBox`](../../packages/explorer/src/client/views/localView/branch-scene.ts.mdmd.md#symbol-scenebox) (type-only)
- [`signals.fragmentsOf`](./signals.ts.mdmd.md#symbol-fragmentsof)
- [`signals.unevennessOf`](./signals.ts.mdmd.md#symbol-unevennessof)
- [`signals.unlevelOf`](./signals.ts.mdmd.md#symbol-unlevelof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
