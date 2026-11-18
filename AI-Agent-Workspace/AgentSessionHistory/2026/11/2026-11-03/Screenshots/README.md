# Explorer review and documentation reconciliation — November 3, 2026

Historical review evidence from [the opening request](../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-1). Product implementation is the November 2–3 build at `e4f64a2f`; this pass corrects documentation and recommends work, without implementing a new interaction design. The main preview was rebuilt after the documentation corrections. The estate preview uses the same existing client. Every retained picture was opened and inspected by the root.

## What was tried

In a separate integrated browser page on the owner's existing port 8900: the Connections start, searching/pinning the main component's configuration file, Whole and return to Local, the 3D-to-2D transition, searching for Neighbours, collapsing navigation, Knowledge Sources and its Groups section, and World Map with Fit. The integrated viewport was 952×635. Its forwarding tool mangled query separators and a requested viewport size disagreed with its host; intact navigation and resetting to the actual viewport resolved those harness problems. They are not product findings.

Fresh standalone Chromium contexts then repeated the consequential 2D journeys at 1280×800 and 1440×960. These used ordinary UI clicks, the normal continuing layout search, and waits for layout and camera movement. The established browser helper supplied real pointer pans when a row was outside the frame. No page errors occurred. A final fresh context checked the corrected reader, the Connections start, and that opening History with nothing requested presses Whole and shows 914 of 914 filtered files. This is a focused review, not a full browser-suite run, a complete-history playback assessment or a new T3 performance trial.

## Findings

The 3D rings supply a useful promise before a click: another part of the graph is available here. The quiet archipelago distinguishes those opportunities from lone files. Whole and Local make the directory's overall shape available while preserving the working set. The owner's positive verdict on these interactions is recorded separately in the session's first turn; this review does not select new force or label defaults.

The most useful next journey is **find a symbol, see exactly what it connects to, read its explanation and keep exploring**. The small estate's 2D drawing already supports much of that well: consistent direction, readable file identities, and hover fading that makes a relationship easy to follow. Three problems stand between that picture and a reliable general experience:

1. **A symbol search can leave its destination clipped.** Starting at liveDocumentationConfig.ts, retain that file through search, then search for and choose Neighbours. At 1280×800, after settling, the selected symbol label starts at x=1089.41 and y=701.56, with width 231 and height 12: its right end and actions are beyond the viewport. At 952×635 the entire row was below the frame at y=672.37. The search succeeds in state but does not deliver a fully usable target. The large subject retains all rows, with unrelated ones muted, so locating the selected row also requires reading a tall card.
2. **Reading can conceal the relationship being read.** After panning to Neighbours and inspecting it, the 361-pixel reader overlays the right of the 1280-pixel map, concealing its card in the original journey. The useful definition is one short sentence, available only in the reader. The estate at 1440×960 keeps its smaller selected card visible beside the reader, showing that the problem depends on the journey and available space. The reader also repeats indistinguishable dependency targets. These observations support exploring on-map explanations; they do not decide removal of the reader or a change to the owner's overlay policy.
3. **Symbol identity still conflates distinct declarations.** The same-file disclosure repair is present, but Walk is lit with walk under the Neighbours pin. The Live Doc has separate `symbol-walk-interface` and `symbol-walk-function` anchors, and only the function takes Neighbours. The client normaliser discards kind suffixes and case. Correct identity is a prerequisite for making a symbol's description and connections authoritative on the card. This is the known November 2 closing finding, independently visible again here.

The edge shadow reads as a dark band across the lower map with a strip of content and controls beneath it. That makes the boundary ambiguous to my eye. The owner already questioned it yesterday; changing its appearance still needs their visual judgment.

Two scope details remain open. Whole opens the scan root in both representations, which means all filtered files in 3D but only the root's immediate level around retained branches in 2D. It also becomes a retained directory: in the configuration-file journey the search origin changed to Scan root and the destination said nothing connects to it. A visibility toggle influencing the path origin deserves explicit discussion when aligning scope semantics.

Knowledge Sources supplies a second, exact entrance to groups; its figures are explicitly the unfiltered scan, so its 53 lone files and the default 3D view's 52 do not conflict. The World Map remains a useful separate picture of the declared delivery shape, with many imagined pieces. A label click in the integrated page was intercepted by a road's hit path; this was not independently reproduced and is not treated as a confirmed product defect.

## Documentation error found through the reader

Five Live Docs from the groups implementation had a provenance sentence appended to their **Generated At** metadata. The reader displayed the sentence and raw markdown link as the date, even splitting the GENERATED label. The originating `f62408c1` diff confirms the misplaced addition. Each sentence was moved to that document's existing November 2 authored Notes bullet, keeping the timestamp and every `LIVE-DOC` region unchanged. No explanatory content was discarded.

The rebuilt reader now displays **Nov 2, 2026**, and the provenance sentence remains in Notes. All 915 mirror documents' timestamp values were checked; none remains malformed. This fixes a manual documentation-edit error. The parser currently accepts a string there; stronger timestamp validation is a separate potential correctness improvement, not a guarantee this pass added.

## Pictures

| Picture | What it establishes |
| --- | --- |
| [Connections start](connections-start-1280.png) | Quiet island seeds, expansion rings and bare lone files at 1280×800, after the picture settled. |
| [Search arrival](search-neighbours-1280.png) | Neighbours chosen through search with the configuration file retained; the label and actions extend beyond the right edge. |
| [Original reader](neighbours-details-1280.png) | After a pointer pan and inspection, the reader covers the selected card and displays the misplaced provenance in its date. |
| [Corrected reader](neighbours-details-corrected-1280.png) | After rebuilding, a fresh context restores the same pin set and inspects Neighbours: clean date, retained explanation and provenance. The camera was reached anew; this is not a pixel-matched layout comparison. |
| [Estate gateway](estate-gateway-1440.png) | The small, legible 2D baseline at 1440×960. |
| [Estate symbol inspection](estate-gateway-symbol-details-1440.png) | GetPaymentAsync and its connections remain visible beside the reader. The cold-generated sample has no authored Purpose; future on-map prose must handle missing descriptions without invented content or forced authoring. |

## Recommendation, not an implementation decision

First make a selected symbol a dependable 2D destination: preserve canonical identity, bring the acted-on row and its controls into the usable frame, and keep the relationship visible while reading. Then compare semantic-zoom treatments that reveal the existing file Purpose and symbol summaries on the map, with progressive disclosure for longer Notes. Try the real pathfind.ts card, a small estate card with no authored prose, a long documented symbol, several pins, zoom-out, and a return from 3D. The home of authored prose stays a separate design fork.

This advances the vision's single-folder understanding journey and its first two audiences. The installable package and cold-folder rehearsal remain the next substantial delivery milestone; this review does not silently demote them or reopen the whole 3D tuning effort.

## Later November 3: repairs and reading proposals

The identity and search-arrival findings above were repaired in the continuation of this session. The [three repair pictures](symbols/README.md) show the requested row in the usable map, distinct function/interface attention, and the function's own reader summary. The [four-layout reading comparison](../../Probes/2026-11-03/reading-layouts/README.md) then tries twelve real-content cases, including the owner's suggestion of descriptions on hover/tap. These later results leave this opening review intact as the evidence of what prompted the work.
