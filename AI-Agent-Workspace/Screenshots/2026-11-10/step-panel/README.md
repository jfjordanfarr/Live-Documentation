# The compact step panel and the whole step's dialog

Status: implementation evidence, 2026-11-11. A builder captured these for the root's review and then the owner's eye. Not yet committed. Origin: the owner's message in [Turn 6 of the November 10 record](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-6): "that rather large and annoying text blob that blocks nearly half the usable screen real estate by default during the history mode ... I think the big commit texts should be relegated to "..." as we've done with descriptions, with a click engaging some kind of modal to render the full text." The same message mused about quick actions on a commit's changed files. That is an idea the root is putting back to the owner, and nothing of it is built.

## What changed

- **The panel is compact.** It keeps the old panel's place and width rule, top left of the picture. It holds:
  - the subject, at its old size, in a slot of at most two lines, cut with an ellipsis (the whole subject is its `title`);
  - the hash, date, author when shown, and step;
  - one line counting what the step changed, the nonzero counts only. For example, "Changed: 45 files, 36 wires, 3 document links". A file counts once across created, deleted, renamed, resized and content-only. A whole-directory rename is said when there is one.

  At the base the panel shows the "beginning of what is known" note instead of the counts. A commit the docs saw nothing of gets the old sentence.
- **A "…" button** ("Show the whole step") stands in the panel's header beside the hide button, in the same place at every step.
- **The button opens a modal dialog** with:
  - the whole subject and the meta;
  - the base's note when there is one;
  - every group the old panel listed, with the same rows and buttons.

  Escape, its close button and the backdrop close it, and the focus returns to "…". Choosing a file or a document closes the dialog and acts. Opening the dialog pauses a playing history, and closing it does not play on.

## How it was captured

The pictures come from a temporary Playwright probe, removed after use. It ran headless Chromium against a private static server over `dist/explorer`:

- "before" from the build at `9bdbf7cd` plus the other builder's uncommitted 3D work, as found;
- "after" from the same tree with this change.

The probe opened the 3D Structure layout with nothing pinned, the pointer parked over the sidebar, at 1440×960 unless named otherwise.

## The pictures

This repository at step 695 (`e99d592d`, "Repair Explorer history, discovery and directory framing": 45 files, 36 wires, 3 document links):

- `before-step695.png`: the old panel, 390×801 px, running under the control strip.
- `after-step695.png`: the compact panel.
- `after-step695-dialog.png`: the whole step.
- `after-step695-dialog-900x700.png` and `after-step695-dialog-480x800.png`: the dialog on a small window and a phone-width one.
- `after-step695-480x800.png`: the compact panel at 480×800 after the dialog closed by Escape, the focus back on "…".

This repository at step 691 (`85ba619f`, "Discover the 3D Local Map by hops from what was asked about, and show a history step's changed files", 100 characters):

- `before-step691.png`, `after-step691.png` and `after-step691-dialog.png`.

The base of this repository's history (`f7a75fa7`):

- `before-base.png`, `after-base.png` and `after-base-dialog.png`.

The scripted sample's short step 5 ("Teach the engine to smooth", one file resized):

- `before-sample-step5.png`, `after-sample-step5.png` and `after-sample-step5-dialog.png`.

## What reads well and what does not

The builder's judgement, not the owner's.

**Reads well:**

- At step 695 the panel shrinks from 390×801 px to 390×109 and ends well above the control strip. The picture's middle and left are free.
- The counts line says how big the step was at a glance. Long subjects end in an ellipsis inside their two-line slot.
- The dialog reads as a page of its own: a 720 px column, the whole subject as its heading, and the groups as before. Large groups stay folded behind their counts. At 480 px it takes the width less 16 px a side, and rows wrap within it.

**Does not read well, or is unproven:**

- The "…" icon is small and drawn in the panel's muted grey beside the ×. It is recognizable, but it is not obvious that it holds the step's file list. Whether a word ("Details") or a stronger colour would serve better is the owner's call by eye.
- At the base and at a short step the dialog adds nothing the panel does not already show, apart from the one row and its button. The button is always present so that it never moves.
- At 480 px wide the panel keeps the old width rule, 45% of the picture less 18 px. Its subject slot is then about 15 characters a line, so "Repair Explorer history,…" is all it shows.
- The same 480 px pictures show older faults outside this change: the pin tray overlaps the control strip, and the strip sits directly on the scrubber, whose slider wraps.
- The dialog has no motion and asks for none.

## The design audit over these states

`tests/e2e/design-audit.ts` was run by a temporary probe over this repository at `85ba619f` and `e99d592d`, at 1440×960, 900×700 and 480×800, every group of the dialog opened. Separately, `history-scrubber.spec.ts` audits the scripted sample's states and passes.

- **The compact panel.** Nothing collides. The panel measures 390×109 px at 1440 and 300×109 at 900 (the 45% rule), and 206×145 at 480, where the meta and the counts wrap.
- **The cut subject.** The audit reports the subject as cut off wherever it is longer than two lines: by 288 px at 1440 for the 100-character subject, and by 18 to 99 px at the smaller sizes. That is the owner's ellipsis by design. The audit has no notion of a deliberate clamp whose whole text is in its title and in the dialog.
- **The dialog at its top.** No faults at any size.
- **The dialog scrolled.** The audit reports 6 to 12 "collisions" between the heading and rows that have scrolled up out of the dialog's body. Those rows are clipped by the body's scroll box and are not seen. The audit's overlap check does not clip to a scroll box, though its cut-off check does.

## The camera beside the compact panel (the root, November 11, 08:30 to 09:10 UTC)

Looking at `after-step695.png`, the root saw the bubbles still framed in the strip to the right of the panel, as beside the tall one, and tried a rule that framed the picture in whichever room had the larger area, beside the panel or below it.

- `rejected-step695-framed-below-by-area.png`: that rule on this repository at step 695. The picture is centred under the panel and **smaller**, about 230 by 350 px where it had been 290 by 430: the picture is taller than it is wide, and the room below the panel is 646 px high where the room beside it is 773. Rejected the same hour.
- The rule kept (`cornerPanelInsets` in `forceGraphCamera.ts`): beside the panel while 320 px of width remain there, as the picture was always framed; below it where they do not, which happens when a reader docks beside a narrow picture. At 1440 by 960 the picture therefore stands where `after-step695.png` shows it. With it, the panel no longer gives way to a reader at 1000 px wide: it stands above the picture, which is framed below it. Two browser cases in `history-panel.spec.ts` hold this.
- Not built: framing each picture in whichever room draws it larger, which would give a wide picture the whole width under the panel. It needs the picture's extents each frame and a way not to flip between rooms while the picture moves.

