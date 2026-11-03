# On-map explanations: four layout proposals

Historical design probe, November 3, 2026. Requested in [Turn 2](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-2): several visual layout proposals across a wide variety of nodes and comment lengths, including absences. [Turn 3](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-3) adds descriptions on hover/tap and expanding/contracting cards. No candidate is a selected product design. The preceding identity and framing repairs are separate implementation work.

## Brief

Help a person read the explanation of the file or symbol they are examining without losing the nearby relationships. Compare the same real documentation under four treatments, keeping a way to return to the compact symbol view. Readability and orientation matter together; a design that works only for a short, fully documented file has not met the brief.

- **Expanded cards:** file Purpose above the symbols, every available symbol Summary beneath its row, and all structured documentation for the selected row. This gives a simultaneous explanatory picture at the cost of card height.
- **One open row:** file Purpose above the symbols, with only the chosen row's complete documentation opened in the card. This limits simultaneous prose but moves later rows when the open section changes.
- **Attached reading card:** the symbol card keeps its compact rows; the chosen explanation appears in a neighboring card attached to its row. Long text scrolls inside that card. This preserves the symbol list's geometry at the cost of horizontal room and a second reading surface.
- **On attention:** both file Purpose and symbol Summary start hidden. Hover previews the description; tapping holds it open, and tapping again closes it. A held description resists incidental hovering elsewhere. The pointer can enter the description without closing it. Keyboard focus previews, Enter holds, and Escape closes. Compare immediate hover with 300 ms intent. A separate Full documentation action opens structured sections or the optional file Notes. Missing descriptions cause no expansion.

The comparison page is disposable under the ignored Explorer output at `dist/explorer/probes/reading/`, served through the owner's port 8900. Its TypeScript/HTML/CSS builders are temporary and are not product modules. It reads the current main/estate bundle's canonical graph and uses the Explorer's own authored-section splitter and safe markdown renderer. No prose was invented for missing comments. References shown as context are one actual provider and one actual consumer, with the full counts stated; this is a card-layout comparison, not a replacement graph layout or a complete drawing of every relationship. The dashed attachment is a reading association, not a dependency.

The Detail control compares compact and reading disclosure while keeping text at reading size. It does not implement or validate a production camera/semantic-zoom transition. Attention is an alternative trigger to zoom: hovering can disclose at either width. Click a symbol or its Read selector to change the explanation; click the file title for Purpose; File notes makes the full authored Notes available. Open in Explorer returns to the real subject. Prose links are rendered as text in this visual probe. The prototype does not contain production pin actions: holding text open is a reading state, not a graph pin.

## Common cases

| Case | Source | Pressure |
| --- | --- | --- |
| Many rows, short definition | [pathfind.ts](../../../../packages/engine/src/live-docs/pathfind.ts) / Neighbours | A one-sentence description among 28 symbols. |
| Many rows, longer explanation | [pathfind.ts](../../../../packages/engine/src/live-docs/pathfind.ts) / walk (function) | A paragraph and distinction from the same-name interface. |
| Long structured comment | [discovery.ts](../../../../packages/engine/src/live-docs/discovery.ts) / discoverTargetFiles | Summary, remarks, parameters, returns, examples and links. |
| Documented type | [coreTypes.ts](../../../../packages/engine/src/live-docs/coreTypes.ts) / WorkspaceSymbolIndex | A code example and remarks among other types. |
| No selected comment | Estate [GatewayClient.cs](../../../../tests/integration/programs/csharp/estate/Portal/Services/GatewayClient.cs) / GetPaymentAsync | Neither authored Purpose nor selected method prose; retain a useful compact card. Other declarations in this file do have comments. |
| Rich C# method | [WidgetRegistry.cs](../../../../tests/integration/fixtures/csharp-advanced-symbols/src/Diagnostics/WidgetRegistry.cs) / TryRegister | Exceptions, parameters, examples and links. |
| Mixed Python coverage | Rosetta [models.py](../../../../tests/integration/programs/python/rosetta/src/models.py) / Record | Documented and undocumented rows together. |
| One public type | Local Map [controller.ts](../../../../packages/explorer/src/client/views/localView/controller.ts) / LocalViewController | A small public surface and long authored Notes. |
| No public symbols | Client [index.ts](../../../../packages/explorer/src/client/index.ts) | File Purpose/Notes without a symbol list. |
| Many undocumented IDs | Explorer [template.html](../../../../packages/explorer/src/shared/template.html) | 140 element IDs and sparse symbol prose. |
| Very long Notes | [forceGraphView.ts](../../../../packages/explorer/src/client/views/forceGraphView.ts) | Roughly 25,000 authored characters. |
| Configuration | [.live-docs.config.json](../../../../.live-docs.config.json) | Properties rather than functions, with sparse comments. |

