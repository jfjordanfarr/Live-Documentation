# Colour in Live Documentation: the whole record, 2025-10-16 to 2026-11-16

_Filed by the root on 2026-11-16 as received from the research helper, with link targets rewritten for this folder. Seven of its quoted lines were checked against the transcripts by the root and stand. **One claim below is wrong and is corrected here:** the account says the accessibility standard (WCAG) never appears in the Antigravity transcripts. It does: on 2025-11-20 the owner asked Gemini for "a DOM and a set of screenshots that shows something without such obvious WCAG violations" (`2025/11/Antigravity/11-20/83f976da-d7f4-4c75-a16d-561dfbea1a4b/Refining Interaction and Code Quality.md`), so the entry in `Memory/ideas.md` that dates it to that session stands._

Historical research, written 2026-11-16 by a read-only research helper for the root agent. Paths are repo-relative to `AI-Agent-Workspace/ChatHistory/` unless they start with `.mdmd/`, `AI-Agent-Workspace/` or `packages/`. Line numbers were checked against the files; `#turn-N` anchors exist as `## Turn N` headings. Owner words are quoted verbatim (typos kept) and kept apart from agent proposals or builds.

Classifications: **OWNER DECISION**, **OWNER PREFERENCE/REACTION**, **AGENT PROPOSAL (unanswered)**, **BUILT** (by whom), **TRIED AND REJECTED/WITHDRAWN**, **OPEN QUESTION**.

Nothing about colour appears in October 2025 (the extension/LSP era): every "green" in owner messages that month is "tests are green", every "palette" is VS Code's command palette.

---

## Chronological account

### 2025-11-19/20 — Antigravity (Gemini 3): the force graph coloured by archetype
- 2025-11-19, `2025/11/Antigravity/11-19/01f1b443-.../Refining and Analyzing Graph.md` line 159. Owner: "Please color the dots by their archetype and size the dots by their source code file's line count?" **OWNER DECISION** (the first colour request in the project). **BUILT** by Gemini; the archetype palette is Bootstrap's (`#0091ff` implementation, `#28a745` test, etc.; first in git at `732e6a98`, 2025-11-20). That table survives today as `spatialNodeStyle` in `packages/explorer/src/client/views/forceGraphAppearance.ts` (implementation `#0091ff`, test `#28a745`, asset `#e83e8c`, interface `#ffc107`, config `#6c757d`, script `#17a2b8`, related-doc `#9966cc`, directory `#e9984d`, other `#888888`).
- 2025-11-20, `.../11-20/83f976da-.../Refining Interaction and Code Quality.md` line 199: "for some reason we no longer color dots by archetype? Not a huge deal, just slightly odd. Not that we had a gorgeous color scheme on that to begin with. Would be nice to see that differentiation again if possible." Line 226: "the force graph is only showing the color of the actively selected file, which is neat for finding it but unuseful for categorizing against everything else. If there's some kind of glow we can put on the active one, that's great, but otherwise we should stick to letting folks see nodes and edges colored by salient information that their eyes can learn and adjust to". **OWNER PREFERENCE**: colour should carry learnable categories; selection by glow, not by recolouring.
- Same day, `.../Refining UI Interactions.md` line 181: "the sonar view's style is uh, I really don't like it. XD An "idea cloud" or "mind map" would be a much more fitting phraseology for the color-and-form styling I'd expect". **OWNER REACTION.**
- No mention of WCAG anywhere in the five Antigravity transcripts.

### 2025-11-21 — WCAG AA enters, for the main view only
- `2025/11/2025-11-21.md` line 142 (owner to Copilot, "Based on those antigravity conversations ..."): "a final requirement for that high-utility main merged view is WCAG AA Level accessibility compliance. Right now, it is nowhere near that. ... the force-directed graph! ... because of its 3D exploratory nature, I'm okay if we don't hit WCAG AA compliance for that view. It's the main workhorse view that I'm converned with." **OWNER DECISION** (main view; force graph exempt).
- Line 1956: "Prove that it is WCAG AA compliant." Copilot's axe run (line 1993) found it not compliant; line 2011 names a 3.08:1 contrast on the "dark sidebar / blue highlight". **BUILT** (Copilot): contrast tweaks to the dark theme variables (`--bg: #18181a` etc., per the summary).
- Line 2495: "I went and checked the force graph and it appears to be rendering, and in two colors!" Line 4051: "Force Graph: Awesome as always! We'll maybe find some archetype assignment issues if we explore it for color like crazy". **OWNER REACTION.**

