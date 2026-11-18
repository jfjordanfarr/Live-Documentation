# Reading across zoom

Historical design comparison, November 3, 2026. Follows [Turns 8–13](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-8): authorization to begin integrating on-map reading, faster/less-sticky hover feedback, the reminder to make the Detail Panel unnecessary, a possible explicit reader for overwhelming text, and the request for informed UI/UX guidance with visible alternatives. The [research note](../../../Research/2026-11-03-on-map-reading-ux.md) separates primary guidance from the root's design hypotheses.

**Owner feedback, November 4:** the unwrap threshold did not meet the need. [Turn 15](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-15--november-4) supplies a more concrete reference: a centered card that teaches a typical subject before outward zoom reveals its neighbors. The [next comparison](../../2026-11-04/card-reference/README.md) starts from that composition. The numerical thresholds below remain this earlier experiment, not an adopted product rule.

The live page is under ignored `dist/explorer/probes/reading-zoom/`, beside the previous native-card comparison. Both name-click modes and all twelve real-content cases remain available. This is a small controlled comparison before selecting the unresolved production behavior; no production source has changed.

## Three treatments on the same content

| Treatment | What it tests | Expected cost |
| --- | --- | --- |
| Scale all text | Existing camera behavior applied to expanded prose. | Tiny paragraphs become texture and the expanded card still occupies much of the map. This is the baseline, not the root's recommendation. |
| Fold at overview | Hide prose at small scale, then restore intentional reading on zoom-in. | Card height and wire endpoints change, so continuity needs judgment in motion. |
| Fold + long-text reader | The same overview rule, with a bounded inline passage and an explicit full-text dialog. | Reading the full text temporarily takes attention away from the graph. Many ordinary comments can still make a tall card. |

Overview sets 45%; Reading size sets 100%. The slider and wheel cover the native 0.05–3 range; the background pans. Pins and explicit reading overrides stay unchanged when comparing treatments. The fold trial hides below 0.8 and returns at 0.95, using different thresholds to avoid flicker at a single boundary. These are prototype values, not selected product settings. Zoom choice and explicit reading travel in the URL; the camera's pan is not serialized by this probe.

The third treatment measures rendered prose height against a viewport-aware allowance. A visible Read full description action opens the complete symbol documentation. The file's book icon opens Purpose, all documented symbols and Notes, independently of pinning. No symbol text has its own scrollbars; the dialog has one ordinary reading surface, a close control, Escape and focus return. It opens only through an explicit action.

## What to compare by eye

Start with the same whole-file pin in the first case. At Overview, switch between Scale all text and Fold at overview. The latter reveals the entire symbol list and its connection pattern; the former preserves the expanded shape but its prose is too small to read. Return to Reading size and check that the chosen descriptions return.

Then choose Long structured documentation, Full symbol docs and Fold + long-text reader. Read the inline passage and its full text, close the dialog and continue from the same item. The root recommends this combination for further integration, subject to the production motion work.

| Capture | State |
| --- | --- |
| [Scaled prose](scale-overview.png) | Whole-file pin, 45%, 29 descriptions remain drawn. |
| [Folded overview](fold-overview.png) | Same file, pin and zoom; descriptions are temporarily hidden, symbols and pins remain. |
| [Bounded long comment](bounded-long-comment.png) | A structured comment at reading size with a discoverable full-text action. |
| [Explicit reader](long-comment-reader.png) | The complete comment, opened deliberately over the preserved map. |
| [Narrow inline view](narrow-long-comment.png) | The long-comment example at 980×780. |
| [Narrow reader](narrow-reader.png) | One reading scroll surface in the same narrow viewport. |

The [Gallery sheet](../../../Gallery/sheets/reading-zoom.png) places the overview and long-comment pairs together.

## Limits carried forward

The page reuses native cards, canonical graph content, exact symbol identities, pin transitions and connection geometry, but fixes the scope to the subject and one provider/consumer. It does not implement the production directory layout, row folding, continuing layout search or historical prose. Names still scale geometrically; this is a prose comparison, not a complete label hierarchy at distant zoom.

The earlier per-card hover visit remains in this comparison to isolate zoom and overflow. The owner's faster/less-sticky hover request is not repaired here. The production integration must address it without the original accumulated-offset drift. Likewise, the file-level reader provides access to all text but does not decide how to control aggregate card height when many ordinary comments are open.

The text-only click/zoom questions were set aside after the owner asked for visible alternatives and more design guidance. Neither name-click mode nor numerical zoom/overflow threshold is selected by this comparison. Intentional reading and retention remain separate; panel retirement remains the direction, with an explicit text dialog considered for overflow.

## Verification

The root inspected the overview comparison, inline long passage and modal at 1440×960, and both long-text surfaces at 980×780 before writing the browser checks. Eight overview/reading cycles returned to identical card geometry and reading/pin state. All 36 case/treatment round trips preserved pins and explicit reading, folding only in the two semantic treatments. Wheel reversibility and the different fold/restore thresholds passed focused checks. Sharing/reload, absence of nested text scrollbars, explicit modal opening, Tab/Shift+Tab containment, Escape/close and focus return passed the final run with zero page or console errors.

The first keyboard check found that Chromium's native dialog sequence passed focus to the document/body after the close button before cycling back. The final dialog explicitly cycles its controls in both directions; the full comparison check then passed. The failed private helper was terminated after verifying its process identity; its first identity check correctly refused to touch the unrelated shared-browser service. No product test gate was changed or rerun for this ignored prototype.

A later actual-touch check caught a second issue: a pinch beginning on a card was ignored by the background-drag guard (expected 2× zoom, observed 1×). Touch tracking now allows a two-finger pinch from the card while leaving single-finger activation independent and suppressing incidental pin clicks from the pinch. The focused touch rerun passed, including subsequent ordinary reader and pin taps. This gesture repair changes only the disposable comparison.
