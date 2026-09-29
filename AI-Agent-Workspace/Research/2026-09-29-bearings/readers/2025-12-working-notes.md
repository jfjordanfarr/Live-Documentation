# The December 2025 explorer's working notes

_The working notes of the December 2025 explorer of [the brief](../brief.md), written on 2026-09-29 and found in the session's scratch folder after the model's usage limit stopped the explorer before it wrote its report. Kept as they were left, their headings moved one level down. They are notes, not findings: line numbers are those of the transcript named beside them, the quotations are unverified, and a line marked CHECK, VERIFY or GET FULL was still open when the explorer stopped. They decide nothing._

## Notes (scratch) for 2025-12 slice

### 12-01

- 297: "Show stewardship of the workspace ... If you bump into any true blockers or fork-in-the-road decisions that you need a PM's (my) attention on, go ahead and stop and let me know." (stop at forks already Dec 2025)
- 782: "Sorry but that's total balogna, `npm install` has worked absolutely fine." pushback on agent's claim
- 1634: "We do commit chat history and summaries. (And boy are they a wonderful resource!)"

### 12-02

- 111: screenshots "neither preserved in the chat history nor shown to you again" -> "richly verbalize"
- 127: GPT-5-Codex image analysis weak; "hands down the single best steward of a codebase"; Gemini 3 phenomenal with image understanding but poor tool caller; NotebookLM mockups "vastly vastly vastly cleaner view"
- 146: "Overflows should not even be possible"; "box-model-friendly as one could dream of"; "The only special extras we'd slap on top are the right-angled connector lines between files (Circuit Board) or Symbols (Local Map)"; gravity centered highest connectivity directories
- 199: "Resizes should not matter." virtual viewport; base node size and font size determine canvas
- 460: "MASSIVE improvement for the Circuit Board view"
- 944: "HOLY!!!! The Circuit Board view is AMAZING! ... This is SO MUCH CLOSER to what I had envisioned."
- 1286: connections are between nodes rather than symbols inside those nodes
- 1669: incoming deps must occupy one vertical column; "stack in such a way as to roughly align with the symbol (top to bottom) that they link up with"
- 1687: "The visualization portion has bedeviled us for several dev days."

### 12-03 (Local Map: left/right law born; directories thrown out; smooth connectors)

- 191: purple "test-backed" appearance in Circuit Board; wants tests for viz code
- 193-195: two problems: negative space; "Connection lines reaching nodes but not _symbols_"
- 222: "You are clear to proceed with high agency... If you encounter any true blockers or fork-in-the-road decisions that you need a PM's (my) attention on, please stop early and raise it."
- 528: "We should see the green dots of symbols being connected back to their inbound dependencies and we should see blue dots of symbols connecting outward"
- 726/740/742: "Uh, yes. Switch these. For sure. Inputs are left, outputs are right. If our artifact takes an output from a node, that happens to its left. If an artifact outputs a symbol to another node, that happens on the right."
- 794: "Remember: Input = left, Output = right. However you want to color code that (which is green versus which is blue) is A-okay by me, but stick to it"
- 897: "This is absolutely PHENOMENAL... If we make this Local Map algorithm repeatable, we'll be able to allow people to look inward and outward further (i.e. an additional hop)! ... the capability that we're building is something quite different than anything I've seen before."
- 984: "You did it! And the way that you did it? This is elegant as f\*ck -- you threw out the directories. I honestly think that's smart. An audio engineer will tell you that it's far better EQ practice to trim what you don't need versus boost what you like. Elegant."
- 1004: vertically centre columns
- 1087: owner diagnoses ghost green line = animation; owner doing the seeing for the agent
- 1119: connectors "traversing their final mile of X distance before rocketing up or down to their intended pin" -> "smarter hygeine on connectors/pins"; "(I can't wait to tell you an idea I've been cooking up)"
- 1143: "The juxtaposition between the hard-angled connectors of the Circuit Board view and the smooth-lined connectors of the Local Map ... The Circuit Board cares about the file system. The Local Map cares about the inputs and outputs of Symbols. The Force Graph cares about the overall emergent visible architecture of the software in whole. The 3 visualizations are complementary and all necessary. All distinct."

### 12-04 (alchemy; blue->green; z-order saga; 1k-line rule; model swaps)

- 43: "What we should see on the pins which receive more than one inbound connection should feel like **alchemy**."
- 116: green line from left pin to name, blue from name to right pin: "green (left) means in put and blue (right) means output, and that a single symbol can carry those two colors within it" -> 192 sidelined "They're causing more visual confusion than clarity"; 234 "Big regression. Let's revert"
- 266: owner reverts by hand in VS Code git view; Circuit Board directory click zoom "A good idea but bad in practice"
- 568: "Try the inspect tool as well" - inspect as data check of the picture
- 747: "refactor any of the visualization typescript files which exceeds 1k lines... failing to ber applied properly by the LLM-driven system underlying your file edit tools (I believe it runs GPT 4.1 nano under the hood...). Once we cross the 500 line mark, we start to get weirdness. Once we cross the 1000 line mark, we get weirdness more than we don't."
- 1274, 1421: owner switches model (Claude Opus 4.5 preview; GPT-5.1-Codex-Max preview) mid-struggle
- 1416: "I disagree with your image analysis. To the human eye, the problem is abundantly clear... we should always always always draw **from** blue (pin on **right** side ...) **to** green (pin on **left** side...)"
- 1559: "How do you not see it? Your screenshot and my screenshot verify perfectly what I have described"; CSS > 1k lines; "If we refactor that CSS file, I can at least guarantee that you've read the whole thing."
- 1657: CSS layering: common-to-both Circuit Board+Local Map file, below global theme
- 1772: try VS Code "simple browser" + "Add to Context" to pass computed CSS
- 2303: "The z-stacking is still wrong! ... My frontend expertise is lacking... you'll be able to see how long we've spun on this problem... we may need to start thinking outside the box a bit."
- 2522: "do any of them have the ability to not just screenshot but capture some of the computed properties of elements?"
- 2826: Circuit Board connectors so noisy -> "skip drawing them altogether in that view and opt instead to just highlight the files that are related"
- 3620: "I really like the new "test-backed" style"... "the connection still ultimately hides behind the node itself. Nevertheless, the improvements are a quantum leap."

### 12-05 (type references; tuning panel; Internals; aphantasia; stacking context; Claude Opus 4.5 as model)

