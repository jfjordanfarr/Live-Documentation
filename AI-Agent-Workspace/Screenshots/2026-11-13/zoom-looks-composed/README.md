Evidence for the first step of composing the 2D Local Map's cards for each zoom look, 2026-11-13: a builder's pictures before and after its change (`a38169b8`), written up by the root. Historical: it describes that commit, not the product after it.

The owner had reported, on the build of the day before, "a level of zoom-out where a LOT of the actual node cards' real estate goes totally unused if no symbol connections are present in the render", and asked "why would we preserve the Reading button at zoom levels where you cannot read the description?" ([Turn 2 of the November 13 record](../../../ChatHistory/2026/11/2026-11-13.1.record.md#turn-2)). The root measured both and found the cause in one sentence: when the zoom takes a text away, its room is given to nothing, the opposite of the owner's words of November 5, "That text space we're reserving? That should be space that the symbols themselves should be able to take up once we're at a sufficiently far-away zoom" ([Turn 7 of that record](../../../ChatHistory/2026/11/2026-11-05.1.record.md#turn-7)).

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

The other thirty are described by the builder's handback, summarized in [the record's notes for that day](../../../ChatHistory/2026/11/2026-11-13.1.record.md#turn-4); the root did not open them.

## To see it in the product

Open either link and press Zoom Out three times; both carry the three looks in their address (the address is the day's local preview):

- [the opened directory](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEz8FQUAA2iASwAdECSTVcdAcaqBKuwKs6dBmNj4Dg6AD0kgwAFoG6QdFWALogMfwSSl-btzvdvuD4cFyelIA)
- [the pinned file](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEzayg%2B3QZjY%2BA4OgA9JIMABaDhpAs1jCUT7oyZRHE6B6VspAA)
