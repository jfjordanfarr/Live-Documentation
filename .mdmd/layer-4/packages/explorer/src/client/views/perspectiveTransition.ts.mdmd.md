# packages/explorer/src/client/views/perspectiveTransition.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveTransition.ts
- Generated At: 2026-11-02T06:07:17.451Z

## Authored
### Purpose
Draws temporary correspondences between native Local Map cards and the Force Graph’s projected file positions.

### Notes
Keeps the source picture while the destination initializes. Captures measured cards, sampled native SVG symbol curves and directory shells, each shell with the membrane's outline drawn inside it and its label (the outline since 2026-10-06, when the directory's element stopped drawing itself). Curves gather by file pair as cards fold into named points; only then do the points move to the native force projection. Directory shells disappear from the scan root inward, and return from the direct directories outward on the reverse journey. Geometry and phases live in the pure companion module. Copies are inert and carry no live control hooks; reduced-motion preferences bypass the animation. It computes no alternative graph layout and changes no saved pins or canonical relationships.

Frozen appearance includes every computed property, including SVG styles and inherited custom properties. The copy reads the native property count once, obtains each name and value by index, and assigns one declaration block through `cssText`. Live selectors and control hooks are removed before that write, avoiding serialization of the newly expanded style just to enumerate attributes. These choices reduce repeated CSSOM calls without guessing which properties matter or changing the transition's geometry. A `display:none` subtree stops at an inert hidden shell, since it contributes no layout or pixels to the snapshot. `visibility:hidden` and `opacity:0` still occupy layout and retain the full copy.

The [November 2 exploration pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-01.1.record.md#turn-8--continue-until-the-directory-exploration-journey-is-ready-for-new-users) includes closed directory cards with their actual Structure hub identities and permits animations with only directory shells or independent pins, without selecting a file. A closed folder with no sphere counterpart in Connections fades as a whole card; it does not invent a floating name. The view reveals existing in-scope counterparts before the handoff, so the animation lands on real submitted spheres.


The pin-only handoff uses the newest retained file as a visual anchor without making it the selected subject. This follows the T3 repeat that exposed a near-empty 2D arrival despite correct membership; the frame still settles afterward by the existing minimum-motion rule.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SceneFile` {#symbol-scenefile}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L5)

##### `SceneFile` — Summary
Screen-space correspondence between native cards and native force positions.

#### `ForceScene` {#symbol-forcescene}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L15)

##### `ForceScene` — Summary
A frozen projection of the native force scene, without introducing another layout.

#### `LocalScene` {#symbol-localscene}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L48)

##### `LocalScene` — Summary
Native reading geometry, captured before the view is hidden or its camera changes.

#### `captureLocalScene` {#symbol-capturelocalscene}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L55)
- Returns: [`LocalScene`](#symbol-localscene)

##### `captureLocalScene` — Summary
Capture native cards, rendered symbol curves and directory shells before hiding their view.

#### `animatePerspective` {#symbol-animateperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L106)
- Parameters: `scene`: [`LocalScene`](#symbol-localscene); `graph`: [`ForceScene`](#symbol-forcescene); `viewport`: `DOMRect`

##### `animatePerspective` — Summary
Fold cards to named file tokens, then rearrange those tokens to the native
projection. Reverse the same sequence on approach. Canonical edges and pins
are not changed by this temporary, non-interactive drawing.

#### `holdPerspective` {#symbol-holdperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L233)

##### `holdPerspective` — Summary
Hold the source picture while the destination renderer produces its first frame.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphData.directoryNodeId`](./forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`perspectiveGeometry.TransitionPoint`](./perspectiveGeometry.ts.mdmd.md#symbol-transitionpoint)
- [`perspectiveGeometry.directoryOpacity`](./perspectiveGeometry.ts.mdmd.md#symbol-directoryopacity)
- [`perspectiveGeometry.gatherWire`](./perspectiveGeometry.ts.mdmd.md#symbol-gatherwire)
- [`perspectiveGeometry.perspectivePhases`](./perspectiveGeometry.ts.mdmd.md#symbol-perspectivephases)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