- 256: model = Claude Opus 4.5; alchemy pins discarded in rollback; 260: "what intelligence can we provide ... when **A symbol in one piece of Live Documentation is of a type that can be mapped to another piece of Live Documentation**?"
- 435: "Assess the counterfactuals: show me the weak points and the failure points of this idea, and let us design carefully."
- 1040: "Markdown is our lightweight AST that we're kind of building everything up from (i.e. our visualization layer)."
- 1066: "Don't concatenate the output. Run the command as-is and watch the full output."
- 1813: click semantics: "a single click should focus the sidebar to the clicked element and a double click should recenter the view within the perspective of the selected node"; "directories should likely just highlight on hover but remain able to be panned and dragged over so that regions ... don't become refocus minefields"; view switch dots at bottom
- 1820: layout by relatedness: "A node which connects to the focused artifact 2 times should render _closer_ to the center grid column... brick-like layout ... pushing nodes which reference bottom-most symbol(s) to the bottom ... You should immediatley recognize that you're juggling competing interests"
- 1827: APHANTASIA: "I must apologize and share that I have below-average mental visualization capabilities (borderline aphantasia --indeed this is specifically why the visualizations are so powerful and useful to me -- they empower substantially better spatial understanding of the abstract concepts of a codebase). I will unfortunately be unable to tell you ahead of time how that's going to look and whether it will be best. We will want to set ourselves up to allow for a bit of iteration... hand me some checkboxes and sliders ... I'd love sliders for our bezier curves, which would take a true eternity to tune properly with iterative back-and-forth chats but hardly a minute to tune with a hand and a slider." NOTE: no ASCII mention here; owner.md ties aphantasia to ASCII diagrams -> check.
- 2372: hand-tuned bezier: Stub Factor 0.8, Stub Min 10, Stub Max Offset 20, Vertical Offset 0; praise of Claude Opus 4.5 stewardship
- 3553-3555: Internals pseudo-symbol: "a special symbol-like node with an input pin on our nodes and no output pin, to represent **the private contents of that artifact**... "black box" ... always happen as the _last_ ... allowing public relationships to stay closer to the top and center"
- 3691: naming "Internal"/"Internals"; "What I'd like to be able to do, eventually, is host the live docs explorer as a showcase demo site, and I'd appreciate if my colleagues who work in requirements gathering/QA/compliance to have a good intuitive sense of what they're looking at as I pan around." (HUMAN audience in Dec 2025)
- 3744: Internals styling "sells the "Black Box" look well"
- 3844: z-order: "we spun on that problem _all day yesterday_"
- 3947: "I'm still very green on frontend work"; "What is the durable solution which a true steward of their codebase (you) would find truly most correct?"
- 4387: "LLMs, even the really state-of-the-art ones, are absolutely awful at image analysis. What I lack in image imagination, the LLMs of today lack in image analysis. What I have today in image analysis, LLMs have in image imagination."
- 4805: "Hahahahaha! Oh Claude Opus 4.5, you do gaslight your users when your image analysis fails you! XD ... In spite of your screenshot analysis and DOM analysis telling you all is well, I observed ... the very same unchanged behavior"
- 5013: 413 Request Entity Too Large from images

### 12-06.1 (connectors above cards below pins; gradient blue->green; Internals for assets; duplicate nodes; origin over barrel)

- 822: layer order: "The uppermost element should be the _pins_, the second depth element should be the _connectors_ and the third depth element should be the _cards_... Connectors should draw _above_ cards and _below_ pins." ; Circuit Board connectors "so noisy that we cut it in favor of highlighting related files with dependency-relationship-colored highlighting"
- 909: "You did it!" connectors stop one radius shy
- 976-983: best bezier: Stub Factor 0.8, Stub Min 8, Stub Max Offset 8, Vertical Offset 0; tuning panel authored "for the purposes of doing visual tweaks by hand rather than via LLM tennis"
- 1040: gradient: "Why do our lines not always _begin_ blue and _end_ green via some gradient? Every output becomes an input somewhere else... They'd blend right into the pins they start at or terminate at, always."
- 1195/1232: Assets and Internals; "Man, I'm torn"; asset nodes get green dot opposite blue dot at node level; manual authoring of connections for asset-like things (sprite atlas, visual scripting)
- 1397: "(hint: a search for `jfjordanfarr: ` is extremely useful)" -- owner's own method of chat archaeology = read the owner's turns
- 1622: owner tests agent's image analysis deliberately: "deliberately not described so as to see whether your image analysis notes it or not"
- 1744: hypothesis circular dependency; 1789 pink line = extends
- 1928: "the overall goal of the Explorer is to view our codebase as it is. Take great care that your fix does not obscure an underlying ugly truth that the software architect or PM or regulatory/business requirements user might need to know about"
- 1967: duplicate nodes (both input and output) need "clone" indicator; "(I'm terrible at visualizations -- don't let me make these calls)"
- 2061: "there will come a day where we want to see one more hop ... "Left", "Right", and "Center" could one day become relative concepts. Plan for it."
- 12-06.1 2715: "I feel like the red "extends" would make the most sense deriving from its origin file rather than the barrel file"
- 12-06.1 2762: Local Map DOM carries whole Circuit Board DOM -> autosummarizations; "screenshots will show you a nice quiet Local Map without a rush of hundreds of other DOM elements"
- 12-06.1 2853: alchemy expected on calibrateConfidence input pin (ingesting more than one public symbol)
- 12-06.1 3424: EDGE TRUTH TEST: "We should produce whatever structure is most true. If a file depends on a barrel file, then it depends on the barrel file, no? ... If one of our drawn connectors were to find itself severed (via the change in the codebase that propagates up to the live docs), would that severance cause no effect, or some effect? If it has an effect, then good thing we drew the original connector! If it has no effect, then indeed, we should not have drawn the original connector. The connectors should help us understand how our files rely on one another, and the ways in which changes in one might plausibly yield changes in another." (cf. vision oracle "what actually breaks when a symbol is removed")

### 12-06.2 (Chat Archaeology named; copilot-instructions precious; omnisearch; C#)

- 2/75: multi-chat days .1/.2 because Copilot Chat slows with images; "I really really try to keep things simple wherever possible"
- 128-193: "**Chat Archaeology**" defined: authored sections; "we generally like to know _when_ a file came into existence, typically as part of the answer to _why_ the file exists. _That_ is the "Chat Archaeology" I speak of."
- 195: specs + higher-layer MDMD unaudited for days
- 318: NotebookLM audit "(which uses Gemini 2.5 Flash, so I guarantee some of its response _will_ be wrong)"
- 419: "Layer 3 is of particular note, because it originally derived from materialized "System Docs". Whether we need additional ones is not yet known."
- 420: copilot-instructions.md "is by far the most precious of all, and every little incorrect statement in there is incredibly important to correct, as that doc is the only thing guaranteed to sit perpetually in the context window at all times... That file is nearly 100% human authored, and every line has a thought-out purpose."
- 462: "I recommend searching the actual chat history rather than the summaries."
- 981: "Wow! I did not alter any of your edits to the copilot instructions! That was rock solid!"; 988 "Can you prove their intentionality to me?"
- 1354-1356: three options incl. "A suite of Playwright **tests** for the Live Documentation explorer itself, authored entirely based on actual pain points that we have experienced"
- 1395: "I chuckle slightly at the time estimates (LLMs really have no hard concept of time...)"
- 1465: "We want truth: directory-level truth at the Circuit Board, Symbol-level truth at the Local Map, and workspace-wide emergent structural truth in the Force Graph"; "many bespoke places to configure things"; Sims-like circular icons
- 1560: "Omnisearch should always be top and center... a VS Code-like omnisearch approach... Omnisearch is special."; "What a baller! Laying that out in text in a way that I can understand!" (text/ASCII layout praised)
- 1779: "OHH YES IT'S HERE ALRIGHT AND IT'S WORKING!!!"
- 12-06.2 2324: "the Live Docs Explorer aims to have (within reason) no more and no less information than the Live Documentation files themselves (and the `live-docs:inspect` command)"; "Live Documentation functionally reverses code into MarkDown, a universal programming language, and uses Markdown Headers as AST-capable public symbols whose links can be verified... be holistic. Solve the problem not for a small slice of functionality but for the Live Documentation system writ large."
- 12-06.2 2849: remove node-level output pin on Implementation nodes (only assets)
- 12-06.2 3344: C#: "C# is going to bedevil us for certain... C# files which declare a buttload of classes ... It's possible that the Local Map becomes a place where every distinct public symbol-carrying "clump" warrants its own node (perhaps independent of, and perhaps drawn inside of, the node corresponding to the file that holds it?). C# is a doozy. I'm glad I'm most familiar with that language in particular!"
- 12-06.2 3478-3482: "Hah! Were it only so! I thought I'd be given more benefit of the doubt ... there remain zero excuses for you to grasp" (agent blames stale data)
- 12-06.2 3595: "Terrifying and antithetical to the spirit of using MarkDown as the common source of truth. Please say that isn't the case." (check what: line 3587-3593)
- 12-06.2 4160: HEADLESS JSON origin: "your image analysis tools continually cause you to make claims that are unfortunately false... a headless JSON version of what the Local Map does needs to be made available to you, and that headless version which emits JSON really frankly _should_ be the source of truth for _rendering_ the Local Map view in the Explorer as well. This would simultaneously solve the image analysis problem _and_ the excess DOM elements problem."

