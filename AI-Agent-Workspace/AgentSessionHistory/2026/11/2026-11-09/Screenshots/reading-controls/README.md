# Reading controls and exact symbol arrivals — November 9, 2026 UTC

Current bounded builder evidence. The root visually accepted this bounded repair before its formal regressions; the full gate remains a root decision. The owner’s report is preserved in [the session record](../../../ChatHistory/2026/11/2026-11-08.1.record.md#turn-3-additional-reading-feedback-during-the-review).

Fixed-slot cards again have books for their actual prose, and descriptions can be all visible, all folded, or an exact subset. Their empty slots remain allotted. Names retain the reader action. Whole-card open retains the existing contract of disclosing that file’s otherwise hidden rows; this is a change of shown scope, separate from hiding text in already shown rows.

## Pictures to compare

- [Pinned subject, all prose](08-repo-pinned-all.png), [none](09-repo-pinned-none.png), and [one exact description](10-repo-pinned-subset.png): canonical `reading-state.ts`, same card sizes throughout.
- [Middle band](11-subset-middle-aria.png): saved open intent survives, all slot prose is hidden, and every visible book reports `aria-expanded=false`.
- [Compact estate neighbor](16-compact-neighbor-in-frame.png), [its text folded](17-compact-neighbor-folded-in-frame.png), and [whole-card reading disclosing its complete rows](18-neighbor-disclosed-in-frame.png). `PaymentsContext.cs` remains 282×249 map units when text folds; whole-card open discloses seven rows instead of one, producing 288×614. The tall disclosed card begins at its title and continues below the frame.
- [Pinned estate subject](01-pinned-subject-books.png): only the class has Summary prose and a symbol book; `Post` and `Get` have empty slots and no empty books.
- [Reader failure before](06-repo-switch-symbol-before.png) and [exact target after](14-same-file-symbol-target-after.png): following `Walk (interface)` from `reachability (function)` formerly kept scroll 531 and placed its heading at y−250.5 above the reader beginning at y80. The repair places the exact canonical heading at the reader’s top. [A different map symbol after closing the reader](15-map-symbol-target-after.png) follows the same rule.

## Browser observations

[observations-before.json](observations-before.json) and [reader-targets-before.json](reader-targets-before.json) preserve first-open, same-file switching and the original middle-band ARIA mismatch. First-open targeting worked for the estate class and constructor and for repository reachability; the reproduced reader defect was retained scroll between exact symbols in one file.

[observations-after.json](observations-after.json) contains seventeen checkpoints: all/none/subset, steady map-unit boxes, subset reload and fresh-recipient share, Back from evidence, zoom return, explicit symbol fold overriding whole-card open, no empty books, compact-neighbor scope, exact first and subsequent symbol targets, Back/Forward, and class/constructor distinctions. No page errors occurred. [supplemental-checks.json](supplemental-checks.json) adds the in-frame neighbor geometry, shared none/reload/Back, and same-target refresh preserving scroll 303.

These are source-and-browser verification artifacts, not an assertion that the full product gate has passed. The root owns visual acceptance and the final gate.

## A learned regression boundary

The first formal focused run passed eight cases and reached the final short C# constructor example in the ninth. Its exact heading was fully visible, [1.546875 px below the reader top](19-short-document-scroll-limit.png), because the document had reached its maximum scroll. The new test had wrongly required every document to align within 1 px of the reader top. The corrected check retains that tolerance against the nearest physically available scroll position and requires the whole heading to be visible; no product code or test deadline changed for this correction.

The stronger full-heading visibility check then found a real fractional edge: Chromium rounded an intended scroll position of 200.546875 to 201, clipping 0.453125 px of the heading’s box (intersection ratio 0.9816919). [The failure picture](20-fractional-heading-scroll-before.png) preserves it. The reader scroll helper now rounds the target offset down to a whole scroll pixel, retaining the complete heading rather than loosening the check.

## Focused verification completed

All 38 related Playwright cases passed in 3.1 minutes across `card-slots`, `card-reading` and `inspection`. The five new slot/target cases are included in that count. After strengthening the ordinary fragment and section-heading assertions, those two cases and the exact-symbol journey passed again in 11.4 seconds. Test deadlines were unchanged.

All three package builds passed; the Explorer build passed again after the fractional-scroll repair. Regeneration processed 954 files: 3 updated, 951 unchanged, none created or deleted. Live Doc lint validated all 954 files with 53 disconnected-node warnings. Product diff whitespace checks pass. [Before](dependencies-before.json) and [after](dependencies-after.json) canonical one-hop inbound inspections are identical: the direct consumers of card reading are the controller and branch renderer. No full gate or commit was performed by this builder.

## Normal-default integration follow-up

[The unchanged candidate’s search check](default-search/README.md) proved that both text-only actions restarted the search and recreated all cards/rows despite unchanged scope. [The repair verification](refresh-verification/README.md) records the in-place fix, three normal-default regressions, an active-search diagnostic and the keyboard-focus baseline correction. The final [manifest](manifest.json) names 27 reading-product paths and their SHA-256 hashes, excluding the other builder’s history/capture changes and the copied root archive. Root owns integration and the full gate.
