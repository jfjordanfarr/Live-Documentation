# Zoom looks: three looks against the stepped ladder

Status: trial evidence, 2026-11-10, captured by a builder for the root's and then the owner's judgement. Not an adopted design: the default is still the stepped ladder, and the trial is Tuning → 2D Layout → Zoom Looks = "Three looks, each held at one size". Origin: the root's design of the trial ([November 10 record, Turn 5](../../../ChatHistory/2026/11/2026-11-10.1.record.md#turn-5)) testing the owner's hypothesis ([November 8 record, Turn 2](../../../ChatHistory/2026/11/2026-11-08.1.record.md#turn-2)): "very very FEW breakpoints (2-3) for heavily quanitized different looks of the nodes". Round two (the root's review of the first pictures, the same day) changed the overview's scale from 4.5 to 3.6, moved the Internals row's dashed box out of its enlarged name, and replaced the fade at a change of look with a morph. Round three (the root's review of the motion sheets) made the morph start from each held thing's size on screen in the look it leaves, counting the Zoom button's own jump of the camera, made the file's name cross over between connections and overview rather than re-wrap and grow, and let the rows that go silent leave at once. The three-mode stills and measurements are from round two (round three changed only what moves during a change), the three-mode videos and the motion sheets from round three, the stepped stills, videos and measurements from round one (the stepped mode did not change).

## What the trial does

One state, the look, replaces the band and the step for slot cards. It is chosen from the same zoom ratio against the calibrated reading scale, with the bands' edge rule and 15 % margin, so a press out and the press back always show the same look:

| Look | Zoom Out presses | Ratio edges (out / back) | Drawn as | Held scale (map units) | Name on screen vs reading size |
| --- | --- | --- | --- | --- | --- |
| reading | any closer zoom through 2 | leaves below 0.591, returns above 0.680 | the card as composed, step 0 | 1 (follows the map) | 1.0 → 0.69 |
| connections | 3 to 6 | leaves below 0.285, returns above 0.328 | the far band's rules | 2.2 | 1.27 → 0.74 |
| overview | 7 to the zoom limit | | the overview band's rules | 3.6 | 1.0 → 0.58 (at press 10) |

The overview's scale was 4.5 in round one, by the design's 1.3 to 0.72 aim; it broke the estate's file names inside words (`Paymen / t / Service / .cs`), and whole words outrank the floor, so it is 3.6, about the ladder's seventh step.

Inside a look the stylesheet is written once; the file's held name's lines are chosen once a render for each look's scale. The Internals row gets the room down to its card's content bottom so it is held at the look's scale like the rows above it, and its dashed box is a layer that grows with its head. At a change of look, where motion is welcome, each held thing both looks draw (row names, dots, a row's More, the node's More) travels over 160 ms from its size on screen in the look it leaves, the camera's jump included, to its new size. What one look draws fades: a row's Pin and book out at the size they had, the node's other controls in. The file's name crosses over in place at every change: the leaving drawing stays at the size it had on screen (never larger than its card allows) and fades out while the entering one fades in, growing from the leaving size only from reading. Between connections and overview the rows that go silent leave at once, and the rows that return come in after the name's crossing, 160 ms later, so that no line of a name lies over a row still drawn. Nothing animates under `prefers-reduced-motion: reduce`.

## What was captured, and how

A fresh headless Chromium context per journey, 1440×960, DPR 1, default preferences, ordinary animation, pointer parked over the sidebar, against the root's static server on port 8900. The subjects are the two `"variant": "current"` links of `AI-Agent-Workspace/Probes/2026-11-10/reading-focus/links.json` (the estate's `PaymentService/PaymentService.cs` and this repository's `packages/explorer/src/client/views/symbolAnchors.ts`, each pinned whole, the file's Purpose folded and one description kept open), with `zoomLooks` set in the link's layout settings.

- `{estate|repository}-{stepped|three}-out-{00..10}.png`: after each Zoom Out press, once the picture is at rest and the animations have ended; `…-back-00.png` after ten Zoom In presses back. Three mode's `out-03` to `out-10` and `back-00` are round two's; its `out-00` to `out-02` (the reading look, unchanged) are round one's.
- `motion-out-2-3.png`, `motion-out-6-7.png`, `motion-back-7-6.png`, `motion-back-3-2.png`: the estate's four changes of look within one journey of ten Zoom button presses out and ten back, recorded at the recorder's 25 frames a second and decoded with Playwright's bundled ffmpeg. Each sheet runs from the frame before the press's jump to two frames after the change's 160 ms or after the last frame that still changes, whichever is later, every tile the subject card's neighbourhood at full resolution, labelled with its frame, its time from the press and how much it differs from the frame before (mean per channel, 0 to 255).
- `motion-wheel-2-3.png`, `motion-wheel-7-6.png`: a slow wheel zoom about the subject (ticks of 12 every 40 ms) out across both edges and back in, the first change out and the first change in. The camera moves in every frame, so each sheet is a fixed window of 23 frames; times are from the look's change as the page's clock reported it, placed in the video by a Zoom button press out and back at the start of the same recording (the clock and the video agree within about 20 ms).
- `{subject}-three-buttons.webm` (the ten presses out and back) and `{subject}-three-wheel.webm` (the calibration press, then the wheel out and in) are round three's, for both subjects; `{subject}-stepped-buttons.webm` are round one's.
- `measurements.json`: per subject, mode and press (out and back): the look or band and step, the camera's scale, every file name and symbol name inside the frame with its visible text, line count, ellipsis state and size on screen, the min/median sizes, the count of names cut, the five smallest texts and controls anywhere in the map, the design audit's (`tests/e2e/design-audit.ts`, the Local Map's text selectors) collision and cut-off counts, and in three mode every held file name's line that ends inside a word by the audit's seams (`wordBreaks`).

The reading scale the arrival calibrates is 1.45 on both subjects, so a symbol name's reading size on screen is about 16 px and a file name's 18.8 px.

## The numbers

Name sizes on screen in px (median of names in the frame) at each press out, file names / symbol names:

| Press | estate stepped | estate three | repository stepped | repository three |
| --- | --- | --- | --- | --- |
| 0 | reading 0: 18.8 / 16.0 | reading: 18.8 / 16.0 | reading 0: 18.8 / 15.9 | reading: 18.8 / 15.9 |
| 1 | reading 1: 15.7 / 15.9 | reading: 15.7 / 13.3 | reading 1: 15.7 / 15.9 | reading: 15.7 / 13.3 |
| 2 | middle 2: 18.8 / 16.0 | reading: 13.1 / 11.1 | middle 2: 18.9 / 15.9 | reading: 13.1 / 11.1 |
| 3 | middle 3: 18.9 / 16.0 | connections: 23.9 / 20.3 | middle 3: 18.9 / 16.0 | connections: 24.1 / 20.4 |
| 4 | middle 4: 18.9 / 16.0 | connections: 20.0 / 16.9 | middle 4: 18.8 / 16.0 | connections: 20.0 / 17.0 |
| 5 | far 5: 18.8 / 16.0 | connections: 16.6 / 14.1 | far 5: 18.8 / 16.0 | connections: 16.7 / 14.1 |
| 6 | far 6: 18.8 / 15.8 | connections: 13.9 / 11.7 | far 6: 18.8 / 15.9 | connections: 13.9 / 11.8 |
| 7 | overview 7: 18.9 / – | overview: 19.0 / – | overview 7: 18.8 / – | overview: 19.0 / – |
| 8 | overview 8: 18.8 / – | overview: 15.8 / – | overview 8: 18.8 / – | overview: 15.8 / – |
| 9 | overview 9: 18.7 / – | overview: 13.2 / – | overview 9: 18.9 / – | overview: 13.2 / – |
| 10 | overview 10: 19.0 / – | overview: 11.0 / – | overview 10: 18.8 / – | overview: 11.0 / – |

Names cut, inside the frame (the frame takes in more cards as the camera zooms out, so a count can grow inside a look without any name changing):

| Press | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| estate stepped | 2 | 2 | 2 | 2 | 3 | 7 | 0 | 2 | 7 | 8 |
| estate three | 0 | 0 | 2 | 2 | 3 | 4 | 0 | 0 | 0 | 0 |
| repository stepped | 0 | 1 | 3 | 3 | 3 | 3 | 0 | 2 | 4 | 7 |
| repository three | 0 | 0 | 3 | 3 | 3 | 3 | 0 | 0 | 0 | 0 |

In stepped mode the cut names change from press to press (estate press 10: eight file names cut to four or five letters, "Paym / e…"); in three they are the same names cut the same way at every press of a look. At 3.6 no file name in the overview is cut or broken inside a word on either subject at any press: every line ends at a seam (estate press 10: `Payment / Request / .cs`, `IPayment / Service / .cs`, `Post / Payment / Row.cs`, `Payments / Context.cs`, `App.config`; repository: `local-map-corset. / spec.ts`, `branch- / renderer.ts`, `symbolAnchors / .ts`); `wordBreaks` is empty at every press.

Smallest things drawn, three, connections and overview: inside slot cards no text is below 10.9 px (a file name at press 10) and no control below 12.6 px on either subject at any press (stepped: Internals' name 5.8 px and a row's More 8.3 px at press 6). Outside slot cards, directory captions shrink at the overview look's farthest presses, 8.6, 7.2 and 6.0 px at presses 8, 9 and 10, so below 8 px at the last two, exactly as in stepped mode (left for later by the root).

Design audit: no collisions at any press in either mode on either subject. Cut-off text (the audit counts the designed ellipses too): estate stepped 0, 2, 6, 7, 8, 7, 8, 0, 0, 0, 0 for presses 0 to 10; estate three 0, 0, 0, 7, 7, 7, 7, 0, 0, 0, 0; repository stepped 0, 0, 1, 3, 3, 3, 3, 0, 0, 0, 0; repository three 0, 0, 0, 3, 3, 3, 3, 0, 0, 0, 0. The audit does not see the held file names (they are generated content), which the tables above and `wordBreaks` cover.

Every press back showed the look (or band and step) of the press out, in both modes and on both subjects.

## The motion sheets

- `motion-out-2-3.png` (frames 85 to 93): at the press the layout's file name fades as the held `PaymentService / .cs` grows in over it from the size the name had; the row names grow from their reading size on screen to the held size, the path, descriptions, Pin and book fade out at the size they had; settled at frame 91, +200 ms.
- `motion-out-6-7.png` (139 to 146): the rows leave at once; the connections lines, at their map size (the press's jump shrinks them by 1.2, so that they stay inside the card), fade out while `Payment / Service / .cs` fades in in place; settled at frame 144, +160 ms.
- `motion-back-7-6.png` (229 to 238): `Payment / Service / .cs` stays at the size it had on screen and fades out while `PaymentService / .cs` fades in; the rows come in from frame 235, after the crossing; settled at frame 237, +280 ms.
- `motion-back-3-2.png` (287 to 294): the connections lines stay at the size they had on screen and fade as the layout's `PaymentService.cs` fades in; row names shrink from their held size on screen to reading size, the descriptions, Pin, book and node controls fade in; settled at frame 292, +160 ms.
- `motion-wheel-2-3.png` (143 to 165) and `motion-wheel-7-6.png` (333 to 355): the same two crossings during continuous camera motion; in 7-6 the rows come in about 200 ms after the change. The Post row is highlighted in some frames because the wheel's pointer rests on it.

## What is wrong or doubtful in `three`

- **Two big jumps, by design.** From press 2 to 3 a symbol name grows from 11.1 to 20.3 px (×1.8) while the descriptions, path, Pin and book leave; from press 6 to 7 the file names grow from 13.9 to 19.0 px and re-wrap while the rows go silent. The morph makes each continuous over 160 ms; whether two big changes read better than eleven small ones is the owner's question.
- **Back to reading, the first frames are still busy** (`motion-back-3-2.png`, frames 288 to 290): the row names start at the size they had on screen but are no longer cut, so `PaymentService` reaches its row's controls as they fade in; the node's book, Pin and close fade in over the leaving held name's first line; the two file names overlap as they cross. Nothing is larger than it was before or after (the spec samples it). All of it has settled by +160 ms.
- **Out of reading the layout's name does not hold its size on screen** while it fades: it is inline text, which cannot be scaled, so it shrinks with the press's jump while the held lines grow in from its old size.
- **The rows that return to connections come 160 ms after the press**, so the change back from overview lasts about 320 ms against 160 ms for the other three.
- **The wires do not follow the morph.** They are drawn to the anchor dots' final place and size, the frame after the change, while the dots travel for 160 ms.
- **Overview names are smaller than reading** at the far presses: 0.58 of reading size at press 10 (11.0 px for a file name), the price of whole words.
- **The orphaned suffix remains.** In connections the subject's name is `PaymentService / .cs` with its More beside `.cs`. That is the existing held-lines rule for a short extension (balanced breaks are left for later by the root).
- **Names cut in connections.** The subject's own `PaymentService` row reads `Payment…` across the whole look, as do `PaymentsContext (class)` and, on the repository, all three long function names. They are stable but cut. The empty description slots stay empty in connections (left for later).
- **Directory captions below 8 px** at overview presses 9 and 10 (above; left for later).
- **The Internals row's head extends below its own row** (inside its card), with its dashed box grown to hold it; the trial's spec audits heads against cards and other rows, not against their own row.
- In the trial the Internals box's colour no longer eases on hover (its fade was the one transition that still ran under reduced motion at a change of look).
- With Card Text = grow, Zoom Looks has no effect. Text and Control Resistance do not apply in the trial (each look's scale is fixed); Name Growth still does.

## Links the root opened and checked (November 11, 00:25 UTC)

Against the preview on port 8900, in a headless browser at 1440×960, with seven presses of Zoom Out in each: no page error, Zoom Looks at the three looks, the reading look at presses 0–2, connections at 3–6, overview at 7. They work only while that preview serves a build of this tree.

- [The sample estate, three looks](http://127.0.0.1:8900/samples/estate/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEz8FQUAA2iASwAdED4JZV2BV7mYQ6fb5mW61AD0jebVC%2BjPbXAe6B0darACoqwBdECTtZQEDdky91sDrtNpd9tv%2BQfDkDwfgl0BAvKLlv97drnubgdD5y%2B%2BdjsqzkBkUtHqUASUk89Py-Pnd-a9t1vPcQAdOw8wzLhynfTYvx-dczy3ADEL-ZCdzvfZDmOJAT1QoDVSLGNj3xMhoMnUogA): `PaymentService/PaymentService.cs` the subject, one pin (the builder's link, from `measurements.json`).
- [This repository, three looks](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEz8FQUAA2iASwAdED4JZV2BV37oLKYAY6AD0XGRvmqjLbOhqbfQfk%2BbduXAi7YOR1IFoN9rMOgeHB0darACoqwBdECbtZQauYJstxwdrtoIpmPsDodsEdjid9w7HBCz8HVRfLkDwfgl0BAvKNs2rant2F5Xugg7DlQHCjreD5Ts%2Br7zh%2Bzi%2Bvua5lLuIBkKWf5SgAkpI%2B6Ace7adqBvb9hBN53nBk5PjOc7vkuqEgA6dh5hmXDlHhmyEcRh5ASe5HnpR15QTB970dOL5MQuLFfvsDFIHk6xmBQ2BsDsHjKYRnxsBUt5MkWMb-viZDcZupRAA): `symbolAnchors.ts` the subject, one pin (the builder's link).
- [The change itself, three looks](http://127.0.0.1:8900/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqARgAYn4BLAFwFMK7DIATABZ4AI0xUAJnygCAHPAAWXNgHNFHAMKoAzhygBWeBR6iAThK4BRMFypUuOnbOOmLDgMpsK%2BBG3ScAJ6yLPBmqADuADJctggOTi4gAF6oqBRRaQDWzpAgHIpmXFwgAL7wAGaoZuhcNBb4ikR%2BVFkykABsrMSKmGaqJZ3dJAh%2BOmyotPSQRsSoZL5sVKqM8FSoklxeyYMiIDqBFKKkHlgIgwzwqhZgQVBMAHRMArMkPpN2HB5c%2BH2YHBMqPcHgJ4Ohev0uAAlCQDe7wAj4cIAD28-0BwLgiCWWQ8HCKywKwNmC0k-2sDn6wUgl3yXAKXDMwOeYM4XEkACFAgAFMijVbY1oAdTYkiJNLWGy4AC00hQoY42HoJLVMfAImwirL0grxsqqKrII8AJxrTAmACC%2BhpChAilQ%2BFytKKtmwADELCZcl14DplKMACI-cWgkDXeb4IUNfCM3L7LJLMrlEBMyAVbA6LjwABWUHTCEz8FQUAA2iASwAdED4JZV2BV37oLKYAY6AD0XGRvmqjLbOhqbfQfk%2BbduXAi7bQZwAamxx22EJhJJszABaPQ-HQPDg6OtVgBUVYAuiB4JXq7XTw3ME2W44O120EUzH2B0O51QOKO5xOFxhsLO84kJ%2B4SjIy267leICIgggQxHEADyFRBhwmBsAgx4gEeaxQNWN7Nq2D7ds%2Br7oIOw6ft%2B46Tv%2BCCAREC5Liu67cI6EGntWpagECeSNgR96dsRvb9mR74jmOv5TgBP6McujIsZu7G%2Brh%2B5lLA3G4Xxd7toJT7CW%2BFFfhJNEzjJwH4qQ5xmEp%2By4TBcGxFwCBIShaFIKUR6lEAA): `ladder-steps.ts` the subject and pinned whole, `applyLevelOfDetail` of `controller.ts` pinned beside it (the root's link; the address is the page's own after opening).

Seen in the third link's pictures and not corrected: in connections `ladder-steps.test.ts` fills its card's width and the card's menu drops beneath the name; in overview that name is cut to `ladder-steps.te…` while its neighbours wrap whole.
