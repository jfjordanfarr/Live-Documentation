# Black boxes: the estate as a board. Findings, 2026-09-28

_Built by the coordinating agent itself, in the afternoon, after the owner rejected both estate pages of the morning. The page is `index.html` beside this file (`node build.cjs` rebuilds it from `src.html` and the fixture); `shoot.cjs` takes the screenshots under `shots/`. Disposable, like the other probes._

## The verdict it answers

On the two estate pages after their rounds: "Huh. Dang I did not love those at all. Is it possible that we could look to videogames for inspiration?" Then, in the owner's words:

- "It is a total mess to be able to see _inside_ each black box of software. **I think we should not be able to see inside the boxes** until we zoom in enough that we go to a new view. So long as the transition feels seamless, it's fine."
- "In 3D, I see that you're still worried about the left-to-right semantics. This is a mistake in my opinion. We're opening ourselves up to 3D specifically because we think that there is insufficient ordinal space to appropriately show dependency shapes honestly."
- "you _could_ reimagine the outer multi-software canvas as a 2D canvas which you plop boxes down on, and each box you point to a directory... and you can wire those boxes together along the openings that each expose. (i.e. found via our scans)."
- "3D seems good when your universe is big and your nodes and connections are many. 2D seems good when you're trying to work with UI elements."
- "consider whether or not 3D might mean 'faked 3D' (i.e. isometric perspective) or something like that. Think outside the box. What are you drawing and who are you drawing it for? These probes really lack vision."
- "Rather than spinning up a subagent, can you maybe work on this yourself? If I had to make a guess as to why the subagents were uninspired, my only guess is that they lacked sufficient familiarity with my user intents and the overall vision."

While the first build was rendering: "I recommend being more abstract than that. A cloud white blank surface upon which you plop isometric-looking markers is great too." "(of course if you prefer dark mode perhaps not a cloud white blank surface but a deep dark gray black background for those folks)". "Isometric would be especially good on the canvas for giving the impression that objects we plop on there have volume. Not sure whether we want them to feel like they have differing volume based on contents. But floating cubes in the sky above the isometric ground could be a great way to see these things being wired up." "I suspect that the more senior/high-level users would benefit from the feeling that the outermost interaction surface feels like plopping pieces down on a board game. Wargames system design haha!" And on placement: "Try smooth placement first." "Popular games offer a slider or checkbox for snapping as well. Doesn't have to be either/or."

## What is drawn, and for whom

The estate view is for the person who receives the map: a director, an auditor, a colleague who does not read code. They read a board: pieces with names, wires between the pieces' doors, two districts, one tunnel, drums for the databases nobody has source for. Nothing inside a piece is visible. The engineer gets the evidence on hover: which route, which endpoint address, which procedure, from which file. The author of a change wheels into a piece and arrives in its folder map, whose wall pins are the piece's doors.

The third dimension is faked and spent on two things only: the pieces have volume, so they read as things you placed; and they float above the board, so what they are built on can hang beneath them and the wires can run in the air between them. Quarter-turn rotation, as in the old city builders, keeps every label crisp and gives the "few different angles" the owner asked for without a free camera.

## What the page does

- **The board.** A blank white surface (a deep dark one on the `dark` toggle), with two declared districts as faint tints and a strip outside both. No grid unless snapping is on.
- **The pieces.** One per system: a cube for a service, a flat tile for a shared library, a drum for a database with no source. Uniform size by default; `size by contents` scales the footprint by files and the height by public symbols, for comparison. Each floats above the board with a soft shadow beneath; a piece being dragged lifts higher and its shadow lightens. Drag a piece anywhere; positions persist in the browser. Smooth placement by default; `snap to grid` is a toggle.
- **Doors.** A green ring where a piece serves (a route, a service endpoint, a stored procedure, a table), a blue ring where it calls. Doors sit at mid-height on the face that best faces the counterpart among the faces the viewer can see, so they slide as the board rotates. Hover a door for the opening's name and kind.
- **Wires.** One per call over the network, from the caller's blue door to the server's green door, in the air with a slight sag, blue to green along its length, with a slow dash flowing the way the request goes. Hover a wire for the evidence: the `via` text of every hand-verified edge behind it. The tunnel is a warm sleeve where the Gateway to Hub wire crosses the strip between districts, tagged declared.
- **The beard.** Strands hang from the underside of every piece that has a project file, one per reference. The `built on` layer adds a token on the board for every reference two or more pieces share, with a spoke to each piece that stands on it; hover a token for its users. Single references stay strands and are counted in the piece's hover panel.
- **Into a piece.** Wheel in until a piece fills half the view, or double-click it: the lid unfolds into a flat panel over the faded board, and the panel is the folder map in the Local Map's grammar: cards in dependency order left to right, green pins left and blue pins right, wires blue to green, evidence edges dashed, a reference to the file's own declaration as the corset stubs, a back-connection as the corset too. The piece's doors become wall pins on the panel's edges, labelled with the counterpart and a count. Escape, the crumb, or wheeling out folds the panel back into the lid, and the camera eases out so the next wheel does not re-enter. Text never resizes at any point.
- **Angles.** `rotate left` and `rotate right` turn the board a quarter turn with a tween; `top-down` flattens the projection so the same board is a plain 2D canvas, which the owner suspected might be enough.

