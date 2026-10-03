# packages/explorer/src/client/views/zoomBarrier.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/zoomBarrier.ts
- Generated At: 2026-10-03T02:31:28.896Z

## Authored
### Purpose
Recognizes a deliberate second wheel gesture at the boundary between file inspection and connectivity exploration.

### Notes
The arrival gesture and its continuing momentum cannot switch views. A pause followed by another nudge confirms the crossing; reversing direction resets it. Wheel units normalize across pixel, line and page devices.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ZoomBarrier` {#symbol-zoombarrier}
- Type: class
- Source: [source](../../../../../../../packages/explorer/src/client/views/zoomBarrier.ts#L2)

##### `ZoomBarrier` — Summary
Deliberate wheel boundary between two stable perspectives, independent of rendering.

#### `wheelPixels` {#symbol-wheelpixels}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/views/zoomBarrier.ts#L31)

##### `wheelPixels` — Summary
Wheel units normalized to CSS pixels; a single huge event is still one gesture.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
