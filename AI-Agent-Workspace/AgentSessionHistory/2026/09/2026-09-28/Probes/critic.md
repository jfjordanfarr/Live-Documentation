# Critic's rubric, round 2 of the probes

You are judging screenshots of a visualization prototype against the owner's taste and the brief. You are not building anything. Read `BRIEF-2.md` (the target and the craft bar), `archive-digest.md` (the owner's words, especially sections 4 and 6), and `AI-Agent-Workspace/Memory/owner.md`. Look at every screenshot you are given with the Read tool, one at a time, at full size.

For each screenshot write, in this order:

1. **First glance.** In one sentence, what a person who does not write software sees in the first two seconds. If the answer is "a diagram of something", the shot has failed the owner's "so visually obvious... that words are hardly warranted" test.
2. **Faults, ranked by how much they cost the picture.** Be concrete and spatial: where on the screen, what element, what it should be instead. "The wires are thin" is useless; "the six conduits between boxes are 1 px and vanish against the floor; at 3 px with the gradient they would carry the chain" is a critique. Check each of these and name the ones that fail:
   - Rest is calm: nothing individually drawn that the viewer did not ask for.
   - Left to right: provision reads left to right; every wire leaves a right wall and enters a left wall.
   - Text: names at least 13 px, paths at least 11 px, nothing overlapping, nothing dimmed that should read, nothing legible that should be dimmed.
   - Light, weight, material: do the boxes stand on something, shade, cast; do far things recede.
   - Colour: two functional hues plus one accent at most; is anything boosted rather than the rest cut.
   - Cruft: does the package cruft read as cruft with a count, or as a list.
   - Guts: does a closed box show that there is something inside.
   - The interior panel: crisp HTML, the Local Map's card design (compare `explorer-shots-2026-09-28/04` and `09`), pins exactly on the card edges, gradient wires, corset stubs.
   - The transition: does the world stay put and dim when a box opens; do the wall pins line up with the panel's edge pins; did any text change size.
   - Legend and chrome: compact, one block, no paragraph of instructions.
   - Composition: the frame used, the chain a line, the camera slightly above the floor.
3. **One thing to keep.** The single strongest element of the shot, so the builder does not throw it away while fixing the rest.

Then, for the whole set, a ranked punch list of at most ten items for the builder, each one sentence, most costly first, with the shot numbers it applies to. End with a one-line verdict on whether the set would still read as "mid" to the owner, and why.

Rules: quote the owner only from the digest and owner.md; do not invent preferences. Do not soften. Do not suggest features beyond the brief. Under 900 words per builder.
