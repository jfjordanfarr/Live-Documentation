# A centered card as the reading reference

Historical design probe, November 4, 2026. Requested by the owner's [class-sharing scenario](../../../ChatHistory/2026/11/2026-11-03.1.record.md#turn-15--november-4), following their rejection of the [earlier generic zoom threshold](../../2026-11-03/reading-zoom/README.md). The live page and editable source are disposable under ignored `dist/explorer/probes/card-reference/`. No production reading or layout behavior has changed.

## The brief

Compose a typical subject as a card in the trading/playing-card sense: an intelligible whole, framed to teach that subject before the viewer zooms outward to its neighbors. At this first view, clipping neighbors is acceptable. The owner describes 2D as learning by zooming out and 3D as learning by zooming in; future timed/shared journeys across them are separate ideas.

This establishes a **reference view**, a dependable visual place to understand and return to the subject. A percentage of an arbitrary canvas scale does not establish that. The probe measures the chosen card and available viewport, then derives its reading scale. Text is never shrunk to force the fit: the minimum reading scale is one. A card that genuinely exceeds the viewport begins at its top and keeps explicit full-text access.

## What the card carries

The main example is the estate's authored payment-service file: one C# class, three public symbols, recorded type relationships, file Purpose, and a class Summary. Its methods have no comments; their recorded parameter/return types still provide useful information. The card's hierarchy is identity, purpose, public interface and connection counts. Full symbol comments and Notes remain available through the explicit reader.

Every directly connected file in the loaded graph is present, with all induced references among those files. In the repository's fixture view this includes the expected-edge JSON files that genuinely reference the service. Counts say files/reference relationships, not runtime callers. The cold estate case uses its own bundle and has no authored file Purpose; the probe does not borrow it from the repository's separate scan.

The implementation reuses the native card factory, exact symbol identities, pin state machine, graph projection, Markdown renderer and connection geometry. It adds visible recorded types and compares portrait and wide compositions over identical content. The subject is still a file: the registry example explicitly identifies its two documented classes instead of silently pretending one file is always one class.

## Comparison and motion

Read card calibrates and centers the subject. Connections and Wider move outward to 55% and 28% of that reference; the wheel and slider allow intermediate views. These are trial stops, not production defaults. Prose folds/restores at trial ratios of 0.74/0.92 relative to the reference. The reference view is measured with its full current reading presentation, independently of the preceding overview state.

The card center is held while its descriptions fold, and a return derives the reading pose afresh. Links retain case, composition, deliberate reading, pins, normalized scale and the folded/read side of the hysteresis band. They frame the subject for the recipient's viewport; arbitrary pans, timed journeys and cross-perspective transitions are not serialized here.

Options retains both experimental name-click actions and summaries/full-comments comparison. The book and full-text actions use an explicit dialog, with no nested scrollbars in symbol text. The earlier sticky per-card hover policy remains under design. This is a fixed direct-neighbor scope, not the production membrane layout, continuing optimization or arbitrary hop-by-hop exploration.

## Retained pictures

| Capture | State |
| --- | --- |
| [Payment service, portrait](payment-portrait.png) | The whole documented card at its derived reading frame. |
| [Same facts, wide](payment-wide.png) | Wider composition of the same subject and pin. |
| [Connections](payment-connections.png) | Outward from the card reference, with prose folded. |
| [Wider context](payment-wider.png) | The complete direct-neighbor arrangement at a greater distance. |
| [Documented Processor](processor-wide.png) | A second single-class case, including longer summaries and recorded types. |
| [Cold scan](cold-scan.png) | The standalone estate's same class with no authored file Purpose; recorded types remain useful. |
| [Narrow payment card](payment-narrow.png) | The same portrait at 980×780, without shrinking text. |
| [Two-class pressure](two-class-pressure.png) | A multi-class file that exceeds a single reading frame. |

The [Gallery sheet](../../../Gallery/sheets/payment-card-reference.png) places the two compositions and two outward views together.

## Evaluation

Visual inspection found that the first toolbar consumed too much of the reading frame. Moving secondary controls into Options and the pin tray into the footer let the three-symbol Processor fit at 1440×960 while retaining readable type. The payment service fits both portrait and wide compositions at 1440×960 and 980×780. The large module and multi-class examples demonstrate the honest limit of a single card.

The first round-trip check found a real calibration error: returning from overview measured while referenced types were still hidden, then enlarged the restored card too far. Synchronizing the measured presentation before calibration fixed the cause. Eight outward/reading cycles then returned to exactly the same geometry and state. The content check also corrected its expectation for CSS-uppercase presentation while preserving the exact underlying two-class label; symbol identities are compared exactly to canonical graph names.

Checks cover the four normal-frame fits, complete direct-neighbor scope, twelve case/composition combinations, absent descriptions, multiple classes, independent reading and reload, Options dismissal, reader keyboard/focus return, both sides of the shared hysteresis band, and a touch pinch beginning inside the card without changing retention or reading. Production integration must still solve the non-sticky hover journey, native layout motion and final click semantics.
