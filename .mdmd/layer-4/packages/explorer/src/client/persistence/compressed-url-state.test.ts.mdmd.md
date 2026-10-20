# packages/explorer/src/client/persistence/compressed-url-state.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/compressed-url-state.test.ts
- Generated At: 2026-10-20T14:51:18.393Z

## Authored
### Purpose

Protects portable Explorer state through explicit payload expectations, compression round trips, legacy-link migration and stale-target validation. The tests keep open evidence independent of the map subject, retained pins and requested path.

### Notes

- Created alongside `compressed-url-state.ts` during Step 9 of the Membrane Map implementation on [Dev Day 80](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/03/2026-03-23.1.md).
- Tests exercise the pure-function boundary: literal expected payload fields and defaults complement round trips, corrupt-input checks and passage through a real query string. A round trip alone cannot establish that a field has the intended meaning.
- The test file does not exercise `readUrlState`/`writeUrlState` (the DOM-touching boundary functions) because those require `window.location`, which is unavailable in vitest's Node environment. Browser-level testing is deferred to Playwright E2E.
- `d`, the opened directories (2026-10-08): sorted in the payload, absent when none, scrubbed to those with a live file under them.
- Evidence cases cover file symbols, the scan root, bundled-document sections, old and ambiguous payloads, explicit closure, and removed targets without disturbing valid exploration. The Internals endpoint must survive validation without becoming a public symbol or a whole-file pin. These protect the [October 20 inspection-state work](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-2).

## Generated
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
- [`pin-state.EMPTY_PIN_SET`](../views/pin-state.ts.mdmd.md#symbol-empty_pin_set)
- [`pin-state.INTERNAL_SYMBOL`](../views/pin-state.ts.mdmd.md#symbol-internal_symbol)
- [`pin-state.PinSet`](../views/pin-state.ts.mdmd.md#symbol-pinset)
- [`pin-state.addPin`](../views/pin-state.ts.mdmd.md#symbol-addpin)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
