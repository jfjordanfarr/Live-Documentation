# Closed Directory looks, 2026-11-13

Historical evidence for the Closed Directory trial in Tuning → 2D Layout. The owner had said the closed box "doesn't indicate to me "this thing can pop open and let out a lot of stuff into the screen"" the way the 3D bags of cells do ([Turn 7](../../../ChatHistory/2026/11/2026-11-13.1.record.md#turn-7)). The choices are today's box (the default) and three trial looks. Each one draws over the box's own layout. The cards' and boxes' places at arrival are the same in every look, for all three subjects, under both font metrics.

## Pictures

The pictures are 1,440 by 900, named `{subject}-{look}-{choice}-{fallback|segoe}.png`.

- **Subjects:**
  - `scripts`: five boxes above cards.
  - `engine-src`: `packages/engine/src`, a directory of directories.
  - `explorer-client`: `packages/explorer/src/client` after Fit, with its top band of boxes.
- **Looks:**
  - `arrival`: as the page arrives.
  - `connections`: after three presses of Zoom Out.
  - `overview`: after seven presses. For `explorer-client`, Zoom Out stops before seven.
- **Font metrics:**
  - `fallback`: this machine's own font lines.
  - `segoe`: Segoe UI's line metrics, the `SEGOE_LINES` fixture.

The `opening-scripts-doc-tools-*` pictures show the first, middle and last frames of opening `scripts/doc-tools` in each look. They use fallback lines, and the move was slowed to 900 ms to catch the middle frame. The cells look's frames were also taken under Segoe UI's metrics (the files ending in `-segoe`), and they show the same three moments. `scripts-3d-bag-of-cells-fallback.png` is the 3D Local Map of `scripts` in Structure, for comparison.

## Skin with cells (`cells`)

**What it is.** A rounder skin with a soft light. Under the name it holds:

- a round cell for each file directly inside, packed staggered;
- a small skin for each subdirectory, holding its own cells and a rim for each subdirectory deeper.

Where the room ends, the cells fade under a veil. In the far looks the cells are held at the look's scale under the held name: at least one row, and a subdirectory becomes a rim there. Where not even one row fits, the skin alone carries the look.

**What is wrong.**

- At the connections look, the `explorer-client` boxes are too short to hold a row under the held name. The skin carries those alone.
- At the overview, the name fills every box.
- At the arrival, a subdirectory holding one file is a skin hardly wider than a cell. It reads as a ring with a dot.

## Stack (`stack`)

**What it is.** The box is the top card of a stack, in a file card's colours. Under it stand one, two or three cards, by the files held (up to 4, up to 16, more). Each lower card is a filled layer a shade darker than the one above, with an edge as much fainter. The cards are 4 px apart, so the deepest reaches 12 px, inside the 16 px between items.

**What is wrong.**

- At far zooms the cards underneath merge into a dark edge.
- It is the closest to today's box, which already shows one edge.

## Folded membrane (`folded`)

**What it is.** The opened membrane's outline, at the same stroke as the membrane (the border colour, 1 px). Above it, the opened label folded shut:

- a disclosure mark pointing right, before the directory's glyph;
- the name in the label's type;
- More at the right.

The count sits under the label, and a crease runs at the foot.

**What is wrong.**

- Below the count it still reads as an empty box.
- In the far looks, the held header puts the disclosure mark at the right, beside More, not before the name.
- The design audit counts the drawn label since November 14. At arrival it reports each folded box's label colliding with that box's own name button (5 in `scripts`, 4 in `packages/engine/src`). That button's words are transparent, so nothing visible collides. It reports nothing else in the folded look, and no cut text.

## Opening

In every look, the first frame shows the box where it stood. In the middle frame the new membrane grows out from that place while its neighbours move, and the membrane's label crosses a moving neighbour's box. The last frame shows the opened directory. The transition itself is unchanged from today's box.
