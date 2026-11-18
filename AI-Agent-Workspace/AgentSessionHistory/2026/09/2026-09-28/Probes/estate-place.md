# The estate as a place (round 2, 2026-09-28)

_The builder's findings for the diorama page, verbatim, through two rounds. Screenshot numbers refer to the builder's `shots/` folder; kept here are `shots/place-30-canvas-at-rest.png` (30), `shots/place-32-gateway-open.png` (32), `shots/place-36-request-path.png` (36) and `shots/place-39-depth-stacked.png` (39)._

## What was built and how to drive it

`build.cjs` is round 1's pipeline, unchanged; everything else is new.

World units are CSS pixels. Each system's interior is laid out once, in pixels, and that one layout drives three renderings: the HTML panel (`CSS3DRenderer`), the WebGL guts seen through the faces, and the wall pins both scales share. A box is as large as its panel.

`window.probe`: `level`, `open`, `focus`, `out`, `hover(wireId | "tunnel" | null)`, `hoverBox`, `hoverCruft`, `path(bool)`, `orbit(deg)`, `direction("provision" | "call")`, `instant`, `state`, `model`. `shoot.cjs` makes shots 20 to 29.

## What the diorama composition bought and cost

Bought. At rest (20) a non-programmer sees six things on two floors, a chain, one warm tunnel, cruft at each foot with a count, and something inside each box. The guts are real: the request path (26) lights the conduits and the same wires inside the boxes, so "into one box, through its innards, out" is one picture. (25) shows the volumes. Hovering a dashed conduit (21) leaves only its two systems and the evidence.

Cost. The panel dictates the box, so a dependency chain deeper than five columns is wider than the viewport; Portal fit only after the layering rule below. A horizontal chain in 16:9 leaves sky above; the horizon gradient and slab aprons fill it without earning it. Contracts has no zone, so its pad and its place behind the left end are page decisions. The barnacles read as pebbles; the count and tooltip do the work. Every dimming level is a hand-tuned constant.

## Where 3D outside and 2D inside meet

The junction is the wall pin. A conduit ends at `(wall x, pin y, z = 0)` on the box; the panel sits in that plane and its edge pin is the same point. The camera opens a box by flying square-on to `fovPx = (H / 2) / tan(fov / 2)`, the one distance at which a world unit is a CSS pixel, so text arrives at 13 px and never zooms. Over the last half of the flight the front face and the guts fade out and the panel fades in at the same coordinates.

```
world (WebGL)                          panel (DOM, the box's mid-plane)
                                    │
  conduit, tier dash, 3.2 px  ──────●───────────────▶ card  row ●──── wire ────●  card
                             wall pin: ring at x = 0 of the panel      SVG, 10/80/10
                             = (cx − W/2, cy + H/2 − y, 0) in the world
                                    │
  front face opacity 0.40 → 0       │   panel opacity 0 → 1      guts opacity 1 → 0
```

Clicking a card moves nothing: unrelated cards fade to 0.16, other wires vanish, and outside only the conduits carrying that file's edges stay lit. Wires use the Local Map's Bezier between adjacent columns; a wire spanning a column detours through the nearest gap (22, 27, 28), so none crosses a card's face. Columns come from the index's references; a hand-verified pair is added only if it keeps the graph acyclic, so it can never stretch the chain, and what would close a cycle becomes corset stubs. No self edges exist here; stubs show only on back-connections (27, 28).

## Facts the picture needed that the docs do not carry