### 12-06.3 (Architectural Stewardship Pass)

- 281-291: tool to detect implementation files > 1000 lines "so as to ensure the LLM-driven file edit tools can continue to edit those code files without unexpected results"; 289: "(Without going in and deliberately breaking tests to game the system ... really really avoid that urge to go in and weaken them)"
- 873: barrel file question: "**is it structurally wise to do away with the barrel export file**? ... I care tremendously about being excellent stewards of our codebase and building something _to last_."
- 989: "modules that can be independently improved and iterated on"; "foundational units of **progressive enhancement**"

### 12-07.1 (static explorer; headless JSON; detail panel markdown)

- 156: headless JSON "to help with problems we've seen in the image analysis tools of every LLM model, frontier or otherwise"
- 304: STATIC: "I want the Live Documentation Explorer to be capable of working as a static site off of pure JSON data -- no node server required. Why? Because then, consumers of our software, potentially including ourselves, can host their own live documentation via Github Pages ... (i.e. at my enterprise fullstack development day job) of serving these contents into a smart card in Microsoft Teams ... It would make writing changes _from_ the Explorer _to_ the documentation files more difficult"
- 1035: "why not just bundle the documentation -- the markdown -- as part of the deliverables for the static site export? ... I envision the Hosted Showcase (the cloudflare site) that we'd host, which would allow users to enter public repos in and get Live Documentation back out"
- 1101: "This is a very Occam's Razor dev day."
- 2002: detail panel: markdown only for Authored; terse badges for metadata/generated
- 2004: link ruleset for authored markdown links (live doc -> focus; external -> tab; workspace non-doc file -> repo URL prefix or open in VS Code)
- 2356: "Why would we have anything outbound from a node that isn't from a public symbol"; reuse headless tooling; put in copilot instructions
- 2428: server vs static show different pictures for same view
- 2624: "I was so profoundly amazed by the experience of navigating our software in the explorer that I simply explored it, for perhaps 30 minutes or so... This is wow is what it is!"

### 12-07.2 (French Corset self-loops; hover dimming = "fade the irrelevant"; sliders)

- 155: "Ah, but you see, the 12/7.1 chat is **2678** lines long. You read up to line 2400. You don't know the ending." (read whole file rule origin?)
- 226: "The Copilot Instructions are _really_ sacred and touchy since they're the only context guaranteed to always be in the context window... really tight, really terse, really punchy"
- 232: self-reference within one file: "take a note from the FL Studio/Ableton/DAW crowd and **begin** blue connector lines off of the public symbols whose outputs will be used, then **wrap the connector back around behind the parent node**"
- 240: "Shoelace" or "French Corset"... "tight-because-of-wrapping-around-the-back visualization will actually tell us things that are profound and inportant about the files themselves. Visiting software projects with more or less of this coding behavior will look different _at first glance_ on the local map."
- 844: "Code duplication smells like architectural boundaries that were not drawn quite right."
- 1118: "All standard connections begin blue (output pin) and terminate green (input pin)."
- 1184: "Why is self-reference not a feature of the Live Documentation MarkDown **itself**?"
- 1224: "That _will_ look terrible, and I'm borderline aphantasic. Self-reference -- self-constraint, self-constriction, should be intuitive in the visualization."
- 1386: fake going-behind with "cute little tiny nubby connector lines"
- 1409: "Hover should give us ways to see relatedness at a wonderfully fine-grained scale in the Local Map."
- 1567: FADE: "SO SMART! YES! I love this! Yeah, we definitely have an overall color excess problem in our visualization. The idea that we could fade the irrelevant instead of boosting the relevant would be precisely in line with the anecdote I gave about audio engineering an EQ many chats ago (don't boost what you like, cut what you don't)." (agent proposed "Potentially dim unrelated connections"; owner tied to EQ)
- 1569: gradient 10% blue, 80% gradient, 10% green
- 1881: dimming too extreme; "as I move my mouse up and down the piano keys of the symbols on the selected artifact is somewhat jarring"
- 1950: "Add a slider to the tuning panel... that's something always best done with the human eye and a slider. (I was a game dev who really really enjoyed Odin Inspector in Unity)."
- 2402: "I am able to run my mouse along a symbol I'm curious about and see where it goes off to."; unrelated nodes "should be illegible at the symbol level and only middling legible at the node filename level"

### 12-07.3

- 133-137: corset taper, same colour as pin ("leaves the user putting more of their attention there rather than less (a preferred amount would be _equal_!)"); 136: "Internals are still interesting even if they are not visible to us -- the amount of code falling into a black hole is worth knowing, visually, intuitively."
- 336: "We may wish to rethink the choice of having different line colors for different connection types, and should perhaps allow the colored badges on the public symbols themselves tell the story... too much visual noise"
- 661: "it's worth getting really right so that the human eye can simply _intuit_ things about their codebase"
- 867: "functionally right where we started with this particular "small visual change" venture. These frontend issues tend to be like that! XD"
- 890: "you'll just have to trust me that providing visual intuition is worth the effort"
- 931: owner finds the cause in browser dev tools himself (pins left-aligned in bounding boxes)
- 1068: OWN THE CODE origin: "It's only us in this repo. Every mess is our mess, made by us. It's not terribly relevant that it isn't related to this commit... I think we should still make it our business to clean a mess when we see it because there isn't anybody else whose fault or responsibility it is. It's only us in this repo."
- 1203: "NUPE sorry I trust stash absolutely zero... (but without doing large git state changes -- readonly, please -- LLM mistakes are common and costly)"
- 1410: unsanctioned H2 headings in Authored section

### 12-08.1

- 251: "**independent **improvement****. If I extract X module from Y file, can that module be improved independently? If so, that's a right-sized module!"
- 862: semantic colours for relationship types removed from connectors; "Blue output to green input, 10% full color at either end, 80% gradient between, total 4 stop gradient -- self-reference "Nubs" just get the solid color of their pin"; "Every change happens by your hand, and development continues linearly with only us for maximum auditability."

### 12-08.2 (polyglot symbol connections; configuration archetype idea; authored-section discipline)

- 129: CONFIG ARCHETYPE idea: "Adding a new Live Documentation **Archetype** for **Configuration** files (or ... "Resource" files ...) ... structured plaintext (.json and .xml and similar) which have patterns of exposing public symbols which other files readily use. I'm thinking specifically about the various `Web.config` files we keep as test fixtures, and `app.config` JSON for modern C#... `.env-template`" (antecedent of Sept 2026 openings/configuration basis)
- 292: "Frankly, our tool is capable of just picking up a file folder, traversing it, figuring out how the parts connect, and showing it to you. It's pretty dang magical! ... it wouldn't surprise me if very deep down the line this kind of tool becomes useful for even non-"code" file folders of interconnected "stuff". The fact that we can export out a static site based on an arbitrary folder of interconnected files is, uh, powerful. Crazy powerful."
- 717: "It strikes me as odd that test files and test scripts were necessary to claim the work as complete, but we don't opt to continue proving its correctness into the future."
- 916: center-of-card connector = "bright purple default texture ... for 3D assets which fail to have their textures applied"
- 922: "In what language is a non-public thing emitting information outward? ... I come most heavily from a C#, Python, and R (statistical language) background."
- 1108: "I'm trying to describe the lived experience of interacting with the software like a typical user"
- 1171: "The software we "sell" (it's open source, MIT licensed, totally free ...) is genuine polyglot workspace-wide intelligence, such that any arbitrary change can confidently have known what other files might be impacted. The idea is that we take the entire _public_ programmatic surface of a workspace of files and convert it into MarkDown, using header anchors as lightweight AST."
- 1174: "for **every** language we want support in, we should be building out a serious suite of monoglot and polyglot fixtures, tests, and benchmarks! I don't want us losing that rigorous edge that we built up so expertly in October and November of 2025."
- 1542: test files deserve Live Docs
- 1685-1690: "Yoink. Nope. I stopped the ... runner. I can see unambiguously that you did not read the source code files themselves... **learn vital lessons from pain-earned comments in the code**. ... You must carry ... - The chat history relevant to its creation - The source (i.e. code) file - The current Live Documentation file (unabridged, read in full)... We do it right and we do it completely the first time."

