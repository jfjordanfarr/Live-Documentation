# Pin-driven descriptions

Historical design probe, November 3, 2026. Requested in [Turn 4](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-4). This is a disposable comparison under the ignored Explorer output, not a selected product behavior.

The owner reports cumulative downward drift in the previous attention proposal and finds its presentation rough beside the native 2D map. [Their supplied screenshot](owner-hover-drift.png) is copied unchanged from the attachment and is evidence of that report. They accept hover expansion as an idea and ask for another throwaway in which pins expand descriptions, with both rules left open.

## The four combinations

| File pin | Symbol pin |
| --- | --- |
| File description | Symbol description |
| File description | Symbol and file descriptions |
| File and all symbol descriptions | Symbol description |
| File and all symbol descriptions | Symbol and file descriptions |

The two controls change independently over the same case and pin set. A third control compares summaries with full structured symbol documentation; the file description is its authored Purpose. Names open a reader for the full documentation, including Notes. The file-click-to-expand-all suggestion remains a separate open idea.

## Implementation and scope

The preview imports the real [card renderer](../../../../packages/explorer/src/client/views/localView/card-factory.ts), [pin state machine](../../../../packages/explorer/src/client/views/pin-state.ts), [connection geometry](../../../../packages/explorer/src/client/views/connection-geometry.ts), graph projection and Markdown renderer. It uses the current native theme/card/Local Map styles, with reading-slot layout and modest font/spacing adjustments. Existing pin semantics are preserved: a whole-file pin narrows to a symbol, and releasing the last symbol leaves a whole-file pin. The chip tray can release a pin completely. This distinction matters when a file pin is set to reveal every description.

Cards have fixed origins, and reading slots grow downward. Hover highlights actual references and does not control geometry in this comparison. This isolates the requested pin-policy question; it does not repair or choose the earlier hover-only design. The fixed scope is the chosen file with one actual provider and consumer where available, de-duplicated. Wires follow actual symbol anchors and update during slot transitions; self references use the native lace geometry. The full directory-aware layout and router are not reproduced here.

Twelve real-content cases cover the same short/long/absent/structured and file-shape pressures as the [earlier comparison](../reading-layouts/README.md#common-cases). Missing descriptions add no placeholder text or empty slots. Policy and pin state survive sharing/reload. The built page and its editable source live under ignored `dist/explorer/probes/pinned-reading/` while it is under review; neither is committed.

## Evaluation

The root inspected all four policy states at 1440×960, the file-context state at 980×780, the varied-case captures, full structured C# documentation and the last-symbol-release expansion. Initial inspection corrected content-width symbol rows (the native grid's centering had survived a switch to flex rows), replaced generic self-reference routes with native laces, added room below the empty-symbol label, and centred subjects that have no provider. No product source was edited.

All 48 case/policy combinations rendered without page errors. Eight complete Walk/walk pin cycles returned to the same pins, card rectangles, scroll position and scroll extent, with zero vertical drift. Five complete rounds through the four rules also returned to identical resting geometry and preserved the pins. Twelve hover round trips left the geometry unchanged; hover is wire attention in this comparison, not the rejected inline-hover implementation. Keyboard activation, actual touch taps, rule/pin reload, full structured text and absent descriptions passed focused browser checks. The final checks ran again after the last layout polish.

The selected uncommented C# method and its missing file description remain compact under all four rules. The 140 HTML IDs add no symbol descriptions, but the parent file's Purpose appears under the symbol-plus-file rule. Large inventories remain tall even without prose; the comparison does not implement the production view's row folding. Source-extracted paragraph breaks and literal documentation tags remain visible in some comments, as in the preceding probe.

Two tradeoffs are visible. Opening all symbol descriptions makes a whole-file selection considerably taller, and the existing last-symbol release can trigger that entire expansion: the recorded pathfinding example opens 29 descriptions (Purpose and 28 summaries). Adding the file description to a symbol pin gives context but moves the selected row down; in the Neighbours case the subject card grows from roughly 859 to 1,078 pixels. These observations do not select a policy. Continuous production layout, multiple surrounding cards and the separate hover-expansion/file-click questions still need their own design work.

## Retained pictures

| Picture | State |
| --- | --- |
| [File description / symbol description](file-description-symbol-description.png) | The minimal pair of disclosure rules, with two independent retained subjects. |
| [File description / symbol and file](file-description-symbol-context.png) | The same pins, adding the subject file's Purpose. |
| [File and all symbols / symbol description](file-all-symbol-description.png) | The same pins, opening all summaries on the whole-file provider. |
| [File and all symbols / symbol and file](file-all-symbol-context.png) | Both broader disclosure rules, still with identical pins. |
| [Last symbol released](last-symbol-release.png) | The existing pin transition leaves the subject pinned whole, opening 29 descriptions under the all-symbols rule. |
| [Descriptions absent](absent-descriptions.png) | No invented text or empty expansion for the selected C# method or missing file Purposes. |
| [Full symbol documentation](full-symbol-documentation.png) | Parameters, remarks, returns, exceptions and examples on the pinned C# method. |
| [Narrow viewport](narrow-viewport.png) | 980×780; the subject is readable and neighboring context can be reached by panning. |

The [Gallery sheet](../../../Gallery/sheets/pathfind-pinned-reading.png) places the four policy states together. The owner's [supplied drift screenshot](owner-hover-drift.png) remains the evidence of the previous prototype's failure. The policy comparison is ready for the owner's hands-on judgment; it is not a shipped reading design.
