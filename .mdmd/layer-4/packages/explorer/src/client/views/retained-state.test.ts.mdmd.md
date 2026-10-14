# packages/explorer/src/client/views/retained-state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/views/retained-state.test.ts
- Generated At: 2026-10-14T04:03:02.660Z

## Authored
### Purpose
Guards independent container release, subtree clearing and portable ordering of retained selections.

### Notes
The counterexamples include an independently opened child, similarly prefixed sibling directories, an outside pin that still needs a released file, repinning after release and stale shared-link entries. These assertions protect selection meaning rather than the tray’s DOM arrangement.

Introduced for the owner’s [October 14 pin-management request](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-13.1.record.md#turn-11--pin-management-approved-ancestor-disclosure-and-directory-hubs).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](../persistence/compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`compressed-url-state.scrubSnapshot`](../persistence/compressed-url-state.ts.mdmd.md#symbol-scrubsnapshot)
- [`pin-state.EMPTY_PIN_SET`](./pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.addPin`](./pin-state.ts.mdmd.md#symbol-addpin)
- [`pin-state.getVisibleConnections`](./pin-state.ts.mdmd.md#symbol-getvisibleconnections)
- [`retained-state.RetainedState`](./retained-state.ts.mdmd.md#symbol-retainedstate)
- [`retained-state.clearRetainedDirectory`](./retained-state.ts.mdmd.md#symbol-clearretaineddirectory)
- [`retained-state.reconcileRetained`](./retained-state.ts.mdmd.md#symbol-reconcileretained)
- [`retained-state.releaseRetained`](./retained-state.ts.mdmd.md#symbol-releaseretained)
- [`retained-state.retainedItems`](./retained-state.ts.mdmd.md#symbol-retaineditems)
- [`retained-state.retainedKey`](./retained-state.ts.mdmd.md#symbol-retainedkey)
- [`retained-state.subjectAfterRelease`](./retained-state.ts.mdmd.md#symbol-subjectafterrelease)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