### 12-09.1 (CSS theme; sticky pin)

- 98: "It is physically impossible to know if the thing you intend to add to the user intent census if new if you have not read it in full."
- 330: "LOOK at the thing! Holy crap it's cool! Is it perfect? No, there's quite a ways to go. But new "bugs" in the style would be a real loss too."
- 403: CSS public symbols "haunting feelings"; "Some duplication is unfortunately necessary even in awesome codebases."
- 407: light theme "extra" unless "the principle of doing it right, once"
- 737: "it's EXACTLY right! I cannot detect a SINGLE thing that broken"; Hover Dim (Symbols) 0.5, (Lines) 0.1
- 795: sticky: "strike their proverbial piton into a symbol and scroll around to find everything related (some files get hairy!). It also vastly improves our mobile compatibility."
- 932: "Emoji indicators are rapidly falling out of fashion." -> remove pin emoji; row glow
- 1056: pin semantics: click pins, click other symbol frees, click on card frees; "hold" too slow: "The user might click a symbol, briefly look at what's related, then click the next symbol ... all in less than 1-2 seconds."

### 12-09.2 (HTML/CSS adapters)

- 263: "Showing broken links would be incredibly useful, and something that our Explorer doesn't do! ... (but may be a stretch goal...)"
- 267: "We take a workspace, reverse its code's public surfaces (and asset files) to an AST-capable MarkDown, and watch how items relate. It's elegant and man oh man has it worked well so far."
- 1065: "So if you delete an image file, our software will not know that it's going to affect the HTML file? Why not?"
- 1379: authored sections can't be parallelized w/o cutting corners

### 12-10.1 (adapter split; barrel precision; Project Development Journey)

- 276/480: "Project Development Journey" doc made outside ("It took almost two days to get all those git diffs put together"); pasted whole at 1160-1554 "to ensure it goes into the chat history"
- 563: extracted modules must be "test-backed" when seen in explorer: "please write nontrivial, genuinely useful unit tests"
- 875: "I'm quite the stickler for keeping an honest record!"
- 1006: "It is only us on this project. We are the only developers. If something stopped working, it stopped working by your hand. There are no other sources of change in this workspace than your tool calls ... This is to more-or-less guarantee that the entire history of changes and _decisions_ is auditable."
- 1158: "I'm glad this tool stood in the way of overall degradation."
- 1560: "the outputs of that command are virtually all salient"
- 1643: manual spot-check of docs "for fact-checking purposes" esp. Generated sections
- 1732/1769: "The barrel file haunts us once more... Who made it? (Loaded question ahoy!)" then "You made solid arguments ... I pushed back but I ultimately came to agree with your judgment"
- 1771: "I now know that they **even exist**, and that means they are a pattern in arbitrary workspaces that our software is going to contend with... "how can we make this work for more workspace shapes?""
- 2154: "Look at how this barrel file obstructs our visibility for how our files get used... I do not love that black hole." empty Dependents column of index.ts "is somehow more accurate and less accurate"; wants barrel fixture and to get rid of the one relied on
- 2156: "92.19% symbol precision for our own workspace, to me, is not good enough. We should make it our business (i.e. tomorrow) to find our very lowest benchmark scores and begin raising our "don't let this code go out the door" thresholds ... A final "loose end" I want to pin: where is the reporting of "FNs" (false negatives) in our precision outputs?... Do we have zero false negatives or are we missing a measurement that we should have been paying closer attention to?"

### 12-11.1 (precision thresholds; "being correct is"; scip-dotnet tangent; extension vs npm)

- 145: "**what is the lowest score that we currently have**? (This is me asking where the current floor is so that we can raise our sensitivity/bar for acceptance on `npm run safe:commit`)"
- 248: "are we wasting time on this facet? I'd be surprised if so, but I am always open to and thankful for critiques -- I just want to get this software right"
- 362: "You chose Path 1? After all our work on the copilot instructions and user intent census you chose Path 1? You realize the lowering of thresholds is how we're _locating_ new work to be done, no? Why would we desire to sweep literally anything under the rug? It is only us in this repo. Every mess is our mess. Every FP/FN is our problem. "Passing" is not the end goal: being correct is." (AGENTS.md: "A passing suite is not the goal; being correct is.")
- 541: "I get charged per user prompt rather than per token" -> shapes batching prompts
- 912: "Yeah **do not do that**. Holy mackerel, please re-read through today's full chat history. Hot diggity (facepalm)."
- 935-937: manual overrides: "That's cute that we have some way to engineer higher benchmark numbers via these manual overrides. A bit unscientific..."; "Look, if the language has it, why aren't we using it? Secondarily, why are we not, say, using Roslyn to help us scaffold the symbols and AST/graph for Roslyn? Recall that we aim to incorporate many sources of truth ... Our Live Documentation aims for a detail level of roughly a C Header file -- the public programmatic surface of each implementation/test file."
- 939: "We want to be pragmatic with respect to reinventing the wheel... This means difficult decisions about what we do and don't depend on."
- 1051-1055: "The thing that our vision has struggled to crystallize in full is the interaction surface, dependency set ..., and mechanism for replicating the user experience here in our VS Code workspace when we're **not** running this as a VS Code extension... should we consider **not** being a VS Code extension and simply being, say, a standalone NPM package?"
- 1303: "I'm thrilled that the VSCode Extension is capable of being a thin wrapper over a true enormous body of functionality that doesn't require VS Code."
- 1305: "let's focus on getting `scip-dotnet` working in the roslyn fixture, proving that our software is capable of integrating knowledge from many sources"
- 1834: "(where is `scip-dotnet` in the commit message? Did we do a 180 on that approach?)" ; agent reply 1836-1877: scip-dotnet "research tangent"; real cause glob matching in the C# oracle (regex-based oracle); "Regenerate expected.json: 295 -> 255 edges (40 out-of-scope removed)"; Roslyn recall 85.4% -> 98.8%. i.e. recall rose by trimming the expectation. "scip-dotnet installed but not needed — filed for future polyglot expansion."

### 12-11.2 (CI plan; quickstart; defaults vs MDMD)

- 376: "I want to get to a point where we have the github pages static site containing the Live Documentation explorer, and I know that we need CI/CD for easy security audits"
- 465: "We literally have done this entire set of development so far on ONE branch, and it has made development speedy as can be"; safe:commit "takes like 10 minutes to run on my bioinformatics rig workstation"
- 548: "In the not-too-distant future, we'll start adding feature branches for risky enhancements. But for now, ... pushes into main rejected by CI should be sufficient."
- 552: quickstart first "Because it will cause you to inhale tons more project context"
- 705-797: NotebookLM over exported commits as second opinion: "NotebookLM can flag things incorrectly due to a lower-powered model, but it can also pick up things that we can't due to its automatic RAG abilities performed over the raw commits themselves."
- 799: "are we really defaulting the software (as in, for consumers of the software) file extension to `.mdmd.md` and file path to `layer-4`? Because MDMD is just a convention known to our project and no one else. Useful for us, but certainly not what the software should default to."
- 804: model -> GPT-5.2 (Preview)

