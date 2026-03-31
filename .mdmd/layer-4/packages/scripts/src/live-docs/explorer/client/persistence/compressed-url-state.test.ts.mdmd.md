# packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/persistence/compressed-url-state.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-persistence-compressed-url-state-test-ts
- Generated At: 2026-03-31T20:36:02.871Z

## Authored
### Purpose

Unit tests for the lz-string URL state compression module, verifying round-trip fidelity, version field preservation, graceful handling of unknown versions and corrupt input, and payload compactness.

### Notes

- Created alongside `compressed-url-state.ts` during Step 9 of the Membrane Map implementation on [Dev Day 80](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md). 19 tests covering `snapshotToPayload`, `payloadToSnapshot`, `compressSnapshot`, and `decompressSnapshot`.
- Tests are structured around the pure-function boundary: `snapshotToPayload`/`payloadToSnapshot` tests verify field inclusion/omission logic and defaults; `compressSnapshot`/`decompressSnapshot` tests verify lz-string round-trip integrity, corrupt input resilience, and that compressed output is shorter than raw JSON.
- The test file does not exercise `readUrlState`/`writeUrlState` (the DOM-touching boundary functions) because those require `window.location`, which is unavailable in vitest's Node environment. Browser-level testing is deferred to Playwright E2E.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-03-31T20:36:02.871Z","inputHash":"0f65585f7fb82cad"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.CompressedPayload`](./compressed-url-state.ts.mdmd.md#symbol-compressedpayload)
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`compressed-url-state.decompressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-decompresssnapshot)
- [`compressed-url-state.payloadToSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-payloadtosnapshot)
- [`compressed-url-state.scrubSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-scrubsnapshot)
- [`compressed-url-state.snapshotToPayload`](./compressed-url-state.ts.mdmd.md#symbol-snapshottopayload)
- [`pin-state.EMPTY_PIN_SET`](../views/membraneView/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.PinSet`](../views/membraneView/pin-state.ts.mdmd.md#symbol-pinset)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/persistence: [compressed-url-state.ts](./compressed-url-state.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [symbolAnchors.ts](../views/symbolAnchors.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/membraneView: [pin-state.ts](../views/membraneView/pin-state.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
