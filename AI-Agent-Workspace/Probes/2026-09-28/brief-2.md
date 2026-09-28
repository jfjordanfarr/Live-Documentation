# Probe brief, round 2, 2026-09-28

Read `BRIEF.md` first for the data, the constraints and the visual law; they still hold. This brief replaces the three probe sections with one target, and adds the owner's verdict on round 1 and the craft it must reach.

## The owner's verdict and hint

On the nine round-1 screenshots: "Not gonna lie, I can see the screenshots and they all came out pretty mid. Can you please fire up more subagents and keep iterating based on critiques of the screenshots you stored in `shots/` and my cumulative user intent?"

Then: "consider whether it might be wise to stick to 2D inside the black box of a software system, and 3D outside of one (between software systems/rigging up many)."

That is the design rule for this round. **Inside a system, two dimensions**: the Local Map's grammar, crisp, as it already exists in the Explorer. **Between systems, three**: boxes in a space, zones, a tunnel, conduits, cruft. The transition between the two is the thing to get right.

## What round 1 taught (do not relearn it)

- Depth inside a folder or a file cost legibility and broke the left-to-right law within 30 degrees of orbit. The wins inside were two-dimensional: one wall pin per neighbouring folder with a count, cards in dependency order, the corset stubs, fading everything unrelated.
- Between systems the third dimension paid: zones as volumes, a shared library arcing over the chain, back-connections routed behind, a tunnel as an object.
- Every builder converged on the transition rules: text never resizes; the wall pin is the junction between scales; landmarks stay, dimmed; the next scale's summary at the edge is the pull.
- Provision reads left to right at every scale: a wire runs from the provider's blue right-wall pin to the consumer's green left-wall pin. For the estate that is Oracle, SqlServer, PaymentService, Hub, Gateway, Portal. Build with `direction: "provision"` as the default and keep `"call"` switchable.
- The round-1 estate page (`estate-canvas/`) has a working data model: the estate subset of the index, the hand-verified tier-2 edges with their `via` text, the project references, the package references, the direction switch. Reuse the model; replace the rendering.

## Why round 1 looked mid, in the coordinator's words

1. Everything was drawn at once. 282 wires inside a box, 59 wires into one pin, every row of every card. The resting state must be calm; detail arrives on focus and hover. Cut, do not boost.
2. Debug-render craft. Grey slabs, wireframe edges, hairline wires, 9 px text, floating labels that overlap, a legend that takes a quarter of the screen, a black void behind everything. Nothing had light, weight or material.
3. Depth spent on tilt. Cards were receded and orbited, which only made text unreadable. Depth is for layering and for the space between systems.
4. The boxes did not look like anything. The owner asked for cubes with guts: "Inside each cube, we could see the interconnections, the guts... how data flows into one box, through its innards, and out towards the next box." A closed box must show, faintly, that there is something inside; an open one must show the map.
5. The cruft was a bullet list. The owner asked for "dangling vines off the cube's underside, or a cruft of barnacles".

## The target

One page: **the estate as a place**, with two-dimensional interiors.

**The world (WebGL).** Two zones, cloud and on-prem, as ground slabs or regions a viewer can tell apart at a glance without reading. Six systems as boxes standing on them, arranged so the chain reads left to right in provision order. The tunnel as an object where the zones meet, labelled once as declared. Wires between boxes as conduits, tier told by line style (solid observed from source, dashed observed from configuration and contracts, dotted declared), each landing on a wall pin: what a box serves on its right wall, what it calls on its left. Beneath each box, its package references as a cruft of small shapes, count readable at a glance, names on hover; say on the page that they come from the project files, not the docs. SqlServer and Oracle, which have no Live Docs, drawn as ghost volumes (a database may be a cylinder), their files known only from the hand-verified edges. A closed box shows its interior faintly through its faces: the silhouette of its cards and the brightest wires, enough to say "guts", not enough to read.

