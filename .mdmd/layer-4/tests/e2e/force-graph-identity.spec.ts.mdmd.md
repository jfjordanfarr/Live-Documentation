# tests/e2e/force-graph-identity.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-identity.spec.ts
- Generated At: 2026-11-10T16:40:47.195Z

## Authored
### Purpose
Keep the 3D Local Map’s readable file and directory identities, neighbourhood framing and explicit Fit recovery usable in the built Explorer.

### Notes
Created after the October 23 root playtest. Main-repository and estate arrivals are checked against actual rendered sphere bounds; Portal is followed between layouts and through inspection. Text audits check collisions, clipping, reading size and direct viewport bounds, avoiding IntersectionObserver’s fractional rounding of a fully visible rectangle. Fit must recover the visible neighbourhood without changing the exploration. An unselected root must frame the estate without inventing pins. A compositor-pixel check catches an idle canvas cleared despite correct scene geometry; the draw count also confirms that an unchanged picture releases WebGL work.

The full repository gets one minute to reach stillness before identity and frame checks. [Measured software-rendered settling](../../../../AI-Agent-Workspace/Probes/2026-10-24/connections-tuning/performance-findings.md) exceeded the original 25-second setup allowance on October 24, including at the old sphere detail. The small estate retains its existing allowance; visibility, geometry and idle checks are unchanged.

Since 2026-10-31 an unselected arrival is the start's picture, the estate's most connected file and two hops around it, a part of the whole (discovery, [Turn 4 of the October 31 record](../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-31.1.record.md#turn-4)).

The ring-identity regression from [November 10, Turn 3](../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-10.1.record.md#turn-3) follows the ordinary estate journey with product-default motion and 2D search: open PaymentService in Structure, visit 2D and return, then choose Connections. Its exact nine independently observed names must remain visible and clear all five uploaded outer rings, including the rings whose own names are undisclosed, with a 0.1 CSS-pixel measurement-rounding allowance against the two-pixel clearance. It reads real ring geometry and instance matrices rather than label inputs, then opens and rewraps Gateway to check remembered placement against changed geometry. The case follows the root's matched visual review of Hub and Gateway labels falsely appearing to name other files' rings; it records raw geometry with each check.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
- [`still-picture.localMapSettled`](./still-picture.ts.mdmd.md#symbol-localmapsettled)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
