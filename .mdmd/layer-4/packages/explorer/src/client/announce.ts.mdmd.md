# `packages/explorer/src/client/announce.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/announce.ts`
- Generated At: 2026-11-19T21:10:12.804Z

## Authored
### Purpose
The page's one polite status region. `announce(words)` says a short sentence to a screen reader without moving focus, and `withdraw(words)` takes it back once it no longer holds. The region is `#page-status` in the [template](../shared/template.html.mdmd.md): visually hidden, with `role="status"`, `aria-live="polite"` and `aria-atomic="true"`.

### Notes
- Written on 2026-11-19 for WCAG 2.2 SC 4.1.3 (Status Messages), a finding of the design system's audit ([Turn 14 of the November 18 record](../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14)): nothing that happened on the page was announced. One region serves the whole page, so that no two views talk over each other from regions of their own.
- The region is emptied and the words written 50 ms later, so that the same sentence said twice is heard twice. `withdraw` cancels only its own words, pending or shown, and leaves another view's words alone.
- Its first user is the search's "Nothing found" ([search-field.ts](search/search-field.ts.mdmd.md)). The next users are in other builders' files:
  - the 3D map's "building", which refuses clicks without saying so;
  - the World Map's walkthrough.
- [The shell's accessibility spec](../../../../tests/e2e/shell-accessibility.spec.ts.mdmd.md) holds it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `announce` {#symbol-announce}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/announce.ts#L16)

##### `announce` — Summary
Say `words` in the page's status region, politely: after whatever the screen reader is saying now.

#### `withdraw` {#symbol-withdraw}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/announce.ts#L31)

##### `withdraw` — Summary
Take back `words` if they are what the region says or is about to say, so that it does not keep a stale sentence.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`template.page-status`](../shared/template.html.mdmd.md#symbol-page-status)
<!-- LIVE-DOC:END Dependencies -->
