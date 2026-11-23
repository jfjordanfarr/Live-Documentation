# `packages/explorer/src/client/views/localView/unconnected-symbols.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/views/localView/unconnected-symbols.test.ts`
- Generated At: 2026-11-23T14:55:16.758Z

## Authored
### Purpose
Holds which symbols count as unconnected (one used from another file, one that uses another file, one tied only within its file, one tied to nothing, a file with no symbols) and how each value of the Unconnected lever treats a row.

### Notes
- Written 2026-11-23 with `unconnected-symbols.ts`, for the trial of that day ([the day's record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/2026-11-23.1.record.md)). The within-file tie is a bare type name of the file's own, as the Explorer's graph carries one, so that the case exercises the same path the card's laces take.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`unconnected-symbols.unconnectedRow`](./unconnected-symbols.ts.mdmd.md#symbol-unconnectedrow-function)
- [`unconnected-symbols.unconnectedSymbols`](./unconnected-symbols.ts.mdmd.md#symbol-unconnectedsymbols)
- [`types.ExplorerLinkPayload`](../../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
