# packages/explorer/src/client/views/perspectiveTransition.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveTransition.ts
- Generated At: 2026-10-03T02:31:28.706Z

## Authored
### Purpose
Draws temporary correspondences between native Local Map cards and the Force Graph’s projected file positions.

### Notes
Keeps the source picture while the destination initializes, folds visible cards into named file tokens and moves them to the native projection. The reverse transition unfolds the cards. Copies are inert and carry no live IDs or selectors; reduced-motion preferences bypass the animation. It computes no alternative graph layout and changes no saved pins or canonical relationships.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SceneFile` {#symbol-scenefile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L2)

##### `SceneFile` — Summary
Screen-space correspondence between native cards and native force positions.

#### `ForceScene` {#symbol-forcescene}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L12)

##### `ForceScene` — Summary
A frozen projection of the native force scene, without introducing another layout.

#### `captureCards` {#symbol-capturecards}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L28)
- Returns: `CardSnapshot`[]

##### `captureCards` — Summary
Capture the visible native cards before switching their container off.

#### `animatePerspective` {#symbol-animateperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L48)
- Parameters: `cards`: `CardSnapshot`[]; `graph`: [`ForceScene`](#symbol-forcescene); `viewport`: `DOMRect`

##### `animatePerspective` — Summary
Fold cards to named file tokens, then rearrange those tokens to the native
projection. Reverse the same sequence on approach. Canonical edges and pins
are not changed by this temporary, non-interactive drawing.

#### `holdPerspective` {#symbol-holdperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L132)

##### `holdPerspective` — Summary
Hold the source picture while the destination renderer produces its first frame.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
