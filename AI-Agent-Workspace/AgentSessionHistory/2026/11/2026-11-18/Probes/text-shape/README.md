# Text shape as texture: a probe of three candidates, with a blind reading

Historical record of a probe, November 19, 2026, by the builder of the marble trial, on the owner's Turn 24 ([the November 18 record](../../2026-11-18.1.record.md)): "whether the concept of "code file = grid of text" could be somehow translated into "smoothed grid of text_ure_" with the marbles", with a file's own text as the source. Nothing in the product changed. The numbers and pictures are of this date. The sheets are in [`Screenshots/text-shape/`](../../Screenshots/text-shape/README.md).

## What was made

`shape.ts` turns a file's text into two things and draws candidates from them pixel by pixel, without a browser:

- **The page**: an ink grid of 32 columns over the first 128 characters (four characters a cell, tabs as four spaces). It has one row per line up to 64; a longer file is squeezed into 64 rows, each the mean of its lines. A marble on screen is at most about 60 pixels, so more rows could not be drawn. A short file keeps every line, because its shape is line by line. A long file reads as its page's profile: the indentation staircase and the ragged right.
- **The grain**: 8 bands of lines. Each band carries the marble-trial sketch of its own lines: each trimmed line hashed to a direction in eight dimensions, the directions summed, and each component wrapped as `sin(sum / 0.35)`. At that divisor, one changed line turns the band's grain about a radian. The grain is drawn as eight fine waves inside the band alone. Because it is a sum, three inserted lines disturb the bands below only by the few lines that cross a band's edge.

The candidates:

- **P**: the page inside the ball, facing the viewer and upright, its square mapped onto the disc so that the whole page shows. It is the kind's colour, darkened by the ink at low contrast (up to 42 %). In the product this needs the page's direction taken from the view, not from the ball's own unit sphere: the fragment shader would read the hit point in view space, as the contained sphere already computes it, rather than `MARBLE_LOCAL`. The page also needs a texture or packed uniform per file, about 512 bytes. As drawn here, P **drops the veins**: it shows no blue or green.
- **PG**: P with each band's grain.
- **BG**: the page wrapped round the ball as latitudes and longitudes, tilted by the file's path, the ink drawn in the veins' colours (blue and green rows in their shares' proportion), with the grain.
- **D**: today's From Its Doc marble, ported here from the product's shader. It is the baseline for the blind reading.

`run.ts` draws the sheets' pictures, counts how many of the 384 touches move each candidate, and writes `numbers.json`, `touches.json`, `sheets.json` and `proposal-samples.txt`. `compose.ts` labels the sheets in a browser. The shared browser lane was held past this probe's time, so the sheets were laid out by `compose-plain.ts` without captions, and the screenshots' README names each tile by position. `trials.ts` makes the blind reading's 37 pictures (`trials/`) with the answers apart (`trials-key.json`). `blind-answers.json` holds the reader's answers, as given.

To run them, from the repository's root, after `npm run live-docs:visualize`:

```
npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/run.ts
npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/compose-plain.ts
npx tsx --tsconfig ./tsconfig.base.json AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/Probes/text-shape/trials.ts
```

`out/`, the single pictures, is not kept; `run.ts` draws it again.

**Since 2026-11-19** the Marble Pattern trial is removed from the product, and with it `marbleSketch.ts` and its doc sketches. So `shape.ts`, `run.ts` and `trials.ts` no longer run as they stand. To run them again, check out the commit before "Take the Marble Pattern trial out of the product".

## Numbers

**Touches that move a 48 px marble.** The measure is the largest mean change of brightness over any 8 × 8 window, on a scale of 0 to 255. The sample is the 375 touches of the last 150 commits to c5493364 where the file existed before and after; another 9 of the 384 created or removed a file.

| Change greater than | 1 | 2 | 3 | 4 | 6 | **8** | 12 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P | 245 | 182 | 146 | 115 | 82 | **56** | 29 |
| PG | 301 | 268 | 254 | 234 | 207 | **171** | 75 |
| BG | 210 | 205 | 200 | 199 | 193 | **186** | 169 |

**The threshold by eye is 8.** On `pairs-PG.png` and `pairs-P.png`, pairs near 8 show a band that has shifted if you look for it side by side. Pairs near 5 and below I could not tell apart. Nothing at 48 px is "perceptible at a glance". BG leaves 139 touches pixel-identical, 123 of them touches that move PG. Most likely their changed lines lie in the first or last band, at the poles, which the tilted wrap turns away from the viewer. That is a flaw of BG, not a measure of calm.

**Bytes per file** that a Live Doc and every history step touching the file would have to carry:

- the page at 2 bits a cell: up to 64 rows × 8 bytes = 512 bytes;
- the grain at a byte a strength: 64 bytes;
- as one base64 line: 776 characters for `forceGraphView.ts`, 712 for a 58-line test, 500 for the 38-line query.

## The blind reading

A fresh agent (Opus) was told only that "each ball is drawn from the text of one file". It saw the 37 unlabelled pictures once, with no names, captions or coaching. The questions and their chance levels were set before any result was seen. Nothing was rerun.

| Question (chance) | P | PG | BG | D (today) | Pin, page | Pin, page and grain |
| --- | --- | --- | --- | --- | --- | --- |
| Which of six balls changed, a real commit (1 in 6; 0.5 hits expected in 3) | 1 of 3 | 0 of 3 | 0 of 3 | 0 of 3 | 0 of 2 | 1 of 2 |
| The same, one or two lines of a small file (1 in 6; 0.33 in 2) | 0 of 2 | 0 of 2 | 1 of 2 | 0 of 2 | — | — |
| Which is the query aligned by eye, and why (1 in 2) | right, "dark marks stack into vertical columns at a shared edge" | right, "faint vertical structure", a guess | right, "vertical blocks", a guess | — | wrong | right, a guess |
| Which of four is not text (1 in 4) | 2 of 2 | 2 of 2 | 2 of 2 | 2 of 2 | — | — |
| Order three text files by length (1 in 6) | 2 of 2 | 1 of 2 | 1 of 2 | 1 of 2 | — | — |

In the reader's words: "At that size an edit of one file almost never showed. Only 2 of 20 answers felt fairly sure." Both of those were in the change rows, and one of the two was wrong. "Horizontal streaks and dashes … told me the most"; "mottled and woven textures … were too uniform to compare ball by ball"; "small boxes … told me nothing". The not-text answers say nothing about the texture: the PNG is an asset, and its ball is the asset's magenta, which the reader named as the clue.

**What it says.** No candidate let the reader see which file a commit changed, at 72 px or in the 2D pin; the hits are at chance. The page (P) carried the file's own shape. It ordered files by length twice out of twice (1 in 36 by chance), and it showed the aligned query with the right reason, "vertical columns at a shared edge". The grain, the part made to turn at every edit, read as uniform noise. A model's failure is not proof that a person's eye fails: people read texture better than these models do, and a person living with the same marbles for weeks would learn them. But a model's success is fair evidence that a signal is there, and the only success here was P's page.

## How a Live Doc would carry the shape (a proposal, not built)

`proposal-samples.txt` holds both forms for a 58-line test, the aligned query and `forceGraphView.ts`.

- **Braille in a fence.** The page at one bit a cell (ink above a quarter), two columns and four rows to a character. That gives 16 characters by up to 16 lines: 506 bytes for the test, 264 for the query, 627 for `forceGraphView.ts`, all UTF-8. A person reading the Markdown sees the page, and git's diff shows which band moved. In the aligned query's Braille the alias gutter is plain. It has no room for the grain, which would need another line.
- **One encoded line.** The page at two bits a cell plus the grain, in base64: 712, 500 and 776 bytes. It is exact and compact, but it is opaque to a reader, and its diff shows only that something changed.
- **Either way** the generator would write the shape into every Live Doc, and every history step that touches a file would carry it. Today 250 of 384 touches leave a Live Doc byte-identical; with a shape, nearly every touch would rewrite one, since P's page moves at 245 of 375.

## The browser lane

The labelled composition (`compose.ts`) waited in the shared lane's queue for about a quarter of an hour behind eight others, and was withdrawn. The sheets were laid out without a browser instead. The blind reading needed no browser.