## Root evaluation

Generated 48 private browser views: all twelve cases under all four modes, at 1440×960, with no page errors. The root personally inspected all twelve attention cases, the same short definition under the other three modes, the long structured case under One open row and Attached reading card, and four later interaction captures at 1280/952 pixels. The remaining generated views were not all inspected individually. Nine representative pictures are retained below; the others and the capture helper are disposable. This review ran while the product gate was stopped, before its final restart; the captures did not compete with its browser tests.

| Picture | What it makes visible |
| --- | --- |
| [Expanded cards](expanded.png) | Even a short definition is deep below the file Purpose and preceding descriptions. The complete 28-symbol card is about 4,695 pixels tall. |
| [One open row](one-row.png) | More rows remain near the chosen description, but the persistent file Purpose still dominates the top. About 1,412 pixels for the card. |
| [Attached reading card](attached.png) | The compact list remains stable. The extra reading column pushes the consumer close to the right edge even at 1440 pixels. |
| [Attention: short](attention-short.png) | A small description remains directly beneath its name, without a permanent file explanation above it. The hovered row stays in place. |
| [Attention: longer](attention-long.png) | A longer Summary already moves several rows below the viewport. Hiding other descriptions helps but does not bound the selected text. |
| [Attention: structured](attention-structured.png) | The Summary is compact; parameters, examples and remarks are behind an explicit Full documentation action. |
| [Attention: absent](attention-absent.png) | GetPaymentAsync has no description, so its hover leaves the card compact. The footer's old wording means the selected method, not every declaration in the file. |
| [Attention: file](attention-file.png) | A file without public symbols still has a useful Purpose disclosure. |
| [Attention: many IDs](attention-many-ids.png) | No prose is invented for the 140 HTML IDs. This complete inventory is still too tall to scan comfortably; production row folding remains necessary. |

The attention proposal is the root's preferred direction, not an owner decision. It gives the description a clear subject and avoids demanding simultaneous space for unrelated prose. A short hover delay seems preferable to immediate opening while crossing a dense list; this is a judgment to test with the owner, not a measured optimum. The root asked whether tap should hold the description on the map with a separate route to full Details, or retain today's tap-to-Details behavior.

Interaction checks after looking: a preview was still closed at 120 ms and open after the 300 ms intent; entering its text retained it; tapping held it after leaving; a second tap closed it. Moving from Neighbours to the longer walk (function) description preserved the newly hovered label with zero measured vertical displacement, as did the initial expansion. Immediate hover also opened. Keyboard file activation/Escape and actual touch taps opened/closed successfully. Full structured text remained available. These are checks of the disposable prototype, not production regression coverage.

The largest file Notes produced a card about 11,039 pixels tall when explicitly expanded; returning to the Summary restored about 559 pixels. That is evidence against unbounded full-document expansion on hover. At 952×635 the subject and short description remain readable, while some neighboring context falls outside the viewport. Production design must account for a usable map frame, row folding and nearby cards together.

## Limits and open choices

Keeping the acted-on row still can move the card's header and the rows above it. The probe compensates the card's position and redraws its two context wires; it does not settle a surrounding production graph or animate its full layout. It uses a short text fade rather than a validated geometry transition. A production version still needs a motion review with multiple expanded cards, real symbol wires, pins, pan/zoom and a pointer crossing rows. A still picture is not that review.

Some existing comments contain paragraph breaks inherited from source extraction and literal inline documentation tags. This probe shows the current canonical content through the existing renderer; it has not fixed those authoring/extraction issues. Full Notes and structured documentation need an explicit reading destination or a bounded expansion design. Card width changes, simultaneous held descriptions, and tap versus Details are not selected here.