**The interior (DOM, in three-dimensional space).** Use three.js's `CSS3DRenderer` alongside the `WebGLRenderer` with one camera: each open box holds a real HTML panel, rendered by the browser, so text is crisp at every angle and never resizes. The panel is the folder-scale map of that system in the Local Map's grammar: file cards in dependency order left to right, green pins on the left edge of a card and blue on the right, wires as SVG paths with the 10/80/10 blue-to-green gradient, imports landing on `Internals`, corset stubs for self references and for back-connections. Match `AI-Agent-Workspace/tmp/explorer-shots-2026-09-28/04-local-map-connection-geometry.png` and `09-crop-local-map-corset-card.png` for the card design: dark card, name in bold, path in monospace below, rows with kind in a small italic, pins as 12 px rings exactly on the edges. Clicking a card inside the panel gives the file-scale view in the same panel: the card with all rows, its consumers and dependencies flanking it, wires per symbol, the rest of the panel faded. The panel's own left and right edges carry the box's wall pins, so a wire that arrives at the box's wall in the world continues into the panel at the same pin.

**The transitions.** Canvas to box: the camera moves to face the box square-on and dollies until the panel fills most of the view; the box's front face fades; the other boxes, the zones and the wires stay where they are, dimmed to the owner's spec (bodies illegible, names half legible). Box to card: inside the panel, no camera move, the panel re-renders around the clicked card at the same font. Out: the reverse, with the panel folding back into the box, whose faces show the guts faintly again. Crumbs show where you are. No literal zoom of text at any point.

**Direction.** Provision by default. The legend says which way it runs in one line.

## The craft this round must reach

- **Light and material.** A key light and ambient light; boxes with faces that shade; a floor that receives a soft shadow or a contact darkening; fog or distance fade so far things recede. Cards inside panels are flat HTML and do not need lighting.
- **Palette.** Background near `#0b0f17`. Surfaces two or three steps lighter. Text `#e4e9f0` and a muted `#95a1b1`. Green `#34d399` and blue `#38bdf8` for pins and wires only. One warm hue at most, reserved for the declared tier or the tunnel, or none. The two zones told apart by value and texture, not by loud colour.
- **Type.** System sans for names, at least 13 px on screen at rest; monospace for paths at least 11 px; nothing smaller unless it is dimmed by design. Labels never overlap: hide or offset the loser.
- **Lines.** Wires at least 2 px, gradient blue to green with 10% solid at each end; conduits between boxes thicker than wires inside a panel. Many wires to one pin become one bundle with a count badge, never a fan of forty hairlines.
- **Rest.** At rest, no wire inside a closed box is individually visible and no panel is open. The canvas at rest should be readable by someone who does not write software: six things, a chain, two worlds, one tunnel, cruft underneath.
- **Legend.** One compact block, bottom left, under 120 px tall. No instructions text longer than one line.
- **Composition.** The resting camera sits slightly above the floor plane looking along the chain, so the boxes read as volumes and the chain as a line. Use the whole frame; no third of the screen empty.
- **Performance.** Smooth at 60 fps on the estate. Nothing that would not scale to 30 boxes.

## Hero shots, in this order

1. `20-canvas-at-rest.png`: the estate at a glance, provision order.
2. `21-canvas-hover-tier2.png`: a dashed conduit hovered, its evidence shown, the rest dimmed.
3. `22-gateway-open.png`: the Gateway box opened, its panel showing four cards with pins and wires, the world dimmed around it, the wires into its walls continuing into the panel.
4. `23-gateway-paymentscontroller.png`: the card focused inside the panel, file scale, corset stubs where the data has them.
5. `24-back-to-canvas.png`: back out, the Gateway's guts faintly visible through its faces.
6. `25-canvas-orbit.png`: the canvas from a second angle, to show the boxes are volumes and the chain still reads.
7. `26-request-path.png`: optional, if it does not cost the rest: the path of one request from the Portal's page to the Oracle table, highlighted across boxes and through their interiors, everything else faded. This is the owner's sentence, "how data flows into one box, through its innards, and out towards the next box", drawn once.

## Process

You will receive critiques of your screenshots between rounds. Iterate at least three internal cycles (build, shoot, look with the Read tool, fix) before each hand-back. Number each hand-back's shots from the next free ten (20s, then 30s, then 40s) and keep the older ones. Append a short dated section to `findings.md` per round: what changed, what the critique got right, what you disagree with and why. Your hand-back message is that section verbatim plus the list of new files.

Everything in `BRIEF.md` about honesty still binds: draw only what the index, the hand-verified file and the project files say, and write down every fact the picture wanted and could not have.
