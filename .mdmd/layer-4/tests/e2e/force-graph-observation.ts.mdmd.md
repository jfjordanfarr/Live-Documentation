# tests/e2e/force-graph-observation.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-observation.ts
- Generated At: 2026-10-22T16:47:58.224Z

## Authored
### Purpose
Observes the native Three.js meshes and camera used by the spatial-view browser regressions.

### Notes
The helper listens to Three’s development-tool event inside the test page, then reads rendered node identity, material opacity, world and screen positions, the rendered sphere's radius, and link kinds, visibility and drawn ends: a link is a unit tube the library stands at its source and stretches toward its target, so its two ends in world space and its length say where it is drawn, and a line never positioned reads as length 1 at the origin (2026-10-16). This lets tests compare what reaches WebGL instead of accepting an application-maintained diagnostic as evidence of its own correctness. It introduces no product endpoint or browser-global application API. The original observation lived in the force-graph focus regression; directory-hub checks need the same measurements.

Introduced for the owner’s [October 14 pin-management request](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

Since 2026-10-18, for ticket C2 of [the change-over-time plan](../../../layer-3/change-over-time.mdmd.md#open-questions), the instrument also counts the frames drawn and notes on which frame the graph container said it was busy or settled (`engineActivity`), so that a spec can count the engine's ticks for a change from the outside, since the library ticks at most once per frame; and it can mark every line's object with a token and count the marks later (`markRenderedLinks`, `markedRenderedLinks`), which is how a spec shows that a membership change kept the lines' objects rather than rebuilding them. All of it reads the scene and the DOM; none of it reaches the Explorer's state.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `observeGraph` {#symbol-observegraph}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L32)
- Parameters: `page`: `Page`

##### `observeGraph` — Summary
Observe the meshes and camera actually sent to WebGL through Three's development-tool event, count the frames drawn, and
note on which frame the graph container said it was busy or settled, so that a spec can count the engine's ticks between
a change and its settle without reaching into the Explorer's state (2026-10-18).

#### `engineActivity` {#symbol-engineactivity}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L61)
- Parameters: `page`: `Page`

##### `engineActivity` — Summary
The frames drawn so far, and when the graph last became busy and last settled, by frame.

#### `markRenderedLinks` {#symbol-markrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L69)
- Parameters: `page`: `Page`

##### `markRenderedLinks` — Summary
Mark every rendered line's object with a token, so that a later count says how many objects a change kept; returns how many were marked.

#### `markedRenderedLinks` {#symbol-markedrenderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L84)
- Parameters: `page`: `Page`

##### `markedRenderedLinks` — Summary
How many rendered lines carry the token, beside how many there are.

#### `renderedNodes` {#symbol-renderednodes}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L99)
- Parameters: `page`: `Page`

##### `renderedNodes` — Summary
Read native node identity, world/screen coordinates, actual material opacity and the rendered sphere's radius.

#### `renderedLinks` {#symbol-renderedlinks}
- Type: function
- Source: [source](../../../../tests/e2e/force-graph-observation.ts#L144)
- Parameters: `page`: `Page`

##### `renderedLinks` — Summary
Read relationship kinds, visibility and where each line is drawn, without reaching into the Explorer's own state. A
link is a unit tube the library stands at its source, turns toward its target and stretches by `scale.z`; its drawn
ends are the tube's two ends in world space, and a line the library never positioned stays at the origin with length 1.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page` (type-only)
- `three` - `Camera`, `Mesh`, `Scene`, `WebGLRenderer` (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/change-over-time.mdmd.md`](../../../layer-3/change-over-time.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
