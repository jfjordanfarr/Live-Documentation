# Pins, hover and two name-click actions

Historical prototype record, November 3, 2026. Requested in [Turns 5–6](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-5), following the [four pin-policy comparison](../pinned-reading/README.md). This updates the ignored preview at `dist/explorer/probes/pinned-reading/`; the runnable page and editable source remain disposable. No production reader or layout has changed.

## What the owner selected

A file pin initially opens the file description and all symbol descriptions. If ordinary use is too noisy, file-description-only is the explicit fallback. Both hover targets remain: a symbol row reveals its description, and the card's non-symbol area reveals its file description. The owner questions click-to-modal and requests both proposed name-click actions for comparison. Neither name-click behavior nor symbol-pin-plus-file context has been chosen.

## The comparison

**Name click → Toggle description** holds that item's text open independently of pins. Clicking a hover preview keeps it open; clicking again closes it. Text opened by a pin can also be closed separately without releasing the pin. A fresh hover can still preview that closed text. A fresh pin action restores that file to the selected pin rules.

**Name click → Pin / unpin** performs the native pin action. A file name toggles its whole-file pin. A symbol name narrows a whole-file pin, adds a symbol pin, or releases the existing symbol pin. Releasing the last symbol leaves a whole-file pin, which can open all descriptions. The pin icons perform these same actions in either mode.

Changing comparison rules clears separate reading choices and keeps the pins. Explicit reading, pin, case and rule choices survive sharing/reload; hover previews do not. The two alternatives can therefore be tried over the same retained subjects. Names no longer open a text modal. Help is an explicit nonmodal popover, and Open in Explorer carries the pins to the real map and its full reader. Missing descriptions add no placeholder space; in separate-reading mode their names explain the absence on hover/focus and have no reading action, while their pin controls still work.

## Hover and motion experiment

The root's proposed motion rule is a **card visit**: each description reached by deliberate hover remains open while the pointer moves within that card; after leaving, unheld previews fold away. Purpose can remain open while a later symbol is read in the same visit. Moving through gaps inside the symbol list does not trigger file Purpose. The preview uses a 300 ms intent delay and 160 ms exit grace. Keyboard focus reveals the same content; touch uses the explicit name/pin actions. Escape clears separate reading and previews, keeping the pins.

This is an experiment for the owner's eye, not their selection of hover timing or simultaneous previews. Keeping the earlier text open prevents it from collapsing above the next row the person is trying to reach. New preview targets require actual pointer movement; geometry-generated boundary events do not start a cascade. Cards grow downward from fixed origins. No permanent offsets or camera compensation accumulate. Wires use the real row anchors and redraw during the transition.

## What the pictures show

The native cards, exact symbol identities, pin state machine, Markdown renderer and connection geometry are reused. The twelve real-content cases, summary/full-comment control and both pin-policy axes remain available. The comparison still fixes the scope to the subject and one real provider/consumer where available. It does not reproduce the full map's neighborhood growth, directory layout, row folding or route planning; choosing a click behavior here does not establish those production journeys.

At 1440×960, the pathfinding card with all descriptions closed is about 801 px tall. A separate file-name reading click opens Purpose alone and makes it about 1,019 px tall. A file-name pin opens Purpose plus all 28 symbol summaries and makes it about 3,983 px tall. That is a useful pressure case for the selected default, not a decision to withdraw it. The owner can switch to file-only and compare without changing pins.

The separate-reading mode keeps retention quiet while the person reads, at the cost of a second state to understand. Pin-on-name reuses one existing state, but releasing a last symbol can turn one open comment into every comment. Hover visits avoid downward drift in the checked journeys while potentially accumulating several visible comments until exit. These remain tradeoffs for hands-on judgment.

| Picture | Interaction |
| --- | --- |
| [Name click holds file reading](file-name-read.png) | Start with no pins, hover the file name, click and leave. Purpose stays; pins remain empty. |
| [Name click pins the file](file-name-pin.png) | The same start and action under the other click mode. One whole-file pin opens 29 descriptions. |
| [Successive symbol hover](symbol-hover-visit.png) | Both similarly named Walk/walk descriptions stay open during the visit, with exact identities and native laces. |
| [Long comment to the next symbol](long-to-next-hover.png) | Moving down to the following row keeps the long explanation above it open. |
| [File hover](file-hover.png) | Non-symbol-area attention opens Purpose without pinning or opening symbol descriptions. |
| [Full structured comment](structured-symbol.png) | The C# method pinned through its name, with summary, parameters, exceptions and examples. |
| [Narrow hover visit](narrow-hover.png) | The same Walk/walk journey at 980×780; the map remains pannable. |

The [Gallery sheet](../../../Gallery/sheets/pathfind-name-click.png) places the two file-name actions side by side. All captures are from the built prototype and personally inspected by the root.

## Verification

The repeated-hover and interaction checks follow visual inspection. Eight actual Walk/walk hover visits returned to identical resting card rectangles, scroll position and scroll extent. Long-comment-to-following-row and stationary-pointer checks passed, as did file-versus-symbol hover targeting, independent reading and mode switching, native name-pin transitions, held descriptions surviving pointer exit, keyboard focus/Enter/Escape, sharing/reload, structured comments, the narrow view and actual touch taps in both modes. All 96 case/click/pin-policy combinations rendered and reversibly pinned without page or console errors.

The first content-matrix run exposed a mistaken test assumption: the estate client's file Purpose and selected method are undocumented, but the class has a Summary. The corrected check distinguishes all three rather than hiding the class's description; the complete private check then passed. The [session record](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-6) retains the failure and corrected results. No product code or test gate was changed for this prototype.

## Sharing question raised during the comparison

In [Turn 7](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-7), the owner asks whether a colleague might need a shared view with a fully expanded unpinned card, or with pins retained but descriptions hidden. The root's examples are a walkthrough reading an already-visible provider without retaining its whole neighborhood, and a dependency overview with pinned subjects but folded prose. The root recommends making explicit reading choices independently shareable, with pin-driven expansion as the default action and hover transient. This is a recommendation, not an owner-selected contract.

The prototype's per-item reading overrides already survive sharing independently of pins; a one-action whole-card expand/fold control is not present. The production design must also decide how an explicitly open unpinned card stays visible if it would otherwise fall outside the restored scope. Keeping that card available for reading must not silently imply a whole-neighborhood pin. Neither this visibility rule nor the final name-click action is settled here.
