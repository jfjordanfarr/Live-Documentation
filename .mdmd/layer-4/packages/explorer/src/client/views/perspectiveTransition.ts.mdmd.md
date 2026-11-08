# packages/explorer/src/client/views/perspectiveTransition.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/perspectiveTransition.ts
- Generated At: 2026-11-08T06:36:56.908Z

## Authored
### Purpose
Draws temporary correspondences between native Local Map cards and the Force Graph’s projected file positions.

### Notes
Keeps the source picture while the destination initializes. Captures measured cards (copying those the frame shows), sampled native SVG symbol curves and directory shells, each shell with the membrane's outline drawn inside it and its label (the outline since 2026-10-06, when the directory's element stopped drawing itself). Curves gather by file pair as cards fold into named points; only then do the points move to the native force projection. Directory shells disappear from the scan root inward, and return from the direct directories outward on the reverse journey. Geometry and phases live in the pure companion module. Copies are inert and carry no live control hooks; reduced-motion preferences bypass the animation. It computes no alternative graph layout and changes no saved pins or canonical relationships.

Frozen appearance includes every computed property, including SVG styles and inherited custom properties. The copy reads the native property count once, obtains each name and value by index, and assigns one declaration block through `cssText`. Live selectors and control hooks are removed before that write, avoiding serialization of the newly expanded style just to enumerate attributes. These choices reduce repeated CSSOM calls without guessing which properties matter or changing the transition's geometry. A `display:none` subtree stops at an inert hidden shell, since it contributes no layout or pixels to the snapshot. `visibility:hidden` and `opacity:0` still occupy layout and retain the full copy.

Since 2026-11-07 the switch costs the page's main thread a fraction of what it did: on this repository's picture pinned on one file a press of 2D had blocked the page for about 10 s and a press of 3D for about 15 s ([the switch-cost probe](../../../../../../../AI-Agent-Workspace/Probes/2026-11-07/switch-cost/README.md), whose dated section has the numbers before and after), the owner's standard being that the browser must never ask whether to kill the page. Four causes went. The hold copied the whole source surface, every computed property of every element; it now keeps the source surface itself drawn over the destination (`perspective-held` in `local.css`), since an inactive view is laid out and drawn, only transparent; on the way to 2D the copy had never been seen at all, the 2D map being ready at once and the cover going in the same task. The capture copied every card of the 2D map; it now copies only the cards whose boxes meet the transition's frame (the destination's box), since a card is drawn only inside its own box while it folds, shrinking toward its title, and has gone before its token moves, so a card outside the frame was never seen; and within a copied card, and within a directory's outline and label, a block box the frame (grown by 64 px) does not meet is copied without its contents, keeping its declared size and so its place, since a pinned file's card of a hundred rows had cost a third of a second for rows below the frame. A directory band outside the frame stands in the layer as an empty box of its size, keeping its identity and depth. The wires' samples are read from their path data (`perspectiveGeometry.ts`) instead of the browser's `getPointAtLength`. And the cards' copies that remain are made in slices of 16 ms, each a task of its own, between which the page answers input and draws, while the source picture is held still: every place, wire and shell is read at the press, and the transition starts when the destination has drawn and the copies are done (`LocalCapture.copied`); on the way to 2D the 3D picture is held while the map's cards are copied. Every card's token and name still travel, every wire and shell is captured, and the transition's geometry and timing are unchanged. The switch's parts are measured on the page's timeline as `live-docs:switch-*` and `live-docs:capture-*`. On 2026-11-08 the frames of the transition taken before and after ([switch motion](../../../../../../../AI-Agent-Workspace/Screenshots/2026-11-08/switch-motion/README.md)) showed the same picture at the same times; the transition's first frame follows its start within a frame here, where before the fix it came 4.6 s late on the way to 2D, the page laying out its copy of every element of the map. Since then a transparent cover over the views' room takes the pointer while a surface is held, which the old inert cover never did, and the 2D map's keys are held back while its cards are copied, rather than the map being made inert, which recomputed the style of every element of it twice; under reduced motion no card is copied, since there is no transition to draw one in; a card copied in slices is read after its view was made inert, so the copy records the live picture's `interactivity`; and a slice is as long as the page was away since the last, between 16 and 100 ms, since slices of 16 ms between the 3D picture's slow software frames had kept the transition waiting for seconds.

The [November 2 exploration pass](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/11/Summarized/2026-11-01.1.SUMMARIZED.md#turn-8) includes closed directory cards with their actual Structure hub identities and permits animations with only directory shells or independent pins, without selecting a file. A closed folder with no sphere counterpart in Connections fades as a whole card; it does not invent a floating name. The view reveals existing in-scope counterparts before the handoff, so the animation lands on real submitted spheres.


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
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L49)

##### `LocalScene` — Summary
Native reading geometry, captured before the view is hidden or its camera changes.

#### `LocalCapture` {#symbol-localcapture}
- Type: interface
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L56)