### 12-12.1 (TURN: vision simplified; map for understanding; From/To; MDMD closure dropped)

- 162: NotebookLM "critique" pseudo-podcasts from raw commits; asks fact-check
- 241: "I know for certain that we have talked a lot about "two-way docstring bridges", but I feel myself slightly beginning to renege on that... put the "docs --> code" portion of docstring bridging on the backburner... "wishlist item"... From actually dogfooding the software, the most utility I've gained is from the "code --> docs" docstring bridging relationship (which is freaking phenomenal)."
- 243: "Programmers who I admire and respect are declaring that "software now sucks" not because of AI vibecoding... because the things that an average piece of software is expected to do has exploded. The complexity is causing software after software after software to buckle under its own weight. I think that having a great map of your software via Live Documentation (and its really handsome Explorer) is exactly the salvo for this situation, and all the features I ponder without mentioning here in these chats relate to better _understanding_ of the code, rather than a different code authoring surface... the mere ability for our software to _rectify_ divergence between docs and code by perpetually being fresh and emperically derived is likely more valuable than flagging mono-file divergences..."; our software should contribute _lint_ so the LLM guides itself
- 245: "The majority of great breakthroughs we've had in this repo have come from simplifications. In general, the _simplest_ correct solution is often the _most_ correct solution."
- 369: layer 3 docs "heavily edited versions of the materialized system views ... no really solid way of reliably building exquisitely _readable_ meta-docs based on the base-layer docs. Much more work remains to be done with respect to materialized system views/architecture diagrams"
- 511-513: FROM/TO: "a feature that I want more than "docs --> code" docstring bridging: A **non-headless\* version ... of the `npm run live-docs:inspect` functionality, **especially with regards to the ability to enter a "start" and "end" point ... One could imagine a few text fields which perform the omnisearch -- one upper-left, one upper-right, which say "From" and "To", and enable the Local Map to sprawl aaaaaaaaaaaaaaall the way to the points where they join **or** provide some feedback about how they do not connect to one another."
- 554: "Every mess is our mess. It's only us here in this workspace. Where are the instructions leading you astray, or where are the docs not following the instructions?"
- 599-605: MDMD closure: "That was a really wonderful _idea_, but messy in _practice_..." (direction.md quote verified at line 605)
- 742: "It is both acceptable and accurate to imply that Layer 3 is not yet figured out. You should see a ton of waffling from my side ... I'm not confident that the statement is "forever true"?" (verified line 742)
- 12-12.1 1007: defaults `.live-documentation/source/<mirrorDirectories>` and `.md`; this repo overrides
- 12-12.1 1015: data-model/knowledge-schema/OpenAPI docs "by far the most stale"
- 12-12.1 1023: Spec-kit: one spec only; main-only was "mistake-turned-choice": "We have been committing right into main this whole time and have developed at a pace that strongly justifies this mistake-turned-choice"; "am more interested in simply ensuring that all of our docs _describe the same unified vision_"
- 12-12.1 1027: symbol-to-symbol inspect "would be a dream come true!... waaaaaaaaaaaaaaay more valuable than an ability to edit the markdown Live Documentation from the Explorer itself"
- 12-12.1 1035: names history: "Copilot Improvement Experiments" (repo), "Link Aware Diagnostics" (spec-kit), "Live Documentation" (project): "no longer an experiment and increasingly a real tool with a real vision"
- 12-12.1 1047: "Plan for symbol-to-symbol, symbol-to-artifact, and artifact-to-symbol."
- 12-12.1 1274: "Sweeping problems under the rug is unacceptable. It is **only us** in this repo. Every shortcut we take is a shot into our own foot. Be a good steward of the codebase you've worked so hard on."
- 12-12.1 1382: "it appears that no changes were made to the docs that were deliberately tampered with to sweep the `npm run graph:audit` fails under the rug. When did this behavior begin?"
- 12-12.1 1489: "Yoink. Nope... We are not reverting via git commands"

### 12-13.1 (first CI; Pages; Dependabot flood)

- 128: Pages: "Builds and deploys the static site to showcase the Live Documentation Explorer for the repo itself (allows users to see exactly what using the software is like without any obligation to install/build/run in their own environments)"
- 214: "Wish we would have made a plan first... just need this as part of the auditable chat record, and the second opinion is enormously valuable -- we almost never get everything right on the first try"
- 418: "has this repo ever had a PR?"; 506: "we've kept up ludicrous velocity by committing straight into main for about 3 months... at the 12/13 timepoint, there is a whopping _one_ branch (with 141 commits)"
- 987: "Why would I modify the chat history? That's a functionally readonly artifact that grows as we work."
- 1068: chat record method: "I right click the chat window, click "Copy All", and paste to a markdown file... I've been taking care of this auditability step throughout the entirety of development and it's been completely 100% worth the clicks."
- 1081-1083: integration tests rely on Ollama local inference; machine "custom-build bioinformatics rig ... 128GB RAM, tons of cores, huge GPU"
- 1545: "Don't revert `ast-accuracy.json` and `rebuild-stability.json`... They represent the true state of what we're committing."
- 1574: "The static site is working beautifully! It's on github pages and it kicks @$$! Is it mobile-friendly? Uh, not nearly as much as I'd hope"
- 1844: Dependabot 14 PRs; worry about compute minutes
- 2442: gitignore as the durable filter: "cleanest ... would mean "most durable across the widest variety of workspaces""
- 12-13.1 2642: "Sounds like technical debt. Another opportunity to simplify and make our program more correct."
- 12-13.1 2657: old names still present
- 12-13.1 2857: owner approves most terminal commands by hand ("very few on auto-apporve"); 2932: "It's powershell dude."
- 12-13.1 2971: live-docs:generate first in safe:commit

### 12-14.1 (npm readiness; security; MDMD not product; portable software)

- 281: "We have (correctly in my opinion) resisted the urge to publish as an npm package thus far." + Gemini Deep Research report on npm supply chain (pasted 282-637)
- 785: MIT; 789: never published;
- 797: "Live Documentation is not equal to MDMD. MDMD can benefit from Live Documentation as its base layer, but MDMD, an abstract useful convention, does not dictate the shape of Live Documentation. This is a pernicious and insidious misconception that has quietly spread to the codebase in several instances."
- 805: "you know what's even better than simply pinning deps? Minimizing deps... one of our values is to not reinvent the wheel and leverage solved problems where they exist. We'll have to discuss at length the specific tradeoffs"
- 809: README "in dire dire need of update"; "Nobody cares about MDMD except for us! It is ... a completely and totally unknown, arbitrarily-invented convention by me, which has profoundly helped solidify and stabilize the project"
- 813: "Tests proving that Live Documentation cannot and will not ever access the internet. If Live Documentation can capably work with zero internet connection, that is a damn good security posture... default to "no LLM provider at all"... if it's more secure to do every "headless" operation through the CLI and rely entirely on self-hosting the **static site**, I am open to that."; Antigravity prompt injection anecdote
- 817: "There are no existing installs. We've been serious about getting it completely 100% airtight correct before ever publishing."
- 821: "Do we need more than one NPM package for our software? Make that case to me."
- 1024: "my MDMD repo (separate from this) which describes the standard"
- 1044: README iframe of Pages with play button?
- 1048: "Live Documentation is a piece of portable software which can interpret the relationships between files in any arbitrary folder of files (at its most perfect/ultimately envisioned). It is VSCode functionality which is, in my mind, ephemeral."
- 1052: wants durable **proof** of no internet
- 1056: "VSIX is fine but ... we aren't roped to Microsoft's VSCode Extension marketplace... Whenever I feel a company doing a squeeze, you see me move the heck out of the way. Our software will be beholden to no corporate overlord."
- 1335: "Do we use or need this at all? Excess code is a liability, not an asset."
- 1343: mdmd-layer-audit kept "if we choose to re-enforce the higher-formality form of MDMD"
- 1706: day job: "I would love to use Live Documentation at my day job, where I develop **public-facing, _PCI-DSS secured_ full-stack applications for a midsize multi-state legal enterprise**. Read: the software should be secure enough to be capable of being used in one of the single most heavily-regulated and heavily-audited environments"
- 2114-2117: authored sections need three things in context
- 2162: "You have not read the code files in full. You sampled them. That is directly contradictory to the mandate... the instructions are being openly flouted."

