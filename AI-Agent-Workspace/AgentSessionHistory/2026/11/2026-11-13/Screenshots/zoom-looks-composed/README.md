**Correction, the same day** ([Turn 5 of the record](../../2026-11-13.1.record.md#turn-5)): every picture here was drawn by a headless browser in this container's fallback font. On the owner's screen, which has the Segoe UI the Explorer asks for, a line of text is taller, a symbol's row holds one line of its name at the connections look's size, and the names described below as whole on two lines are still cut on one. The counts at a card's foot do show there. The fix was sent back to the builder; read "whole on two lines" below as true of these pictures only.

Evidence for the first step of composing the 2D Local Map's cards for each zoom look, 2026-11-13: a builder's pictures before and after its change (`a38169b8`), written up by the root. Historical: it describes that commit, not the product after it.

The owner had reported, on the build of the day before, "a level of zoom-out where a LOT of the actual node cards' real estate goes totally unused if no symbol connections are present in the render", and asked "why would we preserve the Reading button at zoom levels where you cannot read the description?" ([Turn 2 of the November 13 record](../../2026-11-13.1.record.md#turn-2)). The root measured both and found the cause in one sentence: when the zoom takes a text away, its room is given to nothing, the opposite of the owner's words of November 5, "That text space we're reserving? That should be space that the symbols themselves should be able to take up once we're at a sufficiently far-away zoom" ([Turn 7 of that record](../../../2026-11-05/2026-11-05.1.record.md#turn-7)).

## What the step changed

- **In the stepped ladder**, the default that day: the book that folds and restores descriptions leaves the card and its rows at the same press as the descriptions (the second out); it had stayed until the fifth.
- **In the three looks** (Tuning → 2D Layout → Zoom Looks): a symbol's name that its row cannot hold on one line takes the room its description left, wrapped at its seams on as many lines as the row holds, and is cut only after that; and a card's two counts, `+N symbols` and the framed `+N connections`, stand at the look's held size at the card's foot where they fit, or are not drawn.
- No card's box changes with the zoom, no layout is solved again, and no Tuning default changed.

## The pictures

Thirty-six, 1,440 by 900, headless Chromium, named `{subject}-{mode}-press-{NN}-{before|after}.png`: the press is the count of Zoom Out presses from the arrival. Subjects: `doc-tools-dir`, the opened directory `scripts/doc-tools`, whose cards draw no symbol rows; `documentationLinks`, that directory's file pinned, with many rows; `estate-payment`, the estate sample's payment card. Modes: `three-looks` at presses 0, 3, 5 and 8; `ladder` at presses 3 and 5.

What the root saw in the six it looked at itself:

- `doc-tools-dir-three-looks-press-03-after`: each card is its name at the top and its counts at the foot at a size that reads ("+14 symbols", "+16 connections"), where before it was a name over a blank two thirds. `enforce-documentation-links.ts` still breaks so that `.ts` stands alone on a line, and the closed `__fixtures__` box beside the cards shrinks with the map to about six pixels: neither was in this step.
- `documentationLinks-three-looks-press-03-after` and `-press-05-after`: "DocumentationLink / Violation", "resolveCodeTo / DocumentationMap" and their neighbours stand whole on two lines where they read "DocumentationLinkVi…"; rows, dots and wires stand where they stood. `extractReferenceDefinitions` needs three lines and is cut at "extract / Reference…", honestly, its row holding two.
- `estate-payment-three-looks-press-03-after`: "Payment / Service" whole, its pinned highlight grown to hold both lines and close on the next row's.
- `doc-tools-dir-ladder-press-03-after`: no book on any card; the counts are still at the map's size there, the ladder being out of the step's scope.
- `doc-tools-dir-three-looks-press-08-after`, unchanged by the step and still wrong: at the overview's size this repository's narrow cards break file names inside words and cut them ("documentati / onLinks.…").

The other thirty are described by the builder's handback, summarized in [the record's notes for that day](../../2026-11-13.1.record.md#turn-4); the root did not open them.

## The round's later steps, the same day

Written by the root at the landing of the last step. The first step above was followed by a stated line height for slot cards, so that names wrap alike on every machine (`a7a49c18`), and by the three looks becoming the default (`49990525`). The last step answered the owner's "symbols with no description shown to occupy less vertical space on their row" ([Turn 2](../../2026-11-13.1.record.md#turn-2)):

- **Short rows at reading size.** A symbol whose description is not shown, none written or folded with its book, has a row of 44 map pixels where a described one has 66. It is not shorter still because the same row must hold one line of the name at the connections look's size, and a card's box never changes with zoom. Folding or restoring a description changes the card's height: the row acted on stays still, the rows below, the card's foot and the cards wired to those rows move together, and the layout search is not begun again.
- **Even air between names in the connections and overview looks.** Each name takes the lines it needs, up to what a slot row holds, and the room left over is shared equally between them.
- **A closed directory's box** inside an opened directory holds its name at the look's size, with Open and More beside it at the connections look and the name alone at the overview; its count of files is not drawn in either.
- **A file's extension keeps company** in the looks: "Payment / Service.cs", "enforce- / documentation- / links.ts". The stepped ladder keeps its filled first line.

The twenty-four pictures named `…-2b-after.png` and the three `estate-payment-fold-motion-…-2b.png` are the builder's, each subject drawn under this machine's fallback lines (`fallback`) and under Segoe UI's line metrics (`segoe-lines`), which is what the owner's screen draws. The root opened nine of the Segoe set and the fold's motion stills, and saw:

- `estate-payment-…-press-00`: Post, Get and Internals stand close under PaymentService; the band between the path and the first row is still blank, since the file has no Purpose written and that room is what the title takes two looks out.
- `estate-payment-…-press-03`: "Payment / Service.cs" over "Payment / Service", Post, Get and Internals at even air.
- `documentationLinks-folds-…-press-03` and `-press-05`: thirteen names, one or two lines each, the same air after every one.
- `doc-tools-dir-…-press-03`: `__fixtures__` with Open and More, readable beside the file cards; at `-press-08` its name alone.
- Still wrong and not in this step: at the overview a narrow card breaks names inside words, and ".cs" can still stand alone on a line there.

The root then ran the merged build itself under both metrics: folding `DocumentationRule` on `documentationLinks.ts` took its row from 66 to 44 and its card from 1,199 to 1,177; the six other cards rose by the same 22 with the rows they are wired to; none moved again in the four seconds after; and the air between the names at the connections look was 18.1 between two-line names and 22.9 after a one-line name, whose More is taller than its text.

To see it on the day's preview (three looks are the default, so the links carry no setting): [the pinned file](http://127.0.0.1:8999/?view=local&node=scripts/doc-tools/documentationLinks.ts), fold a description with its book, then press Zoom Out three times; [the opened directory](http://127.0.0.1:8999/?view=local&dir=scripts/doc-tools), Zoom Out three times; [the estate sample's payment card](http://127.0.0.1:8999/samples/estate/?view=local&node=PaymentService/PaymentService.cs), where no symbol has a description.

## To see it in the product

Open either link and press Zoom Out three times; both carry the three looks in their address (the address is the day's local preview):

- [the opened directory](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEz8FQUAA2iASwAdECSTVcdAcaqBKuwKs6dBmNj4Dg6AD0kgwAFoG6QdFWALogMfwSSl-btzvdvuD4cFyelIA)
- [the pinned file](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEzayg%2B3QZjY%2BA4OgA9JIMABaDhpAs1jCUT7oyZRHE6B6VspAA)