##### `LocalCapture` — Summary
A capture of the 2D map: its scene, complete once `copied` resolves, the cards' copies made a slice at a time.

#### `captureLocalScene` {#symbol-capturelocalscene}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L80)
- Returns: [`LocalCapture`](#symbol-localcapture)
- Parameters: `frame`: `DOMRect`

##### `captureLocalScene` — Summary
Capture native cards, rendered symbol curves and directory shells before hiding their view. Every place, every wire
and every shell is read at once, while the picture stands as it was pressed; the cards' copies, the costly part, are
made in slices of the page's main thread between which it answers input and draws, while the caller holds the
picture still ({@link holdPerspective}), and `copied` says when they are done (2026-11-07: made at once, they had held
the page for seconds).

#### `animatePerspective` {#symbol-animateperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L176)
- Parameters: `scene`: [`LocalScene`](#symbol-localscene); `graph`: [`ForceScene`](#symbol-forcescene); `viewport`: `DOMRect`

##### `animatePerspective` — Summary
Fold cards to named file tokens, then rearrange those tokens to the native
projection. Reverse the same sequence on approach. Canonical edges and pins
are not changed by this temporary, non-interactive drawing.

#### `holdPerspective` {#symbol-holdperspective}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/perspectiveTransition.ts#L320)

##### `holdPerspective` — Summary
Hold the source picture while the destination renderer produces its first frame: the source surface itself stays
drawn, as it stands, over the destination until released (`perspective-held` in local.css). An inactive view is laid
out and drawn, only transparent, so nothing need be copied; until 2026-11-07 the hold was a copy of the whole surface
with every computed property of every element, several seconds of the page's main thread on this repository's
pictures, and on the way to 2D a copy never seen, since the 2D map is ready at once and the cover went in the same
task. The surface is inert and hidden from assistive technology while inactive, as the copy was, and a transparent
cover over the views' room takes the pointer while it is held, so that a click meant for the held picture reaches
neither it nor the destination drawing beneath it.

The surface keeps the size and border it was drawn with while held, since leaving the 2D map takes away the room its
zoom controls kept below it, which would otherwise grow the held map into that room.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`forceGraphData.directoryNodeId`](./forceGraphData.ts.mdmd.md#symbol-directorynodeid)
- [`perspectiveGeometry.TransitionPoint`](./perspectiveGeometry.ts.mdmd.md#symbol-transitionpoint)
- [`perspectiveGeometry.directoryOpacity`](./perspectiveGeometry.ts.mdmd.md#symbol-directoryopacity)
- [`perspectiveGeometry.gatherWire`](./perspectiveGeometry.ts.mdmd.md#symbol-gatherwire)
- [`perspectiveGeometry.outlineLength`](./perspectiveGeometry.ts.mdmd.md#symbol-outlinelength)
- [`perspectiveGeometry.pathOutline`](./perspectiveGeometry.ts.mdmd.md#symbol-pathoutline)
- [`perspectiveGeometry.perspectivePhases`](./perspectiveGeometry.ts.mdmd.md#symbol-perspectivephases)
- [`perspectiveGeometry.polygonOutline`](./perspectiveGeometry.ts.mdmd.md#symbol-polygonoutline)
- [`perspectiveGeometry.sampleOutline`](./perspectiveGeometry.ts.mdmd.md#symbol-sampleoutline)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