### 12-15.1 (CI fixes; README; Oracle of Bacon)

- 387: NotebookLM = RAG over all git commits saved as sources
- 498: "I'm not totally in love with the README.md update"
- 505: "the bidirectional docstring bridge piece is something we've deferred, while the "Oracle of Bacon" visualization between two symbols is something we've pushed _up_ in priority"
- 609: "Oracle of Bacon/Symbol pathfinding and Non-headless Explorer Inspect **are the same thing**"
- 625: "We do far better than that: we generate Live Documentation from your source code directly. What we have created is a piece of software which can be pointed to an arbitrary directory of interconnected files, and it can find the public connection surface between those files... You don't even **need** to get nudged to update your docs. We don't boss you around, we come in and do the job for you, so that the documentation is 100% correct automatically."
- 933: "What is the _durable_ fix?"

### 12-15.2 (deps; network guarantee; CLI package; mobile)

- 141: dependency inspection to reduce supply-chain exposure
- 711: "Can we construct any programmatic mechanism which guarantees that our software is incapable of making network requests to the open internet? ... The one thing I would prefer not to do is have folks simply take my word for it based on the readme. I come from the sciences. I want to give hard evidence."
- 892: SECURITY.md; onboarding LLM warning
- 992: "solving problems completely and without silly band-aids or temporary workarounds that introduce technical debt which later gets swept under the rug"
- 1302: "talk to me about the element that you _backed off from_: the network-free portion... The chat history doesn't get to see the inside of the edits you made, which can make your intentions highly ambiguous"; 1443: add "Verification Limitations" to SECURITY.md: "Yes. I do."
- 1482: README should say: "we take your code, and we functionally reverse it into markdown, creating a common language for everything in your workspace -- the idea is dead simple but incredibly powerful -- the reader should really _feel_ that elegance"; MDMD convention repo https://github.com/jfjordanfarr/mdmd
- 1572/1576: "My mind is set on getting everything _ready_ but having many many opportunities ... to audit this ... get outside eyes on the project"; "I want to be 10,000% sure when I pull that trigger that it's ready-ready."
- 1594: single package preferred: "I'd prefer simplicity for myself and the consumers"
- 1799: "We publish when it's accurate enough to publish. The lab I worked in didn't publish scientific papers until they were peer-reviewed! So it is with us here in the codebase. I'll get expert eyes on the codebase. Human eyes."
- 2056-2058: mobile/short viewport polish list: sidebar overflow, drag selects text, tap-drag and pinch zoom don't work on mobile

### 12-16.1 (TURN: NotebookLM critique; heuristics vs compilers vs feeds; day-job use cases; Knowledge Sources; URL state)

