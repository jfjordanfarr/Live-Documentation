# `packages/explorer/src/client/views/localView/reading-direction.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/reading-direction.test.ts`
- Generated At: 2026-11-22T05:00:50.651Z

## Authored
### Purpose
Holds the mapping between the layout's across and the page's to its promise: a box read from a mirrored page comes back as its reflection with start still before end, what offers still stands before what uses, and showing a span undoes reading it.

### Notes
- Written 2026-11-22 with the module. The cases were written after the functions; each was then seen failing against a mapping broken for it (the reading inverted, the origin added, start and end exchanged, the reflection left out of the reading and of the showing). The picture's own rule, that a mirrored map draws every use-dot on the right and every wire from blue to green, is held in the browser by `tests/e2e/local-map-mirror.spec.ts` and was first measured in [the matched pairs](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Screenshots/mirror/README.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`reading-direction.isMirrored`](./reading-direction.ts.mdmd.md#symbol-ismirrored)
- [`reading-direction.layoutEndAt`](./reading-direction.ts.mdmd.md#symbol-layoutendat)
- [`reading-direction.shownSpan`](./reading-direction.ts.mdmd.md#symbol-shownspan)
- [`reading-direction.spanInLayout`](./reading-direction.ts.mdmd.md#symbol-spaninlayout)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