### 2025-11-24/25 — direction gets colours; the blue and teal-green are Copilot's choice
- `2025/11/2025-11-24.md` line 221: WCAG AA as "an enormous amount of low-hanging fruit".
- Line 465: "It would be absolutely fantastic to see different line colors for inbound versus outbound connections relative to the focused element in the Local View." **OWNER DECISION** (that the two directions differ; no colours named).
- Line 486: Copilot proposed "inbound = teal, outbound = amber" (per `AI-Agent-Workspace/Research/2026-09-29-bearings/readers/2025-11-20-to-24-local-map.md` line 74) and then **BUILT** something else in `2e41d7b6` (2025-11-25): blue `rgba(0,145,255,…)` for "outbound", teal-green `rgba(0,211,170,…)` for "inbound", on pins, wires and legend, each with a soft glow. These are still `--color-outbound` / `--color-inbound` in `packages/explorer/src/client/styles/theme.css` lines 13-16.
- Line 928: "A legend would be useful, especially in cases on both the Circuit Board and Local View where different colors mean different things." Line 1278: "The new legend sure looks gorgeous though!" Line 1304: "The legend is fantastic". **OWNER PREFERENCE** for a legend of colour meaning.
- Line 2818: "Misalignment in the local view -- cool red line on one of these links??" (a "missing dependency" red edge, agent's).

### 2025-12-03 — inputs left, outputs right; "however you want to color code that"
- `2025/12/2025-12-03.md` line 191: "a gorgeous purple "test-backed" appearance in some `Extension` code". **OWNER REACTION** (test-backed purple was the agent's; liked).
- Line 528: "We should see the green dots of symbols being connected back to their inbound dependencies and we should see blue dots of symbols connecting outward to their outbound dependencies." First owner use of green = in, blue = out.
- Line 742: "Uh, yes. Switch these. For sure. Inputs are left, outputs are right."
- Line 794: "Remember: Input = left, Output = right. However you want to color code that (which is green versus which is blue) is A-okay by me, but stick to it: Input = left, Output = Right." **OWNER DECISION**: sides fixed, colour choice delegated, consistency demanded. Copilot's reply (about line 891 of the same file) classified "inputs" as inbound (green), "outputs" as outbound (blue).
- Line 984: "you threw out the directories. ... An audio engineer will tell you that it's far better EQ practice to trim what you don't need versus boost what you like." The EQ rule's first form, about cutting structure (whitespace), not colour.
- Line 1075/1087: a "ghost green line" (animation artefact).

### 2025-12-04 — green-left/blue-right made explicit; wires blue to green; CSS theming asked for
- `2025/12/2025-12-04.md` line 116: "This should help the eye easily understand that green (left) means in put and blue (right) means output, and that a single symbol can carry those two colors within it." (The pin-to-name connecting lines were tried and reverted at line 234: "Big regression".) **TRIED AND REJECTED** (owner, as "a little messy", line 146).
- Line 1416: "we should always always always draw **from** blue (pin on **right** side ...) **to** green (pin on **left** side ...)". Line 1559: "How do you not see it?" **OWNER DECISION**: a wire runs blue → green.
- Line 1561: "extract out the common CSS for color schemes, fonts, spacing, that kind of thing (general common theming)". **OWNER DECISION.** **BUILT** (Copilot) as `theme.css` and per-view CSS files (`4504d36a`).
- Lines 1657, 1742, 1969, 2303, 2826: the "test-backed" purple glow drawing above nodes; "the visual effect previously was much more subtle and **actually drew behind**". **OWNER PREFERENCE**: test-backed should be subtle and behind.
- "Alchemy" glow on a pin with many inbound wires (Copilot, Turn at line 116 "The symbol alchemy bit you did looks great!"); later removed from tuning (2026-03-27.1.md line 2385 calls the checkbox "unnecessary").
- Line 2826 / `2025-12-06.1.md` line 824: Circuit Board wires were "so noisy that we cut it in favor of highlighting related files with dependency-relationship-colored highlighting". **TRIED AND REJECTED**: drawn wires in the Circuit Board; colour highlighting replaced them.

### 2025-12-05 — Internals black box; contrast
- `2025/12/2025-12-05.md` line 3744: "I overall really enjoy the styling of "Internals". It's clear that that is a node that's distinct and different! It sells the "Black Box" look well. The only minor qualm I have is the readability/contrast with the background is getting a bit low. Let's try to keep the text styling the same". **OWNER PREFERENCE.**

### 2025-12-06 — every wire a gradient; semantic wire colours appear
- `2025/12/2025-12-06.1.md` line 1040: "Why do our lines not always _begin_ blue and _end_ green via some gradient? Every output becomes an input somewhere else ... They'd blend right into the pins they start at or terminate at, always." **OWNER DECISION.** **BUILT** (Copilot, `46a168e6`), a blue→green gradient (`rgba(0,191,255,.85)` → `rgba(0,255,136,.85)` per the summary).
- Line 1232: "for Asset archetyped nodes, we just... put a green dot on the opposite side of the blue dot at the nodewide level?" **OWNER DECISION**, built.
- Line 1789: "So a hot pink line indicates an "Extends" relationship ... I've seen an occasional gold line". Copilot had coloured relationship kinds (pink extends, amber implements, cyan type references; `98dd3896`). **BUILT** (agent).
- `2025/12/2025-12-06.3.md` line 282: "CSS styles declare colors without relying on a common set of theme colors with specific color semantic _meanings_, even though we actually do have a robust system of meaning based on color!" **OWNER DECISION** (semantic colour variables).

### 2025-12-07 — "fade the irrelevant", the 10/80/10 gradient, one colour per role
- `2025/12/2025-12-07.1.md` line 2265: "Would be nice if we could guarantee blue on top line, pink on bottom line for Dependencies section" (detail panel). **OWNER PREFERENCE.**
- `2025/12/2025-12-07.2.md` line 1118: "All standard connections begin blue (output pin) and terminate green (input pin). Very odd that we would call blue the target and green the source."
- Line 1322: "Perhaps the symbol name or its bounding box glows in some way in tandem with partners ... highlighting symbols which relate to the currently hovered symbol would almost certainly be just plain good UX".
- Line 1567 (quoting the agent's "Potentially dim unrelated connections"): "SO SMART! YES! I love this! Yeah, we definitely have an overall color excess problem in our visualization. The idea that we could fade the irrelevant instead of boosting the relevant would be precisely in line with the anecdote I gave about audio engineering an EQ many chats ago (don't boost what you like, cut what you don't). ... I  struggle to imagine what the visualization would look like any more glowing or vibrant than it is now!" **OWNER DECISION**: fade the irrelevant. (The idea was the agent's; the owner adopted it.)
- Line 1569: "a connector line is 10% blue, 80% gradient blue-to-green, and 10% green ... Should hopefully reduce the number of simultaneous colors we're looking at too." **OWNER DECISION.** **BUILT** (4-stop gradient).
- Line 1881: "the dimming effect on the other symbols is a bit extreme. Let's soften the amount". **OWNER PREFERENCE**: dim, but not too far. Tuning sliders Hover Dim (Symbols/Lines) later defaulted 0.4, then Symbols 0.5 (`17df22a8`); the owner's own values at `2025/12/2025-12-07.3.md` line 980ff.
- `2025/12/2025-12-07.3.md` line 134: self-reference ("French Corset") stubs "should have the same color as the pin they connect to ... they are some kind of inbetween grayish-blue right now ... it causes more color difference to the eye than I'd like, and that leaves the user putting more of their attention there rather than less". **OWNER DECISION.**
- Line 336: "We may wish to rethink the choice of having different line colors for different connection types, and should perhaps allow the colored badges on the public symbols themselves tell the story of the type of connection they hold. It is leaving us with too much visual noise". **OWNER DECISION** → withdrawn next day.

### 2025-12-08/09 — semantic wire colours removed; theme consolidation; a light theme deferred; no emoji
- `2025/12/2025-12-08.1.md` line 862: "removing the semantic coloring for different relationship types (Extends, Implements, etc.) in favor of keeping the connection colors idiomatic and common ... We might discuss a future where we can leverage those semantic colors in some other way on the connector (i.e. a special glow) but for now, we're trying to keep the connectors pretty uniform (Blue output to green input, 10% full color at either end, 80% gradient between, total 4 stop gradient -- self-reference "Nubs" just get the solid color of their pin". **TRIED AND REJECTED** (per-relationship wire colours: pink extends, amber implements, cyan type references), **BUILT** removal `ddc280ba`. Reference badges kept the semantic colours.
- `2025/12/2025-12-08.2.md` line 916: an aside likening a wrong centre-of-card connector to "a bright purple default texture" (missing-texture purple). Not a palette decision.
- `2025/12/2025-12-09.1.md` line 393: "It's okay to do some color collapsing for better readability ... If the color was intended to be a "shade" of something, would it be wiser to implement it as a "shade" of a theme color via CSS?"; JS may keep "its own necessary hardcoded copy of the two semantic input/output colors". Line 407, on "a light theme toggle": "That would indeed be very slick, but it's an extra. We can worry about that in a commit forward **unless the principle of doing it right, once** hits you hard". **OWNER PREFERENCE**; Copilot did not build a light theme. **BUILT** `17df22a8`: ~30 semantic variables, ~65 hex colours replaced.
- Line 932: "Please remove the pin indicator -- retained highlighting or a special box border glow on the symbol's _row_ itself would be sufficient. Emoji indicators are rapidly falling out of fashion." **OWNER DECISION** (no emoji; glow on the pinned row).

### 2025-12-16 — (not the owner) a NotebookLM audio overview
- `2025/12/2025-12-16.1.md` line 319ff: a pasted AI podcast suggests confidence as colour saturation, solid blue to "thin, dashed yellow" for LLM guesses. Not owner words; never adopted; the LLM path was later deleted.

### 2025-12-18 — clones
- `2025/12/2025-12-18.1.md` line 1573: "a future intention to add some kind of additional styling on "clones" to indicate some kind of quantum-in-two-places-at-once weirdness (secondary highlight? Little icon on the node? Something)". **OPEN** (never built).

### 2026-01-03 — archetype badges, without emoji
- `2026/01/2026-01-03.1.md` line 133: "would be nice to have some simpler badge-like or iconographic way -- without emojis -- of knowing whether or not a file is an Implementation, Test, or Asset". **BUILT** (Copilot, `8f5d2168`) as badges with colour-coded borders (the summary lists "Asset (orange)"), a third palette for kind (details panel) that differs from the 3D map's.

### 2026-01-08 — related documents: the owner asked for grey, purple was built
- `2026/01/2026-01-08.1.md` line 550, on edge styling for related-doc links: "Muted gray color and thinner lines is fine". **OWNER DECISION.** Copilot **BUILT** purple `#9966cc` nodes and links instead (`3a67f34e`); the deviation is recorded in `2026/01/Summarized/2026-01-08.1.SUMMARIZED.md` line 289 and was never put to the owner. The owner thereafter spoke of "purple dots" (line 1529ff) and "purple "Related Docs" nodes" (2026-09-27.1.md line 857; 2026-10-17 record line 581) without objection: de facto accepted.

### 2026-01-28 and 2026-02-17 — colour by cluster (an idea)
- `2026/01/2026-01-28.1.md` line 944: "Maybe some kind of utilization as a clustering/coloring methodology ini the force graph view? It's not totally settled". `2026/02/2026-02-17.1.md` line 446: "optional cluster assignment in the Force-Directed graph view (color by functionality cluster? Who knows)". **OPEN** idea. The co-activation clustering code was deleted at the owner's word on 2026-09-27 (`2026/09/2026-09-26.1.md` line 606: "Potentially a useful idea, but I'm happy to delete it for now").

### 2026-02-24 — multi-path rendering
- `2026/02/2026-02-24.1.md` line 3536: "your "Near-Miss +1" and "Symbol-Divergent Paths Through Same File" diagrams are absolutely awesome!" The design (`AI-Agent-Workspace/Notes/multi-path-visualization-design.md` line 200: "Each distinct symbol chain gets a unique color from a small palette (max 4-5 distinguishable colors)"; near-miss dashed/dimmed) is the agent's; the owner approved the diagrams. The Explorer doc (`.mdmd/layer-3/live-documentation-explorer.mdmd.md` line 262) says none is selected. **AGENT PROPOSAL, owner-liked, not built.**

### 2026-03 — the Membrane Map (Copilot)
- `2026/03/2026-03-17.1.md` line 1377: "How might we expect to cohere the visual language of the overhaul of the Circuit Board with the general aesthetics of the rest ... do our theme-like CSS files sufficiently provide what you need to avoid unnecessary duplication or style divergence?"
- `2026/03/2026-03-23.1.md` line 6932: "it would not surprise me if, in the future, we wanted to support RTL languages and simultaneously support flipping the visible dependency flow direction ... (read: WCAG level AA compliance is a strong strong bonus for our software but not yet an overt requirement; complying early, or at least planning for compliance early, may enable us to make wiser more elegant design choices early". **OWNER PREFERENCE** (WCAG downgraded to bonus; RTL flip foreseen, which would flip which side is green/blue).
- Line 2476ff: "we already have a visual language of "dimming" for connections which are not salient ... We should be careful that we ensure dimming/fading keeps the [meaning]".
- `2026/03/2026-03-26.1.md` line 2961: "Color me impressed!" (a figure of speech).
- `2026/03/2026-03-27.1.md` line 1350: "It's okay if we want to diverge away from the very light blue that stacks on the Membrane Map (and Circuit Board) canonically. Better readability is certainly preferable". **OWNER PREFERENCE** (the stacked light-blue directory tint may go).
- Line 1857: "Emoji in UI has rapidly fallen out of fashion as a telltale sign of "AI Slop". ... we should make every effort to minimize that", and asked the Membrane Map to "respect the "test-backed" styling". Copilot **BUILT** a gold border/glow for test-backed membrane cards (`3ee083da`); the summary wrongly attributes "golden" to the owner. Gold was later removed from the 2D legend sample on 2026-11-15 (purple restored).
- `2026/03/2026-03-28.1.md` line 265: "it would be preferable for the same style of border highlighting to occur in the membrane map as it does the local map (the membrane map one has a different color)." Lines 1957-1975: "Blue border around pinned symbols"; a green inset border that "looks like the DNA band of an agarose gel electrophoresis imaged sideways" should instead be "simply ... non-dimmed"; the dimming order of operations (dim all; undim pinned and participating; hover dims the rest). **OWNER DECISION** (one highlight colour across views; participation shown by undimming, not by a new colour). **BUILT** `da151a49` (layered opacity 0.3/0.2).

### 2026-09-26/27 — the new era (Claude Code, Fable): the visual law and configurability
- `2026/09/2026-09-26.1.md` line 489 (owner, 2026-09-27 01:31 UTC), quoting "The visual law (inputs left and green, outputs right and blue, at every scale) is now written as fixed": "Cool if the user can configure, but I suspect we'll want to have color coding for input/output connection points. I'm happy to be shown other designs. You could always whip up some HTML to mock things up". **OWNER PREFERENCE**: role colours stay; user configuration welcome; alternatives welcome.
- Line 610 (2026-09-27 02:20 UTC): "A master audio producer will prefer to cut frequencies they don't like rather than boost frequencies they do like during EQ." Said about deleting obsolete files, not colour. This is the sentence `Memory/owner.md` quotes under "Cut, don't boost".

### 2026-09-28 — the World Map board: white or dark, district tints, haze
- `2026/09/2026-09-27.1.md` line 1183 (14:11 UTC): "A cloud white blank surface upon which you plop isometric-looking markers is great too." Line 1187: "(of course if you prefer dark mode perhaps not a cloud white blank surface but a deep dark gray black background for those folks)". **OWNER DECISION** (white by default, dark offered; the agent built both, `98ccc1c2`). In that first build "Green rings are doors that serve, blue rings doors that call" (line 1237), the opposite of the Local Map.
- Line 1258 (15:01 UTC): "The color scheme is killer too. I sincerely appreciate the light blue for cloud and light orange for onprem. Those are the conventions I normally use in my diagrams at my firm. As far as visual nits, the light mode feels low-contrast, whereas the dark mode feels much much higher-contrast. I get the impression of a "haze" over the scene in the light mode default, but not in the dark mode. Not sure why exactly." **OWNER DECISION/PREFERENCE.** Light blue and light orange were the agent's picks, ratified. Line 1262: "the tutorial text in the lower-left corner is unwelcome. A simple question mark element in a corner ... is fine." **BUILT** `be984e79`: "The haze is gone. The board stays white; the page behind it is a darker grey, and the pieces' sides, outlines, text and shadows are darker" (line 1283); the board's legend panel removed for a ? help.
- Line 2068ff: "Might be worth packing along a few icon primitives ... give it a shape/icon ... (label the shape/icon primitive? maintain a legend?)". Led to the board text's **Legend**: a kind is any word drawn with a shipped shape or a tint (`blue`, `orange`, `green`, `grey`, `violet`, `rose`) — `.mdmd/layer-3/boards.mdmd.md` line 21. **BUILT** (agent): user-declared colour by kind on the World Map. The Legend is not yet written by the Explorer (line 66).

### 2026-09-29 — light outside, dark inside; the Local Map's colouring as the teacher; blue offers
- `2026/09/2026-09-27.1.md` line 2455 (owner, 2026-09-29 14:42 UTC): "I think that the overall visual style and sizing and spacing and coloring shown in the preexisting "Local Map" should inform a lot of improvements". And: "I quite like the defaults we have where the world map is bright and the local map is dark by default. I think that is a wonderful juxtoposition and gives one the feeling of inside-versus-outside. That said, I also love variations on light/dark and what they might "feel like" to any given user. For instance, if a user prefers dark outside and light inside, is the world, to them, empty space and the inner areas are the safety of the warm well-lit indoors? ... LLMs substantially lack these capabilities and can benefit from the instruction of how certain designs inspire certain human emotions." **OWNER PREFERENCE** (default pairing kept; per-person variation welcomed). Note: "set apart, not by one switch" in `Memory/ideas.md` line 82 is the agent's inference, not the owner's words.
- `2026/09/2026-09-29.2.md` line 1150 (20:46 UTC), on "should a wire's colours mean the same thing inside a system and between systems?": "Wonderful question! I love this! What are the pros and cons?" Line 1274 (22:46 UTC), on the agent's lean "make blue mean "offers" at both scales": "Offers!! I Like that! Killer terminology, yeah!" **OWNER DECISION**: blue offers, green uses, at every scale. **BUILT** `5db91c78` ("blue offers and green uses, on the World Map as inside a system").
- Line 1372 (2026-09-30 00:35 UTC), naming: "Gosh I hate the word "exposes" for its connotations, but for software I feel like that's the better term ... "Serves" means something very specific. "Offers" is an improvement, but it leaves an impression that someone "offers" something _intentionally_ ... reveal to a user how _exposed_ their distributed system really is! I don't know." The agent's answer (line ~1400): colours stay "blue offers, green uses"; board `Serves:` becomes `Offers:`; "exposed" a future finding. **OPEN** in part (the word).

### 2026-09-30 (Codex/Astra) — membranes
- `2026/09/2026-09-30.2.record.md` line 2150: "I don't know what the dotty green pattern means though." Line 2210: "a big blue box with like one or two implementation files". Reactions; no decision.

### 2026-10-01 — "don't be scared to let folks customize/configure"
- `2026/10/2026-10-01.1.record.md` line 500: "With respect to bundling, spatial layouts, angle-connectors and more: don't be scared to let folks customize/configure easily. I know the original Local Map had a "Tuning Panel" ...". About layout and curves; colour is not named.
- Same record line 556 lists among things thrown away: "per-type wire colours".

### 2026-10-07 — painted in the card's own colour
- `2026/10/2026-10-06.1.record.md` line 955 (Turn 14): the owner painted "some boxes with the sampled color used to block off some of the places where looping back looks incorrect (fails to go "behind" the card)". **BUILT** `1e74e493` (cut the laces at the card's edge). The gradient helper: "Savings savings savings! ... Love it!" (summary).
- `2026/10/2026-10-05.1.record.md` line 925 (Turn 16): "(and its purple glowing border, as this node is "test-backed")".

### 2026-10-12 — the seed of the 3D button's cue
- `2026/10/2026-10-12.1.record.md` line 169 (Turn 3): "If we wish to bring the user's attention to the "3D" button ... we could give it a little highlight when we pass some heuristic for when that would be useful (framerate problems maybe? hahaha!)". **OWNER PROPOSAL.**

### 2026-10-17/20 — purple related docs, grey assets
- `2026/10/2026-10-17.1.record.md` line 581 (Turn 9): "the purple "Related Docs" nodes only appear on the _very very last_ step" and "I no longer see gray "Assets" nodes in the 3D force graph. I used to see JSON files, html files ... as these gray nodes". The agent's later question whether to restore them "as a separate "text that isn't code" group, with its own colour and toggle" (`2026/10/2026-10-20.1.record.md` line 682) got: "I just want to make sure that we're not suddenly missing a whole class of file." (around line 705). **OPEN** (no colour chosen for text-that-isn't-code).

### 2026-10-23/24 — 3D legend truth; orange directories
- `AI-Agent-Workspace/Screenshots/2026-10-23/README.md` line 17 (root's review): the legend "promises blue/green offers/uses ... while the 3D picture uses gray reference wires, blue/green spheres, and orange hubs". The accepted remediation item (`.mdmd/layer-3/live-documentation-explorer.mdmd.md` line 57): "Preserve blue for the offering side and green for the using side wherever those roles are drawn; distinguish this from file archetype colours". Note this item already named the kind/role clash in October.
- `2026/10/2026-10-24.1.record.md` line 959 (Turn 13): "No visual "legend"/"key" contains the color scheme that it uses to distinguish files from folders (why not just have a color legend? I could be convinced that it's not worth the screen real estate, but I'm just thinking simply)". The orange Directory key had landed in `8376288b`. **OWNER PREFERENCE** (a colour key, simply).

### 2026-10-29/30 — "snow-white"; colour before geometry
- `2026/10/2026-10-29.1.record.md` line 207 (Turn 4): "make sure that the screen isn't pure-snow-white with connector lines".
- `2026/10/2026-10-30.1.record.md` line 106 (Turn 3): "any more geometric detail I think would be totally unreadable. I'm glad you're exploring this through color first. I think that's wise." **OWNER DECISION** (try colour for 3D direction). **BUILT** `34c44977` (root): each 3D wire green `#34d399` at the user, blue `#38bdf8` at the offerer, key row "From what offers to what uses". Same turn, on a help control explaining "the gestures and the colours": "Careful. I know this sounds stupid but people _just won't read text_" (owner.md).

### 2026-10-31 — 3D wire colour withdrawn
- `2026/10/2026-10-31.1.record.md` [#turn-1](../../../../10/2026-10-31/2026-10-31.1.record.md#turn-1) line 24: "the choice to use color in the connectors has unfortunately lessened the readability/interpretability of the graph. I think that there are simply too many connectors drawn in the average 3D local map scene to confer any ability for the end user to understand what color means on any one connector. ... We'll need to go back to the prior flat-ish color". **TRIED AND WITHDRAWN** (owner's eye). **BUILT** `49f495b9`: every reference wire white at a sixth of strength. Root's look: "the whole web is one cyan haze. The blue and green add up to a single teal" (line 88); the gradient read only on hover or a path (`AI-Agent-Workspace/Screenshots/2026-10-31/README.md`).
- [#turn-3](../../../../10/2026-10-31/2026-10-31.1.record.md#turn-3) line 125: on fading wires by distance/crowding into "haze": "Gosh, I'm not confident I agree with this either. ... 3D is kind of earning its keep". **AGENT PROPOSAL parked.**
- [#turn-8](../../../../10/2026-10-31/2026-10-31.1.record.md#turn-8) line 266ff: "we should get a glow around files which changed in a commit, which dims by the time the next commit's changes are played. Whether the "glow" is performed by dimming nodes which are not participiating in a commit or by finding some other way ... will be a matter of taste, and worth trying many permutations." **BUILT** `85ba619f`: Changed Files = Glow / Dim the rest / Both / None, Glow default.
- **OPEN**: how 3D carries direction (direction.md line 56).

### 2026-11-01 — white for a turn; fireflies
- `2026/11/2026-11-01.1.record.md` [#turn-3](../../../2026-11-01/2026-11-01.1.record.md#turn-3) line 337ff: "any node which was changed in a commit simply glows white for a turn. And then the next commit to play has them -- y'know -- back to their regular color." [#turn-5](../../../2026-11-01/2026-11-01.1.record.md#turn-5) (line ~388): "imagine history as a network of occasionally firing fireflies. Try to maximize surprise. THe sudden dim-and-undim is awful in practice. We can still play with dimming, but just not in this order." **OWNER DECISION**: white, held for the step, no ramp; **BUILT** with Glow default again (summary line 66).
- Line 532 (Turn 6): "if we can _detect_ such situations, that's the perfect time for us to highlight or call attention to, visually in some way, the "3D" button. That's truly what the switch from 2D to 3D exists for." **BUILT** (Codex/Astra, `c91c019d`, 2026-11-02): amber `#e9b86d` border/ring on the 3D button for backward routes.

### 2026-11-02/03 — colour on wires remembered; rings; glowing pins; colour theory
- `2026/11/2026-11-02.1.record.md` [#turn-2](../../../2026-11-02/2026-11-02.1.record.md#turn-2) line 115ff: "I know your pursued coloring the connector lines and that ended up being waaaaay less readable. We admittedly don't have enormous wiggle room due to the massive number of things we're trying to render onscreen at once. Discernment between these things is paramount." **Reaffirmation of the withdrawal.**
- [#turn-3](../../../2026-11-02/2026-11-02.1.record.md#turn-3) line 232: "the full graph is viewed, with pinned items just glowing? I can really see the use case for both." (Whole mode.)
- [#turn-10](../../../2026-11-02/2026-11-02.1.record.md#turn-10): ring on spheres with more behind them, "leaning towards B"; **BUILT** `ccf8b804`: flat ring in the sphere's own colour.
- `2026/11/2026-11-03.1.record.md` line 21: "really enjoying the ringed nodes on the 3D local map as eye-catching elements". Line 849: "From color theory to layout best practices to many other artistic-related ideas, I am nearly clueless to." (teach me). Line 1142: "Translucent skin and Clouded shell are my favorites so far, with Clouded Shell likely being the most favored due to its ability to _reduce_ the visible line density." Line 1232: "the 3D local map button glows".

### 2026-11-05 to 11-08 — highlight boxes, orange hubs
- `2026/11/2026-11-05.1.record.md` line 666-667: "the green and blue connector pins overlap the text"; "The blue highlight should be vertically thickening so it continues to encase its text". (The pinned-row highlight is blue in the owner's eye.)
- `2026/11/2026-11-06.1.record.md` line 246: "I have to look into the dimmed background to see those membranes."
- `2026/11/2026-11-07.1.record.md` line 390: "the green-highlighted black-box totally off-kilter ... I am neither a designer nor an artist."
- `2026/11/2026-11-08.1.record.md` line 932: "ringed circles on occasion (for orange Directory nodes specifically) rather than bags of cells".
- 2026-11-08 (agent): repaired correspondence "produced opaque amber disks; root rejected those pictures" (summary). Agent-rejected picture.

### 2026-11-10/11 — history inside bubbles
- `2026/11/2026-11-10.1.record.md` line 1122ff: "I don't see any of the nodes deep inside the bubbles lighting up". **BUILT** `52f8e705` (a changed file's dot white inside a skin). Root's note: "Glow's white dots are small at the overview's scale; Both reads most plainly" (summary line 83). **OPEN** then.

### 2026-11-12 — a stranger's review
- `AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md` line 153ff, finding 14: 2D card text at 3.3:1 (`rgb(108,116,132)` on `rgb(35,35,38)`), 4.4:1, 4.2:1 — below WCAG AA for small text. Line 257: the purple test-backed glow hard to match to its legend swatch.

### 2026-11-15/16 — tone, amber cue, Changed Files, cells by kind, the clash, the legend
- `2026/11/2026-11-15.1.record.md` [#turn-1](../../../2026-11-15/2026-11-15.1.record.md#turn-1) line 23: "In spite of this, the 3D button does not glow". Root's tone round (**BUILT** `1c5565d8`): file name `#f2f2f2`, symbol name `#ededed`, prose `#b0b0b0` (14.00/13.39/7.23:1), opened-directory outline `#3d3d45`; no wire glows; wires 0.7 at rest; nothing lit above rest ("fade the irrelevant rather than boosting the relevant"); legend sample for test-backed purple instead of gold (`.mdmd/layer-3/live-documentation-explorer.mdmd.md` line 140). Amber cue extended `cb6cec56`: "amber, never the pressed blue or the focus ring" (line 72; CSS `packages/explorer/src/client/styles/local.css` line 318).
- [#turn-2](../../../2026-11-15/2026-11-15.1.record.md#turn-2) line 241ff: "Looks pretty kickass. I know we chose to recolor nodes white so as to indicate the highlight, but if there is some way to preserve color information about what kind of node has changed while also attracting the eye to the changed file, all the better." **OWNER PREFERENCE.** Root then made **Dim** the default (`7f3e4160`; record lines 350, 432) after a side-by-side (`AI-Agent-Workspace/Screenshots/2026-11-15/changed-files-modes/README.md`). That default is the root's decision; the owner has not reacted to it.
- [#turn-5](../../../2026-11-15/2026-11-15.1.record.md#turn-5) line 355: "perhaps the amber indicator that 2D isn't cutting it anymore could also be an indicator to _us_ that we could tweak the layout preferences".
- [#turn-8](../../../2026-11-15/2026-11-15.1.record.md#turn-8) line 606ff: "WOW! I _love_ the splash of color those directories provide ... Yeah color for sure!" **OWNER DECISION**: closed-directory cells coloured by kind (**BUILT** `90bcd106`, Cells' Colour by kind default, one grey a choice; same table as the 3D map).
- [#turn-9](../../../2026-11-15/2026-11-15.1.record.md#turn-9) line 629ff: "I think the only conflict we need to resolve with the color version is the overlap between the left-right "input-output" color coding and the colors chosen for different file types. But I love that we can see at a glance that a directory is more tests than implementations, or more assets than tests, or more docs than assets". **OPEN QUESTION, named by the owner.**
- [#turn-10](../../../2026-11-15/2026-11-15.1.record.md#turn-10) line 650ff: "the language on the legend is so cringe hahahahaha! ... I still strongly strongly strongly continue to urge to minimize visibile words that come from _us_ ... layout and iconography and all the good design bits add up to something extremely intuitive." **BUILT** `e2ecaf52`: each legend row a sample and at most two words.
- [#turn-11](../../../2026-11-15/2026-11-15.1.record.md#turn-11) line 662ff: "these probes do not attempt to make consistent the coloring of these nodes inside the directories in 2D and 3D. Indeed, that was half my point: there is a preexisting color meaning conflict that is sitting in the 3D local map today. ... none of the screenshots help me see what a directory with many different types of files looks like (documentation, assets, tests, implementations). We need substantially more to even remotely confidently say that these colors work together. We'd need to see that across a ton of views. I think that if we wanted to avoid going down the rabbit hole of color systems today, the "B: implementation neutral, tests violet" is the best with respect to understandability of what's inside the directories, and "Today: implementation blue, tests green" is the most aesthetically pleasing based on the surrounding screen area (consistency with onscreen colors despite conflict of color meaning)." Probe: `AI-Agent-Workspace/Screenshots/2026-11-15/kind-palette/README.md` (amber `#ff9f1c`/violet `#8a5cff` was the root's pick, named on neither count; OKLab distances: offering blue vs implementation blue 12.7, using green vs test green 14.3, floor 15; test vs directory hub 2.5 under protanopia). Root took the exit: no colour system built (record line 1053).
- [#turn-15](../../../2026-11-15/2026-11-15.1.record.md#turn-15) line 1322ff: "Soooo much better! I see that the legend doesn't include color coding for the other file archetypes, but it's at least thinner and easier to understand." And: "I still see ringed nodes in the pathfind.ts link ... A ringed node is an old indicator for "this node contains more on click" -- but we had swapped for membranes." **OPEN** (known defect).
- `2026/11/2026-11-16.1.record.md` [#turn-1](../../2026-11-16.1.record.md#turn-1) line 18ff: "Today I want to do a comprehensive color design pass. What are the cumulative set of colors we use in the app? What are their semantic meanings? What alternative color pallettes can we provide the user which are also valid and distinct and capable of conveying the same information?"

---

## 1. Decisions in force

1. Inputs enter on the left, outputs leave on the right; colour by role, kept consistent — `2025/12/2025-12-03.md` lines 742, 794.
2. Blue = offers (the provider's pin/end, right side), green = uses (left side), at every scale including the World Map's doors — `2026/09/2026-09-29.2.md` line 1274; built `5db91c78`; earlier the blue→green wire rule `2025/12/2025-12-04.md` line 1416.
3. A 2D wire is a gradient blue→green, 10% / 80% / 10% — `2025/12/2025-12-06.1.md` line 1040; `2025/12/2025-12-07.2.md` line 1569; self-loop stubs take their pin's solid colour — `2025/12/2025-12-07.3.md` line 134.
4. One colour scheme for every kind of relationship on wires; relationship kinds live on badges — `2025/12/2025-12-07.3.md` line 336; `2025/12/2025-12-08.1.md` line 862; `ddc280ba`.
5. Fade the irrelevant rather than boost the relevant; dimming moderate, not extreme — `2025/12/2025-12-07.2.md` lines 1567, 1881; participation shown by undimming — `2026/03/2026-03-28.1.md` line 1965.
6. Colour lives in semantic theme variables — `2025/12/2025-12-06.3.md` line 282; `2025/12/2025-12-04.md` line 1561.
7. 3D wires are one colour (white), not coloured by direction — `2026/10/2026-10-31.1.record.md#turn-1`; reaffirmed `2026/11/2026-11-02.1.record.md` line 115.
8. History: a changed file stands out for the whole step, no brightness ramp — `2026/11/2026-11-01.1.record.md#turn-3`, `#turn-5`; keep kind colour if possible — `2026/11/2026-11-15.1.record.md#turn-2` (Dim default is the root's implementation of that, `7f3e4160`).
9. World Map: white board by default, dark on offer; district tints light blue = cloud, light orange = on-prem; light mode must not look hazy — `2026/09/2026-09-27.1.md` lines 1183, 1187, 1258.
10. Default pairing: bright outside (World Map), dark inside (Local Map); variations welcome — `2026/09/2026-09-27.1.md` line 2455.
11. Closed-directory cells coloured by file kind (same table as the 3D map) — `2026/11/2026-11-15.1.record.md#turn-8`.
12. No emoji in the UI; marks by glow/border/icon — `2025/12/2025-12-09.1.md` line 932; `2026/03/2026-03-27.1.md` line 1857; `2026/01/2026-01-03.1.md` line 133.
13. Minimal words of our own; legend rows a sample plus at most two words — `2026/11/2026-11-15.1.record.md#turn-10`.
14. One highlight style for pinned symbols across views (blue border) — `2026/03/2026-03-28.1.md` lines 265, 1965.
15. The 3D button calls attention (built as amber) when 2D can't read left to right — `2026/10/2026-10-12.1.record.md` line 169; `2026/11/2026-11-01.1.record.md` line 532.

## 2. Tried and thrown away

- Coloured 3D wires by direction (green at the user, blue at the offerer), 2026-10-30 → withdrawn 2026-10-31: "too many connectors ... to confer any ability for the end user to understand what color means on any one connector" (`#turn-1`); root: "one cyan haze".
- Per-relationship wire colours (pink extends, amber/gold implements, cyan type references), Dec 2025 → removed 2025-12-08: "too much visual noise" (`2025/12/2025-12-07.3.md` line 336).
- Grey-blue self-loop stubs: "more color difference to the eye than I'd like" (`2025/12/2025-12-07.3.md` line 134).
- Circuit Board wires: "so noisy that we cut it in favor of ... dependency-relationship-colored highlighting" (`2025/12/2025-12-06.1.md` line 824).
- Green/blue pin-to-name lines inside a symbol row: "a little messy" / "Big regression" (`2025/12/2025-12-04.md` lines 146, 234).
- Test-backed glow drawn in front: should be "much more subtle and **actually drew behind**" (`2025/12/2025-12-04.md` line 2826).
- A green inset border for participating symbols ("agarose gel"), replaced by undimming (`2026/03/2026-03-28.1.md` line 1965).
- History emphasis that ramps within a step: "THe sudden dim-and-undim is awful in practice" (`2026/11/2026-11-01.1.record.md#turn-5`).
- Recolouring only the selected node in the force graph: "unuseful for categorizing" (Antigravity 11-20 line 226).
- The light World Map's first contrast ("haze"), fixed by darker sides/strokes/text (`2026/09/2026-09-27.1.md` lines 1258, 1283).
- The World Map's first door colours (green serve, blue call), swapped 2026-09-29.
- Wordy legends ("so cringe") and on-screen tutorial text.
- Gold test-backed in the Membrane Map and in the 2D legend sample (agent's), replaced by purple 2026-11-15.
- Opaque amber disks for closed folders in transitions (rejected by the root, 2026-11-08).
- Agent proposals not taken: fading 3D wires by distance/crowd into a "haze" (2026-10-31 Turn 3); amber implementation + violet test kind palette (2026-11-16, named on neither count); teal/amber for in/out (Copilot 2025-11-24, not built).

## 3. Open questions and unanswered proposals

- The clash of file-kind colours with role colours (implementation blue vs offers blue; test green vs uses green), in 2D cells, 3D spheres, history, legend; the owner's bar: a directory with docs, assets, tests and implementations, "across a ton of views", 2D and 3D consistent (`#turn-9`, `#turn-11`).
- Whether the 2D key keeps a kinds row and lists every kind (`#turn-15`; direction.md line 53).
- How the 3D map carries direction without colour; how its web becomes legible (direction.md line 56).
- The Changed Files default (Dim, root's call) awaits the owner's eye.
- A "text that isn't code" group with its own colour (2026-10-20).
- Colour by functionality cluster in 3D (2026-01-28, 2026-02-17).
- Clone styling, "quantum-in-two-places" (2025-12-18).
- A light theme for the Local Map; per-person flipping of light/dark per scale (2025-12-09 line 407; 2026-09-29).
- RTL and flipping the flow direction (2026-03-23 line 6932).
- The word: Offers vs Exposes; "exposed" as a finding (2026-09-30).
- Semantic colours as "a special glow" on a connector (2025-12-08.1 line 862).
- Multi-path colour per symbol chain (2026-02-24; Notes doc line 200), not selected.
- Ringed 3D nodes still drawn where membranes replaced them (known defect, `#turn-15`).
- Low-contrast small text in 2D cards (first-visit finding 14); WCAG AA as a "strong strong bonus".
- Three uncoordinated kind palettes: 3D/cells (Bootstrap-like), the 2D cards' violet for tests, the details panel's badges (ideas.md line 160).
- The board Legend (tints per kind) not yet written by the Explorer (`.mdmd/layer-3/boards.mdmd.md` line 66).

## 4. The owner's taste in colour and contrast, in their words

- "letting folks see nodes and edges colored by salient information that their eyes can learn and adjust to" (Antigravity 11-20, line 226).
- "Not that we had a gorgeous color scheme on that to begin with." (same file, line 199).
- "a gorgeous purple "test-backed" appearance" (2025-12-03 line 191); yet "much more subtle and **actually drew behind**" (2025-12-04 line 2826).
- "we definitely have an overall color excess problem ... I  struggle to imagine what the visualization would look like any more glowing or vibrant than it is now!" (2025-12-07.2 line 1567).
- "Should hopefully reduce the number of simultaneous colors we're looking at too." (line 1569).
- "it causes more color difference to the eye than I'd like, and that leaves the user putting more of their attention there rather than less (a preferred amount would be _equal_!)" (2025-12-07.3 line 134).
- "the dimming effect on the other symbols is a bit extreme" (2025-12-07.2 line 1881).
- "the readability/contrast with the background is getting a bit low" (2025-12-05 line 3744).
- "The color scheme is killer too. ... light blue for cloud and light orange for onprem ... the light mode feels low-contrast ... a "haze" over the scene" (2026-09-27.1 line 1258).
- "a wonderful juxtoposition and gives one the feeling of inside-versus-outside ... the safety of the warm well-lit indoors" (2026-09-27.1 line 2455).
- "any more geometric detail I think would be totally unreadable. I'm glad you're exploring this through color first" (2026-10-30 Turn 3) → "waaaaay less readable" (2026-11-02 line 115).
- "pure-snow-white with connector lines" (2026-10-29 Turn 4).
- "simply glows white for a turn"; "a network of occasionally firing fireflies. Try to maximize surprise." (2026-11-01).
- "eye-catching elements" (rings, 2026-11-03 line 21); "Clouded Shell ... ability to _reduce_ the visible line density" (line 1142).
- "WOW! I _love_ the splash of color those directories provide ... Yeah color for sure!" (2026-11-15 Turn 8).
- "Today: implementation blue, tests green" most pleasing "(consistency with onscreen colors despite conflict of color meaning)"; neutral + violet most understandable (Turn 11).
- Self-description: "From color theory to layout best practices ... I am nearly clueless to." (2026-11-03 line 849); "I am neither a designer nor an artist ... borderline aphantasic" (2026-11-07 line 390).
- "Emoji in UI has rapidly fallen out of fashion as a telltale sign of "AI Slop"" (2026-03-27 line 1857).

## Also

- **User choice of colours/themes.** "Cool if the user can configure, but I suspect we'll want to have color coding for input/output connection points" (2026-09-26.1.md line 489). "don't be scared to let folks customize/configure easily" (2026-10-01 record line 500) was said of bundling, layouts, curves and the Tuning Panel, not colour. Light/dark per person (2026-09-29). Board text lets a person tint a kind (`boards.mdmd.md` line 21). The Tuning panel already exposes Cells' Colour (by kind / one grey) and Changed Files mode; the World Map remembers its theme. Nothing else lets a person choose a palette.
- **Colour blindness.** The owner has never mentioned it. The only measurement is the root's 2026-11-16 probe (OKLab, Machado protanopia/deuteranopia): test vs directory hub 2.5 apart under protanopia in the 3D map. Accessibility otherwise: WCAG AA for the main view (2025-11-21), force graph exempt; later "a strong strong bonus" (2026-03-23); contrast measured on the 2D cards by `tests/e2e/contrast.ts` (2026-11-15).
- **Exported/shared artefacts or printing.** Nothing about colour in exports or print found in owner words. A share link does not carry the Changed Files mode (root, 2026-11-15).
- **Icons/emoji and colour.** No emoji (2025-12-09; 2026-01-03; 2026-03-27); icons with accessible names over text; kind badges with coloured borders (Copilot 2026-01-03); the owner's 2026-09-28 "icon primitives" for board kinds with a legend.
