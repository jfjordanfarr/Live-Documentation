# packages/explorer/src/client/persistence/place.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/persistence/place.test.ts
- Generated At: 2026-10-02T21:07:39.046Z

## Authored
### Purpose
Protects the distinction between navigating to another Explorer place and editing the retained exploration within it. View, subject, Local Map representation, directories, path destination and open evidence can change the place; adding a pin does not.

### Notes
- Written on 2026-09-30 with Back and Forward ([Turn 16](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-29.2.SUMMARIZED.md#turn-16)). The original Membrane Map cases established why place identity must decode the shared parameter instead of comparing raw addresses; today's cases exercise the Local Map.
- Plain and compressed addresses are compared using the production parser and encoder. Cases distinguish path destinations from their retained starting pins, preserve old view-name migration, and ignore the data-file parameter.
- Reader cases hold the map subject fixed while opening, changing and closing evidence, distinguish file symbols and bundled-document fragments, and verify that pinning the inspected file remains the same place. They protect the [accepted evidence-history behavior](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/Summarized/2026-10-19.1.SUMMARIZED.md#turn-19); actual Back/Forward motion and focus belong to browser coverage.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`compressed-url-state.DEFAULT_SNAPSHOT`](./compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.UrlStateSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-urlstatesnapshot)
- [`compressed-url-state.compressSnapshot`](./compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`place.placeOf`](./place.ts.mdmd.md#symbol-placeof)
- [`pin-state.addPin`](../views/pin-state.ts.mdmd.md#symbol-addpin)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