Keys: Q E rotate, T top-down, U built on, S size by contents, G snap, D dark, R reset layout, Escape out. Console: `probe.rotate(1)`, `probe.tilt(0)`, `probe.under(true)`, `probe.sized(true)`, `probe.snap(true)`, `probe.theme("dark")`, `probe.enter("Gateway")`, `probe.exit()`, `probe.hover("road", "Gateway>Hub/App.config")`, `probe.zoomTo("Gateway", 0.4)`, `probe.move("Portal", 300, 500)`, `probe.reset()`, `probe.state()`.

## The rounds

1. A first build as a city: districts as ground, buildings sized by files and raised by symbols, roads on the ground, an underground layer of subway lines. The owner's notes arrived before it was looked at.
2. The board: white surface, floating pieces of one size, shadows, wires in the air, strands beneath, references as lines on the board, two themes.
3. District labels moved to the districts' front corners, the tunnel tag below the wire, only shared references drawn on the board, snapping made a toggle with the grid shown only then.
4. Doors moved to the faces the viewer can see; the built-on layer redrawn as tokens with spokes; the tunnel tag keeps clear of piece labels; the interior's columns fit the panel.
5. The tag's collision test corrected; tokens pushed clear of pieces and of each other; back-connections inside a piece drawn as the corset; the panel's hint hidden when narrow.
6. The tokens' labels drawn above the pieces; tokens pushed further.

## What the data could say, and what the page had to declare

- The openings come from `expected/hand-verified-edges.json`: a route from the `via` text, a `net.tcp` address, a procedure or a table from the file name. The Live Docs carry none of this. A real scan would read the routes from attributes, the endpoints from configuration and the procedures from the data layer.
- What a piece is built on comes from its `.csproj`: package references with versions, framework assemblies, project references. No Live Doc carries this either. Databases have no project file, so their beard is unknown, and the page says so.
- Which pieces are services, which a library and which databases is inferred: a project that other projects reference and that nothing calls over the network is a library; a folder under `Database/` is a database. The docs do not distinguish a library from a deployment.
- The districts and the tunnel are declared on the page. Their evidence is the fixture's README and a comment in `Gateway/Web.config`. Nothing in the docs names a zone.
- Directions are honest: every wire runs from the consumer file's system to the provider file's system as the hand-verified file writes them.

## Forks for the owner

1. **The board's colour by default**: white, or the deep dark one. Both are built; the toggle remembers the choice.
2. **Uniform pieces, or sized by contents.** Both built; uniform is the default because it reads as pieces.
3. **The built-on layer**: tokens with spokes for shared references, or only the strands and the hover list, or something else again. This is the SBOM view at the estate scale and it is the least settled part of the page.
4. **Doors that slide** to the faces the viewer can see, or doors fixed to the face that faces the counterpart, which rotation then hides and reveals.
5. **What opens a piece**: the wheel past a threshold, a double-click, or both, as built.
6. **A library on the board**: a tile among the pieces, as built, or only underneath, as a token that the pieces stand on.
7. **Inside a piece**: the folder map as drawn here, or the Membrane Map's rendering, once step 3 consolidates the views.
8. **Where the declared districts, the tunnel and the positions are written** so that a board can be shared: still open from the morning's forks.

## What is still wrong, in the builder's own eyes

- A wire to a piece that stands behind its counterpart swings around to a visible face and reads as a hook (PaymentService to SqlServer at rest).
- The doors are five-pixel rings, fiddly to hover; a door label should perhaps show at rest when a piece has few.
- The interior panel neither pans nor opens a card at file scale; that is step 3's work, not this probe's.
- The lid transition does not carry the doors to the wall pins; the pins re-seat to the left and right edges by role. Continuity of identity is kept by the labels, not continuity of position.
- Shadows are a fixed offset, not lit from the same side as the faces.
- Thirty pieces are untested; nothing here would break, but the wires would.

