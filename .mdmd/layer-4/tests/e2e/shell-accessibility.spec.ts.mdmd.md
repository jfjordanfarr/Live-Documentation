# tests/e2e/shell-accessibility.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/shell-accessibility.spec.ts
- Generated At: 2026-11-19T00:33:10.078Z

## Authored
### Purpose
The page's frame, as a person meets it without a mouse or without sight. It holds that:

- the sidebar's and the search's words stand at 4.5:1, and the clear's glyph at 3:1;
- a fatal fault opens a reader that a keyboard can reach, headed "The Explorer stopped", and is announced;
- "Nothing found" is said in the page's status region;
- the page has a `main`, a `navigation` for the views, and a skip link that appears on focus;
- the search's clear keeps a 24 × 24 px target;
- Clear all's name holds its words, and the zoom buttons have tooltips;
- no heading in the reading dialog is smaller than its prose;
- the shortcut's hint names the platform's key, with `aria-keyshortcuts` to match;
- the loading line ends in `…`.

### Notes
- Written on 2026-11-19 with the mends it holds, findings of the design system's audit ([Turn 14 of the November 18 record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-14); [the pictures](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Screenshots/shell-accessibility/README.md)).
- All eight cases ran against the bundle built before the mends, and each failed at the defect it names:
  - the section label at 2.86:1;
  - the reader panel left `inert`;
  - no status region;
  - no `main`;
  - the clear at 18 px;
  - an h3 at 14 px over 15 px prose;
  - no `aria-keyshortcuts`;
  - "Loading...".

  All eight pass after the mends.
- The heading case lays one heading of each level in the dialog's prose and measures what the stylesheet gives it, so it does not depend on any document's headings.
- The Mac case overrides `navigator.platform` and `userAgentData` before the page loads.
- A colour's alpha is folded together with its element's opacity before it is measured, because [the contrast helper](contrast.ts.mdmd.md) reads colours only.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`contrast.AA_NON_TEXT`](./contrast.ts.mdmd.md#symbol-aa_non_text)
- [`contrast.AA_SMALL_TEXT`](./contrast.ts.mdmd.md#symbol-aa_small_text)
- [`contrast.backdrop`](./contrast.ts.mdmd.md#symbol-backdrop)
- [`contrast.contrastRatio`](./contrast.ts.mdmd.md#symbol-contrastratio)
- [`contrast.parseColour`](./contrast.ts.mdmd.md#symbol-parsecolour)
- [`search-bar.pathAddress`](./search-bar.ts.mdmd.md#symbol-pathaddress)
<!-- LIVE-DOC:END Dependencies -->
