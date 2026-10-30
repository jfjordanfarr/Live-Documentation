# tests/e2e/tuning.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/tuning.spec.ts
- Generated At: 2026-10-30T16:33:54.231Z

## Authored
### Purpose
Checks the Explorer's Tuning block in the built page at 1280×800, the size the remediation checklist names: what a person can find, read and use there.

### Notes
- Written on 2026-10-30 with the remediation of the Tuning block. Its first check is that every control's sentence reaches the page as the control's and its label's tooltip and as an `aria-describedby` description that is drawn nowhere and stands outside the label, so that the sentence never joins the control's accessible name ([the owner's rule of that day](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3)).
- Its second check is the 3D layout's grouping of 2026-10-30: three groups named Forces, Spacing and Appearance, each open, holding exactly the levers listed in `SPATIAL_GROUPS` in that order and no lever left outside them, and a lever that still moves its readout. It runs over the estate sample, whose 3D picture settles in seconds where this repository's takes about twenty.
- Its third check is the rest of that day's remediation: the legend stands before Tuning in the sidebar, and the Export control, which read at 16 pixels beside the block's 11, now has the labels' and selects' type size, all three inheriting the one size the block sets.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
<!-- LIVE-DOC:END Dependencies -->