## Rounds 8 and 9: after the owner's yes

The owner, on the hosted round-7 page: "HOLY SHIT THIS IS SO GOOD. WOW! Yeah this is -- this is exactly the direction I'm looking for." Then four things, all done the same evening:

- "I can pan around as freely as I could in the force-directed graph view. Full 3D with these primitives seems great. Could probably keep the camera orthogonal so it still feels isometric even when panning and things stay sane sizes." The camera is now an orthographic one with a free azimuth and elevation: drag with the right button, or hold Shift, to orbit about the middle of the screen; quarter turns and top-down remain as tweens, and top-down squares the board to the screen with the whole board in view. Nothing scales but the world; text, doors and tokens keep their size.
- "the light mode feels low-contrast, whereas the dark mode feels much much higher-contrast. I get the impression of a 'haze' over the scene in the light mode." The board stays white; the page behind it is a darker grey, the pieces' sides, strokes, text and shadows are darker, and the district tints are stronger. "I sincerely appreciate the light blue for cloud and light orange for onprem. Those are the conventions I normally use in my diagrams at my firm."
- "too much parenthetical text on the hover over an object." The piece panel now says what it stands on in one line, "1 package, 2 framework assemblies, the Contracts project", with the project file named beneath, and the built-on tokens carry their kind.
- "the tutorial text in the lower-left corner is unwelcome. A simple question mark element in a corner which allows one to bring up a guided walkthrough or an explainer modal/popover of the UI is fine." The legend is gone. A question mark in the corner opens an explainer, and its button starts a five-step walkthrough that drives the page: a piece, a wire, the built-on layer, opening a piece, the camera.

### The owner's question about what a piece stands on

"It feels like PaymentService depends on its own csproj, which would really be a thing inside the black box. Is there a way for us to know that a directory has dependencies on something that is not member to that directory?"

What the strands and tokens show are things named in the project file that live outside the directory: packages with versions, framework assemblies, and other projects. The project file is inside the box; what it names is not. The wording now says so.

Whether it can be known in general, from what exists today:

- The docs already carry it for some languages. An import that resolves to no file in the folder is an outside dependency, and the graph index holds 469 such edges for this repository: TypeScript's `three`, `playwright`, node's built-ins. The tree-sitter C# adapter records none for the estate, because it drops framework namespaces as builtin names, so for C# the docs are silent on `System.ServiceModel`.
- Versions live only in manifests: `.csproj` and `packages.config`, `package.json`, `requirements.txt` and `pyproject.toml`, `go.mod`, `Cargo.toml`, `Gemfile`, `pom.xml`. That is a short, well-known list, one small reader each, not open-ended pattern matching.
- The vision's rule is to grow the doc format rather than add a side channel. The parsimonious form is a Live Doc for the manifest itself, whose dependencies section lists what it names, with versions; then the beard is derived from the docs like everything else, as the set of what a directory's files consume that is not in the directory. This is a fork for the owner, recorded below.

### Forks added

9. **Manifests as Live Docs**: an adapter per package manager so that a project file's dependencies are in the docs, or manifests read at render time as this page does.
10. **The camera's buttons**: left-drag pans and right-drag orbits, as built, or the force graph's convention with left-drag orbiting.

## Round 10: the World Map

The owner, on round 9: "Super slick. This is awesome." Then, done in this round:

- "the camera rotation should be opposite-directional (moving mouse right = rotating left is more natural to end users and matches behavior of force-directed graph)." Both axes of the orbit now follow the force graph's convention.
- "clicks on any system should pin the popover and require dismissing (or change its contents when clicking on another system). The pinned popover element should contain a clickable link to dive inside that system." A click pins the panel to a piece, a wire or a token; a click elsewhere, the close mark or Escape dismisses it; clicking another piece moves it; a pinned piece's panel carries "open Gateway". Hover no longer changes a pinned panel.
- "I still think we can get away with less text." The explainer, the walkthrough and the panels lost about half their words.
- The names, proposed by the owner and used here on trial: the outer view is the **World Map** ("or 'Global Map' or 'Multi-Map' or 'Canvas'"), and what opens inside a piece is its **Local Map**, which "one could manifest into view in either the 2D mode (membrane map, once we get it actually looking as good as the original Local Map) or 3D mode (force-directed graph)". Zooming in far enough on a piece is the transition, as built.

Acknowledged and left: "You're right about connectors not always drawing on top of their proper receiving point. But this is something we can work with."
