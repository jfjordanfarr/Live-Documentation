# `packages/explorer/src/client/views/webgl-support.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/webgl-support.ts`
- Generated At: 2026-11-21T03:33:19.695Z

## Authored
### Purpose
Whether this browser can draw the 3D map, asked once before any view asks for WebGL, and what a request for a perspective becomes where it cannot: the same subject in the 2D map, with the person's remembered choice of 3D left for a browser that draws it. [`index.ts`](../index.ts.mdmd.md) reads it at the page's start, in a change of perspective, on Back and Forward, and for the 3D control's state. The rule it serves is in [Interaction and Accessibility](../../../../../../../.mdmd/layer-2/design-system/interaction-and-accessibility.mdmd.md), section 10.2.

### Notes
- Made on November 21, 2026. The root's probe that day launched Chromium with `--disable-3d-apis`, as a policy or a driver's blocklist does, and found a link to the 3D map a dead page: "The Explorer stopped" with Three's "Error creating WebGL context." over an empty map, while the 2D map of the same subject worked ([finding 3](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/weak-machine/README.md)). The owner means to show the tool on a VM of unknown graphics: "We want this to be able to run on absolute garbage" ([Turn 1 of the November 21 record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/2026-11-21.1.record.md#turn-1)).
- The question is asked with the attributes `SpatialRenderer` gives Three (`antialias`, `alpha`) of a WebGL 2 context, the only kind Three r186 asks for, and the context is let go at once through `WEBGL_lose_context`, since a browser holds only a few at a time.
- Asked once per page: a context lost later in a session (`webglcontextlost`) is not this module's. Three stops drawing on it and draws again when the browser restores it ([`forceGraphBatches.ts`](forceGraphBatches.ts.mdmd.md) draws the picture afresh on `webglcontextrestored`); one never restored leaves the 3D map blank.
- `WEBGL_REFUSED` is the one sentence that says why, used by the 3D control and by Tuning's 3D Layout group ([`tuning.ts`](../panels/tuning.ts.mdmd.md)). It first read "…which this browser has turned off"; the root changed it the same day to "does not offer", since a browser may simply have no WebGL to give.
- The two decisions are pure functions beside the one impure question, so that [the unit test](webgl-support.test.ts.mdmd.md) holds them without a browser; the page's behaviour is held by [the browser regression](../../../../../tests/e2e/webgl-refused.spec.ts.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `WEBGL_REFUSED` {#symbol-webgl_refused}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L23)

##### `WEBGL_REFUSED` — Summary
Why 3D is not offered, said by the 3D control and by Tuning's 3D layout as their tooltip and accessible description.
"Does not offer" rather than "has turned off": a browser may refuse WebGL by a policy, a driver on its blocklist or a
machine with no graphics at all, and the sentence should not blame it for the last (the root's correction, 2026-11-21).

#### `CanvasSource` {#symbol-canvassource}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L29)

##### `CanvasSource` — Summary
Something that hands out a canvas, so that the question can be asked of a stand-in.

#### `drawsWebgl` {#symbol-drawswebgl}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L32)
- Parameters: `canvas`: [`CanvasSource`](#symbol-canvassource)

##### `drawsWebgl` — Summary
Whether a canvas from this source gives the 3D map's context; a refusal, by null or by a throw, is a no.

#### `webglOffered` {#symbol-webgloffered}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L47)

##### `webglOffered` — Summary
Whether this browser draws the 3D map, asked of a fresh canvas the first time and remembered for the page's life.

#### `perspectiveShown` {#symbol-perspectiveshown}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L53)
- Returns: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)
- Parameters: `requested`: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)

##### `perspectiveShown` — Summary
The perspective shown for one requested: the request, unless it is 3D and the browser cannot draw it.

#### `perspectiveRemembered` {#symbol-perspectiveremembered}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/webgl-support.ts#L61)
- Returns: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)
- Parameters: `shown`: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective); `before`: [`LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective)

##### `perspectiveRemembered` — Summary
The perspective remembered for the next visit: the one shown where both can be drawn, and where 3D cannot, the one
remembered before, so that a person who chose 3D still arrives in it on a browser that draws it.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalMapPerspective`](../types.ts.mdmd.md#symbol-localmapperspective) (type-only)
<!-- LIVE-DOC:END Dependencies -->