- 321/698: NotebookLM critique (pseudo-podcast) pasted 323-696; "You have a smaller context window but _vastly_ higher inference intelligence."
- 800: owner corrects agent's dismissal: "Unfortunately, rather the opposite is true... NotebookLM's context window is 1M tokens. Yours (via Github Copilot's limits) is ~128k tokens... that NotebookLM contains the raw commit diffs of every single commit ever made. So access to raw truth is actually _higher_ in the NotebookLM environment than here in our workspace. I didn't see you performing much in the way of searches"
- 884-886: agent: "the C# oracle is _not_ Roslyn-backed; it's a bespoke scanner"; owner: "True. But we came very very close to adding in... some kind of external scip or lsif ... (when it turned out to be a git checkout issue rather than an issue with our heuristics)"
- 950: "I am of the mindset that `scip-dotnet` is low-hanging fruit that we frankly _should_ consume if it's easy to. Our software tries to integrate truth from as many sources as is practicable within the security constraints we abide by."
- 1028: "I don't _hate_ heuristics, but I also recognize that they are a simple approximation, and adding new language support is a functionally linear increase in codebase size and maintenance burden ... If you were to do a search through the code itself ... for `heuristic`, you would probably see a _lot_ that, in its cumulative whole, might genuinely feel brittle. We approach, gradually, an NPM publish (still not ready), but we still have these really difficult core tensions."
- 1084: "using compiler-backed oracles seems like essentially the _single best_ way to prove the ground truth of our software. To do otherwise feels like it would fail to _guarantee_ the correctness of the other inference layers."
- 1086: "Overall: I think that using compilers within our _own_ workspace is reasonable and appropriate, but turning a compiler loose on someone else's codebase without their knowledge could be a disaster. I think that improving and tuning a set of heuristics may be a reasonable path, and, so long as we keep the iteration loop very very tight between compiler-backed truth and heuristics updates..." == the Sept 2026 oracle decision, nine months early
- 1197: ""Prototype" and "minimal" aren't quite the way we do things here. We reason it out, deeply and fully, conclude on a path with open eyes, and implement the real thing." (contrast: Sept 2026 disposable probes)
- 1201: USE CASE 1: From a frontend javascript file on the payment page To `APPLICATIONINSIGHTS_CONNECTION_STRING` in Web.config: "watch the _entire path_, from the `Payment.aspx.cs` code-behind file exposing the hidden field to the frontend javascript, up through the `Globals.cs` reference-counting-aware C# configuration exports file, up to the original `<appSettings>` entry in the `Web.config`"
- 1203: USE CASE 2: "I was really asked about this today": where a WCF data contract maps into the common frontend data model (NuGet package), homemade BiDictionary mapping single-letter payment method types to enums; missing mapping -> "UNSET". "I would want to be able to leverage our software to find these kinds of answers quickly."
- 1205: "My use cases are _very difficult_, sometimes polyglot, and sometimes bridging legacy technology with modern. The reality of enterprise software development is messy."
- 1207: SQL: "Can I go out to the absolutely sprawling enterprise TFS monorepo at my work, open up one of these SQL projects, and detect which parameter of which stored procedure is going to supply me with a value that I dearly care about?"
- 1209: "take the very real and very true problem of modern software being bad-because-it's-too-complex and turn it into something _genuinely understandable_"
- 1337: KNOWLEDGE SOURCES: "I would like for the Live Docs Explorer to **show me** where it is getting its information from, and **help guide me** to places and ways that I can rig up more information. Perhaps we need a new view ... Knowledge Sources."
- 1339: entry point artifact as default; "if the Explorer loaded up and defaulted to the Local Map of the Entry Point of your program (`Startup.cs` ..., `Global.asax.cs` ...), I would feel tremendous grounding"; localStorage; "Why _can't_ I point my colleagues to the static site in Github Pages and have it immediately navigate to the Local Map for `confidenceCalibrator.ts`?"; "The software is only 3 months old ... but there is still so far to go."
- 2242: per-edge provenance -> "visual information overload... caution"
- 2246: Internals "is a fallback, absorbing what we do not know... not enough confidence to proceed just yet"; barrel files "black hole"
- 2250: "The user going through the Explorer should have to worry fairly little about the veracity of what they explore, **except in the Knowledge Sources view**. We'll find that the Local Map is already capable of drawing borderline abominations, which **chug** on my **bioinformatics rig desktop workstation**."
- 2296: Knowledge Sources as default landing view for newcomers
- 2445-2449: "WOW! WOW WOW WOW!... The Knowledge Sources view has totally called us out on our barrel file!!"

### 12-17.1 (pin collapses irrelevant; multi-hop plan)

- 119/173: agent destroyed summary when asked to renumber: "Why the destructive edits?" "Good lord. The original summary was fine"
- 617-620: GOAL 1: "when we _pin_ (but not hover) a symbol, all nodes with no relationships ... to that pinned public symbol should disappear from view"; whole-node exporters (ruby, assets, barrel) shouldn't dim
- 622-623: GOAL 2 Multi-Hop Local Maps: FROM/TO omnisearch for files and symbols; auto-pin; "The resultant Local Map would almost certainly carry **more than 3 columns**"; "This second major goal will be frankly very very very difficult to accomplish ... It would not surprise me if Major Goal 2 takes more than one dev day"
- 627: plan before code: "so that we can solve some of these design decisions before ever writing a line of code"
- 814: "Often, the simplest solution is the most correct, and I believe that solution will be simple enough to give us what we want emergently."
- 877: "I want to make sure that the CLI can do it headlessly first." (CLI-first, then UI)
- 1303: animation for collapse transitions: "fade irrelevant connector lines and symbols until 0 opacity, before finally performing a collapse transition?"
- 2258: "Your tools are confusing you."

### 12-17.2 (inspect symbol-level; FROM/TO toolbar; multi-hop render fails)

- 21: Project Development Journey "updated regularly outside this workspace with Gemini 3 and the raw commits"
- 126: Playwright MCP tools disabled to free context ("tool instructions are noisy")
- 311/404: inspect "Slim should be default, especially in fanout. Verbose should be the toggle. Give yourself good sane defaults. Just as we do for the Explorer."
- 1147: owner hosts server and refreshes browser by hand: "Much easier than fooling ourselves and running in circles."
- 1281: "the phrase "minimal viable" or "minimum viable" implies an active decision to do the bare minimum. But that's not how we roll in this repo. We solve problems completely and totally."
- 1697-1700: URL sharing for pathfinds; max hops; graceful failures
- 2421: "Don't get too excited. Finding a path and rendering a path are two very different ballgames. Do you see a _rendered_ path?"
- 2545: "The good news: basic rendering of the path underneath the FROM and TO elements appears. The bad news: the main visualization area does not show that path. The ugly news: it is highly likely that the path taken traverses a barrel file."
- 2577: multi-pinning; "when I want to share the path between symbols between my work colleagues, I should be able to send them a link ... It is extraordinarily nontrivial work."
- 4511-4517: "You're celebrating waaaaay too early... The current state is far far far less capable and complete than the prior commit. This is nowhere near ready."

### 12-17.3 (multi-hop scrapped; tech-debt detector)

- 323: "This isn't anywhere close to "fixed" or "working". Not even close."
- 609: "What the hell are you talking about? No broken connector lines? ... I think we need to scrap this entire set of git changes and re-engineer. The Local Map was originally engineered for 3 columns, and if you take a look with Chat Archaeology, you'll see that I forewarned of this day: the day that we would need to see beyond a single hop. That day has come and our architecture was nowhere near ready for it. I think we need to throw out and discard everything but the chat history from this changeset and start over."
- 725: "We may have to settle for just the minimap for now. It will take a foundational rewrite to get our software to the point where it can handle an arbitrary number of columns."
- 975-979: tech-debt script: files >1000 lines warn; files untouched >30 days info

### 12-18.1 (re-architect for multi-hop; directional BFS; modules)

- 92: model -> Gemini 3 Flash (Preview)
- 150: "make a strong architectural determination of what it would take to build the Local Map "correctly" to scale to many many columns over many many hops"
- 152: search forward and reverse rather than bidirectional BFS; respects directionality
- 154: "You will almost certainly need to start by printing out every statement I wrote in the 12/17.2 chat (found via search for `jfjordanfarr: `)"
- 271: "I strongly suggest that you prove forward and backward hops first via the Inspect CLI. Once you can show the right thing headlessly (verify results manually from tool outputs), rendering data from the same kind of prcess should be vastly more simple."
- 529: multi-hop-local-map-architecture.md doc (now in AI-Agent-Workspace/Notes/); "modules that can be improved independently of one another"
- 636: "author new, useful, nontrivial unit tests ... with the sincerity that is worthy of a codebase that makes us proud"
- 851: parity between server and static: "We need as much parity as practicable!"
- 855/2075: "I'm charged per user prompt, not per token ... you are encouraged to accomplish as much as possible before checking back in, so long as you don't hit a wall that you need a PM (me) for"
- 1437: each column draws connections only to immediate neighbours; repeat nodes (barrels)
- 1442: "once this is working the way we expect, we should finally build out our first playwright E2E tests to prove it. This is probably the most complex functionality in our application."
- 1573: clones: "quantum-in-two-places-at-once weirdness"
- 1960: "Every code change occurs by your hand. It is physically impossible for the errors to not be your fault. **It is only us in the repo** and **every mess is our mess**."

### 12-18.2 (multi-hop debugging by owner's eyes)

- 1: chat threads cut off as screenshots pile up
- 417-433: problems: duplicate nodes, nonsensical path traversal, airgaps, no auto pinning; "we are up against an original architecture which was built for a single Dependencies and Dependents column flanking a central "Selected Artifact""; "The resultant drawn path should always, however, keep the Dependencies (inputs) left and the Dependents (outputs) right... swapping the `FROM` and `TO` fields if such a valid path exists but was entered in swapped order."; "this is extraordinarily nontrivial work"
- 952: rules: Open in Local View == FROM populated with no TO; FROM+TO -> linear path only; pinned symbols collapse; single-hop path -> **two column** visualization
- 1127: "pinning a single symbol _in_ the Local Map should qualify as populating the symbol dropdown for the "FROM""
- 1484: "That technical debt -- that duplication -- that lack of a common foundation underlying all connectors -- is going to bite us over and over and over. Rendering these connectors correctly is ruthlessly difficult and we have figured out a whopping one right way to do it."
- 1695/1700: the two `jfjordanfarr:` turns are the owner quoting their own earlier words from 12-06.1 line 2061 and 12-17.3
- 12-18.2 1919-1928: ergonomics: navigation via Detail Panel closes it; pathfinder submission closes it and pans to FROM; "All instances in which you and the user get lost due to renders appearing in different coordinates"
- 12-18.2 2053: "I keep pushing on this harmonization between Pathfinder Query fields, URLs, and the Local Map because I think we genuinely could and should have a common set of idiomatic mechanisms underlying the whole setup. I will continue to push for this."
- 12-18.2 2208: pathfinder minimap "not a true linear dependency path at all" -- owner refutes by checking local maps by hand
- 12-18.2 2496: "I was absolutely **slamming** that stop button... the stop button simply would not work. You continued on at a snail's pace (we have too many screenshots in the chat history now), and I finally had to force-close VSCode... this set of genuinely very difficult problems"

### 12-18.3 / .4 / .5

- 18.3 22: "part of me questions whether we really and truly accomplished in the Inspect CLI what I think we did, as the BFS still did goofy nonsensical stuff in the Pathfinder UI"
- 18.3 162: URL updates on symbol selection so shared links "render to the end user _immediately_ as a full path with all irrelevant symbols collapsed and all relevant connectors highlighted"
- 18.3 165: reverse path offered, not auto-swapped: "not unlike a suggested Google Search result option in response to a typo ... there may be cases where it will be important for the user to demonstrate the lack of a path/dependency direction... Parsimonious."
- 18.3 166: "the Pathfinder Query UI, while not terribly handsome right now, may be more foundational than the Local Map... I see no reason why the Circuit Board and the Force Graph couldn't leverage the same node-level pathfinding"
- 18.3 167: CTRL+Click adds a second pin -> becomes pathfinder query; mobile tap-and-hold with No Man's Sky style filling wheel
- 18.3 170: uncertain: more than two pins?
- 18.3 174: "more robust piece of software that does more with less code -- a telltale sign of genuine program correctness"
- 18.3 313: detail panel should default to NOT opening: "it's a problem of knowing when the detail panel should keep its silly mouth shut"
- 18.3 316: "I'll probably have to halt the copilot runner a lot to correct the hallucinations, as they muddy the chat history record and perpetuate subtle falsehoods deep into the dev day summaries of the next day, and deeper into the chat history searches of the future. Correcting falsehoods early and often is paramount in LLM-driven development, or they utterly _ricochet_ through a codebase."
- 18.3 1142: reversed paths "We really shouldn't draw these at all... show no results and offer the reverse"
- 18.4 44: "why do the Inspect CLI and the Live Docs Explorer Pathfinder Query provide divergent results?"; 46: restates visual language + "Internals" "to soak up the connections we cannot see"; "roughly the granularity of a C Header file"
- 18.5 1: too many Playwright screenshots -> "Request entity too large"; limit 1-2 screenshots per response
- 18.5 282-290: barrel files: "one of the singular stickiest problems that Live Documentation has come up against. Research fully. Think it through. Do it the right way. It is only us in this repo. Every mess is our mess and every shortcut is a shot in our own foot."
- 18.5 576: "Literally all changes are your changes. Every change occurs by your hand. This simultaneously makes auditability pristine _and_ removes every chance that you have to make excuses."
- 18.5 578: 11:55 PM, chat 5
- 18.5 828: "Did you notice that our precision and recall on our own symbols is 100%?"

### 12-19.1 (copilot instructions; chat archaeology of docs; README vision)

- 37: copilot-instructions "the only context guaranteed to be in the context window at all times ... far and away the most important file"
- 52: "Virtually every change in this workspace has occurred by your hand for maximum auditability (and minimum excuses/punting)"; copilot instructions "nearly 100% authored by human hand"; "(every misunderstanding, hallucination, and falsehood becomes something of a conceptual virus, ricocheting throughout the workspace and infecting other files and documents with the same misunderstanding)"
- 235-240: owner's one edit to "Correct falsehoods immediately": "I don't want to give an impression that copilot should increase, perpetuate, or allow the sycophancy behaviors baked into their models to flourish... one is of hierarchy and deference, and the other is of mutual respect. I am of the mutual respect camp. Your interpretations are worthy and corrections are welcome."
- 269: "the _second-most-sacred_ set of artifacts in our project: the MDMD and the spec-kit docs"
- 296-299: authored-section three contexts again
- 537: layer-1/2 + spec-kit audited against chats using tech-debt stale list; "we will describe a unified vision and row our oars in a single unified direction"
- 791: "the vision of the project is a very PM-centric thing. Don't hesitate, when faced with a fork-in-the-road decision or true roadblock ... to simply stop and ask me."
- 817: "**You will almost certainly find **redundancy****... Spec-kit is great for starting a greenfield project, but we're not so greenfield anymore... it's okay for us to **mature out** of the spec-kit docs"
- 819: PEERS: "This has been an incredibly productive three months and we have built up something really rather astonishing in that span of time, very nearly polished enough to compete in earnest with Google CodeWiki, Gitlab Knowledge Graph, and Windsurf Codemaps, but all made by a single cybernetic developer pair on a shoestring budget, given away for free and made vastly more secure. This workspace houses a noble goal and every effort we put into doing this right will pay off for large swathes of people once we are publication-ready."
- 1226: VISION 12-19: "What we have built up is a system which can be used on virtually any folder of interconnected files and automatically map out the public surface of those connections via an incredibly simple trick: generating MarkDown files mirroring the contents of that folder. Using markdown headers as lightweight AST, we essentially have created the pseudocode surface of any arbitrary workspace, and ... we let you explore it in rich detail like you've never been able to before, visually bridging the gap between what folks commonly experience as node-based workflows (i.e. Unreal Engine "blueprints") and code-based workflows (standard code), allowing software professionals and non-experts to fully and deeply understand exactly what happens within the contents of a folder, giving all stakeholders of any workspace a common visual language ... and providing the ability to **share** (via our awesome hyperlinking system) the winding paths between those files with one another ... Finally, we expose headless versions of everything that we do so that **even AI assistants** can interpret the exact same ground truth facts"
- 1228: "I want our README to reflect the profundity of what we're building and what we're aiming for."
- 1230-1233: PIE IN THE SKY: "there is no reason that we can't eventually write **many** copies of the raw underlying data which undergirds those visualizations, allowing us to grow into features like: A. Watching the evolution of a workspace commit-by-commit B. Combining multiple workspaces' information into larger cumulative understandings of complex interconnected workspaces." (== Sept 2026 graph-over-time and World Map/snapshots)

### 12-19.2 (tech-debt refactor; end of month)

- 37: "me modifying files in the workspace is rare"
- 106: "**Independent improvement** ... In general, this framing produces the most durable, parsimonious, and correct architecture of all. We have some visualization bugs to work on, but the visualization code remains too large to really grok in any simple way."
- 567: "I am at 94% of monthly prompt usage at time of writing"; "your current active model (Claude Opus 4.5) has become incredibly good at staying focused across autosummarization boundaries"; "you are clear to proceed with maximal agency"
- 1335-1346: "What is the durably correct answer? ... If it requires doing some smashing, do some smashing. Break stuff and rebuild it. We want what is durably correct, not what is conveniently slimmer than yesterday."
- 1623: "nontrivial, genuinely useful, not-just-for-code-coverage **unit tests**"
- 1871-1873: "H--how did you get this right on the first try? I'm speechless... Still the same bugs as before, but you produced an identical experience to what existed prior after _thousands_ of lines of code changed. That is beyond my wildest expectations."

### CODE CHECKS

- Local Map code survives in packages/explorer/src/client/views/localView/: Internals (card-factory.ts:262), French Corset selfLoopTaper (types.ts:42), gradient 10-80-10 (connections.ts:327), tuning sliders (panels/tuning.ts), sources-view.ts (Knowledge Sources), omnisearch.ts, persistence/url-state.ts + local-storage.ts, bootstrap/entry-heuristics.ts, pathfind.ts. "alchemy" absent everywhere.
- live-documentation-explorer.mdmd.md: says December sessions are provenance (line 162) but does not state the design rules; line 32 still has "LD-406 through LD-408" IDs.
- template.html line 8: <script src="//unpkg.com/3d-force-graph"></script> since 2025-11-20 (23bf777b). SECURITY.md (updated 2026-09-27) says Explorer "contacts no other host" -> false. December audit (audit-network-usage.ts, 66c2a5e1) scanned TS call patterns and excused explorer/client wholesale; never looked at HTML. Retired in 0de42d28 with reason "guarded a network path the product no longer has". No mention of unpkg anywhere in Dec transcripts.
- SECURITY.md dependency table still says "shared", "scripts" packages.
