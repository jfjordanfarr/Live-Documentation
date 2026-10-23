# tests/e2e/no-network.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/no-network.spec.ts
- Generated At: 2026-10-22T16:47:58.723Z

## Authored
### Purpose
Proves that the Explorer asks nothing of any site but its own: the owner's ask of 2025-12-14, "Tests proving that Live Documentation cannot and will not ever access the internet." Every request a page makes is watched from before its first script; one to another site fails the test and is aborted, and so does any refusal by the page's Content-Security-Policy, because a page that tries is a defect even when the policy stops it.

### Notes
- Written 2026-10-21 when the owner asked how a no-network rule could hold if a markdown file may carry a link ([Turn 11](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-11)), and approved the hardening "without losing functionality" ([Turn 12](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-20.1.record.md#turn-12)). The reader then passed a doc's raw HTML into the page, so an `<img>` in a doc fetched from the internet, and `?data=` accepted any address.
- The journeys walk this repository's bundle, the estate sample and the history sample through Knowledge Sources, the World Map where there is a board, the Local Map in 2D and 3D, a bundled doc in the reader and a moment of the history. The hostile cases serve the history sample with raw HTML, an outside image and links written into a file's authored section and a bundled doc, a free-text archetype with spaces, a step whose count is markup, and data or a history named on another site.
- The watch separates what the page asked from what reached the network. Chromium reports an image the policy blocked as a request that failed with `csp`, and it never reaches the network layer, where the route sits; a blocked `fetch` raises no request at all. The last test shows the policy refusing what code in the page might attempt, an outside image and fetch, an inline handler and an inline script, with nothing reaching the network.
- The allowed origin comes from Playwright’s configured `baseURL`, so an isolated verification server is still its own site. A different scheme, host or port remains another origin. The October 23 full run exposed the former hardcoded port by refusing the test page itself before its script loaded.
- A link to another site opens only when a person clicks it, and these tests never click one.
- Each case was seen to fail with its defence removed: the policy, the escaping, the archetype's class and the count's conversion.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`compressed-url-state.DEFAULT_SNAPSHOT`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-default_snapshot)
- [`compressed-url-state.compressSnapshot`](../../packages/explorer/src/client/persistence/compressed-url-state.ts.mdmd.md#symbol-compresssnapshot)
- [`types.InspectionTarget`](../../packages/explorer/src/client/types.ts.mdmd.md#symbol-inspectiontarget) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../layer-3/architectural-decisions.mdmd.md)
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