1. Zones: `ZONE_OF` on the page. Wanted at the slabs. Contracts has none.
2. The tunnel: declared on the page. Wanted between the slabs.
3. Which files form a system: path segments; the truth is `Estate.sln` and the `.csproj` globs. Wanted at every box.
4. An edge's tier: the index has none; solid means "in the index", dashed "in the hand file". Wanted at every conduit.
5. Evidence: every `via` in the hover panel is the hand file's.
6. Routes: Portal's conduit lands on `PaymentsController`'s Internals, not `Post` or `Get`; `GatewayClient` calls `api/payments` and no doc says so (23).
7. Endpoint addresses: `PaymentHub` (endpoint) and `Estate.Hub.PaymentHub` (service) are symbols, `net.tcp://hub.onprem.example:8731/PaymentHub` is not; the hand file matched them. `PaymentService.Consumer.Production` and `.Staging` have no address, so the Hub–PaymentService conduit cannot land on either row (27).
8. Connection-string targets, procedure and table names: the three PaymentService–SqlServer edges land on ghost cards from the hand file (29).
9. `.sql` files have no Live Doc: two systems are ghosts whose files exist only as `to` paths.
10. Package references, versions, target framework: `.csproj` only. Wanted at the cruft.
11. Project references: 19 bundled file edges stand where `<ProjectReference>` states three facts.
12. A remote edge's symbol: hand edges name files, so every tier-2 wire lands on Internals or a file hub.
13. A config edge's reading: the hand file says "from depends on to"; "Hub serves Gateway" is the page's choice of provision.
14. The request path: 13 hops chosen by hand over real edges; nothing computes reachability yet.

## What you would keep and throw away

Keep: pixels as units with `fovPx` as the opening distance; one layout for panel, guts and pins; the wall pin as the junction; detours around columns; index-first layering; tier by dash; badges counting file pairs; the one warm tunnel; guts through the faces; the request path.

Throw away: the plinths; the dim table; the 3D lace behind cards in the guts (invisible at rest); sprite pins (should be DOM); the barnacle shapes; the horizon gradient. Unanswered: a system deeper than the viewport (wrap, pan or fold), and how thirty boxes stay calm.

## Round 2, 2026-09-28 (shots 30 to 39)

What changed. Cards are measured, not assumed: each is as wide as its longest title or row, and a column takes its widest card, so nothing truncates and `App.config`'s two endpoints read apart. Every wire is one Bezier from pin to pin; a wire that would cross another card's face is drawn by WebGL in the box's depth and passes behind the HTML cards for real (32, 38), so no shared segments and no junction that does not exist. The folder scale shows one file wire per pair, hub to Internals; clicking a card replaces the wires it carried with the rows the docs name (33: Contracts now lands on `Post` and on Internals). Contracts stands in line at the far left on its own pad, so all three of its conduits leave rightward from every angle (30, 35). The resting camera is fitted to the systems and their names, low and on the left, and the ground runs off-frame (30). The tunnel is a lit tube the conduit passes through; the databases are capped drums with one dotted rim; cruft is solid shapes with a count; the floor reaches the horizon; the grid is gone. Labels never overlap: a collision pass hides the weaker of two, and a backdrop behind an open panel hides whatever stood behind the system (38b). Lines dim by colour at full alpha, because `Line2` double-blends at every joint and a translucent line turns into dots. The evidence card sits above all labels (`CSS2DRenderer` gives each label a depth z-index in the millions). Stats live in the legend, which shrinks to one line off the panel when a system is open, and the chrome dims with the world. The request path is drawn at conduit weight through the innards, with both ends named (36).

What the critique got right. Everything on the first-glance list: the bus was a frame, the "5" conduit did read backward, the guts were silhouettes worth keeping, and the title truncation was a defect the owner would have read as a fact.

Where I differ. The `Web.config` fan still emerges from behind that card near its own pins (32); a corset stub at each end would be cleaner to read but hides the route, and the pass-behind keeps every wire followable, so I kept it and note the ambiguity. A row of seven systems in a 16:9 frame remains a band with sky above it; fitting closer would cut the chain, which the brief forbids. The experiment answers that: 39 stacks the zones in depth, and it beats the row for the first glance (two worlds, a tunnel with length, the frame used to the corner) but not for reading the chain, which zigzags and shrinks the far row's databases.
