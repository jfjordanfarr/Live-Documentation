# packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/membraneView/pin-layout.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-membraneview-pin-layout-test-ts
- Generated At: 2026-03-26T19:37:25.290Z

## Authored
### Purpose

Vitest unit tests for the pin-layout dependency-flow engine, covering topological column assignment, membrane grouping, LCA computation, and ancestor chain construction.

### Notes

- Created in [Dev Day 80](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md) with initial layout tests; LCA and ancestor chain tests added in [Dev Day 81](../../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-24.1.md)
- 28 tests organized in three describe blocks: `computePinLayout` (integration — column assignment, multi-node, inter-pinned ordering, LCA integration), `computeLCA` (standalone — empty, single, shared prefix, cross-directory), `buildAncestorChain` (standalone — empty, single segment, multi-segment)
- Uses a `makeNode` helper that populates both `codeRelativePath` and `docRelativePath` to match the dual-path architecture discovered during this implementation
- Test helper `addPin` creates pin state entries; `EMPTY_PIN_SET` provides the base case

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-26T19:37:25.290Z","inputHash":"24f378e8fa5326c0"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pin-layout.buildAncestorChain`](./pin-layout.ts.mdmd.md#symbol-buildancestorchain)
- [`pin-layout.computeDirectoryBands`](./pin-layout.ts.mdmd.md#symbol-computedirectorybands)
- [`pin-layout.computeLCA`](./pin-layout.ts.mdmd.md#symbol-computelca)
- [`pin-layout.computePinLayout`](./pin-layout.ts.mdmd.md#symbol-computepinlayout)
- [`pin-layout.parentDirectory`](./pin-layout.ts.mdmd.md#symbol-parentdirectory)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set) (type-only)
- [`pin-state.PinSet`](./pin-state.ts.mdmd.md#symbol-pinset) (type-only)
- [`pin-state.addPin`](./pin-state.ts.mdmd.md#symbol-addpin) (type-only)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client/views: [symbolAnchors.ts](../symbolAnchors.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [pin-layout.ts](./pin-layout.ts.mdmd.md), [pin-state.ts](./pin-state.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
