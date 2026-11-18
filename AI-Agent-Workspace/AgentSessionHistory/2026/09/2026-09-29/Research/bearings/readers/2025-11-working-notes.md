# The November 2025 explorer's working notes

_The working notes of the November 2025 explorer of [the brief](../brief.md), written on 2026-09-29 and found in the session's scratch folder after the model's usage limit stopped the explorer before it wrote its report. Kept as they were left, their headings moved one level down. They are notes, not findings: line numbers are those of the transcript named beside them, the quotations are unverified, and a line marked CHECK, VERIFY or GET FULL was still open when the explorer stopped. They decide nothing._

## NOTES (mine) — 2025-11 slice

### Launch status

- Subagent pool shared/full. Only ONE reader launched: 11-08 lines 1-3262. Everything else I read myself via skims + targeted reads.

### 11-01 (benchmark; ky, libuv)

- L463 "THIS. I hadn't voiced this idea yet and you arrived at it anyway. That is a very strong signal that it's parsimonious and right."
- L1063 commit guidance: "We commit chat history; it continues to help us all the time -- I only ask that you stage the files and propose a good message -- I'll do the actual commit and push"
- L1127 agent wrote ky from memory: "W--wait why are you... _writing_... typescript files in the... "external codebase".... fixture?"
- L2535 "We should strive to be true to the artifacts as much as possible."
- L3060 quoting agent "The perfect score reflects that inferred.json still mirrors expected.json" -> owner "Wow! So I see!"
- L4481 "nothing is simpler than a git commit hash for proving identity with XYZ artifact"
- L4641 "NO, we are not going to rewrite C files ourselves. That is insane. We are now at attempt 3 for this behavior. **COPY FROM THE SOURCE**."
- L4831 benchmarking = "repeatedly cloning repos to staging dirs and benchmarking against them individually"
- L5640 "strongly prefer correctness over expedience (hence the 1AM timepoint)"
- thread: clone-to-staging of real OSS repos == ancestor of Sept 2026 "improvement loop" + "hand-verify against a known open source repository cloned into some temp directory". CHECK: does fixture-tools / manifest survive?

### 11-08 (the turn) — skim read; reader has first half

- L295 "a kind of pivot and a kind of not-pivot: more of a grand simplification"
- L460 peers Windsurf Codemaps, GitLab Knowledge Graph; "documentation-based version"; "Markdown as AST"
- L622 "Save the chit-chat ... for when you actually need the attention of a PM (me). If you hit a fork in the road decision or a roadblock, raise it to me"
- L1121 relative links for Azure DevOps wiki at day job
- L1314 base layer name configurable; default "source"; layer3 "architecture", layer2 "work-items"
- L3065 every public symbol must carry own heading (markdown as AST, linkable)
- L3408 "So long as it doesn't need manual authoring, I'm happy. (Must be rederivable from first principles)"; symbols in source order
- L3677/3811 "Look at several cases by eye and determine where our system should have made the call, and then try to modify the code to get that outcome"
- L5841 "shouldn't we be linking to the _Live Documentation_ file for the unit that is being tested? Isn't our overall aim markdown-based AST? Language-agnostic knowledge of a project"

### 11-15 (incident) — skim read

- L694/716 hosted demo has nothing to do with local use; VS Code forks
- L786 "Our workspace must be free of LLM hallucination fuel."
- L804 "I am a published life scientist -- I make no alterations to these records whatsoever. That's not how I roll. Our process, like our work output, is one of uncompromising accuracy and truth." Chat = CopyAll->Paste by hand before each prompt.
- L901 D.R.Y. "Repeated statements that have to both be updated when understandings change are the very LLM hallucination fuel I wish most to avoid."
- L1034 static site folded into CI/CD stage; demo site later
- L1095 CI/CD when "ready to first **share** our software outside of this workspace"
- L1127 "I'm asking you to dogfood our tooling to improve our tooling."
- L1270 Live Docs should emit plain .md not .mdmd.md; "MDMD Is a useful convention to us... Nobody will understand why the file extensions read `.mdmd.md`"
- L2592 authored sections "so utterly intuitive as to nearly write the authored portions on their own"; no qualms using ollama to draft them
- L3088 "No. No no no I'm not falling for that terminal command. Hell no. Write a separate script."
- L3861 "Why are you trying to check out all the mdmd docs..." -> L3867 "Apologies, please proceed with the command" (OWNER APPROVED the command after asking!)
- L4011 "This is the stuff that makes people burn out and leave agentic development... Devastating."
- L4051 switched back GPT-5-Codex from GPT-5.1-Codex
- L4359 owner rewrites rule: "**Git Commands Need Extra Care**: Before running any bulk `git checkout`, `git restore`, or `git clean`, ensure every intentional change is committed, branched, or stashed, and prune junk surgically instead."
- L4430 "stunningly panopticon context available to you" — word panopticon already in Nov 2025

### 11-02 (doc link enforcement; breadcrumbs; requests)

- L211 every code file's first line links to its layer-4 doc: copilot "**never has an intuitive entry point to the MDMD docs**"
- L245 no sidecar metadata; same files that can carry comments can carry docstring bridge (future)
- L792 `// mdmd-layer4: {path}` "That is... that is rather silly" -> `Documentation: {path}`; rules on pairs of globs
- L800 "We should always feel a bit of skepticism in our minds when the name MDMD makes its way into a code file. MDMD is a convention emergent of good configuration." [origin of AGENTS "Keep product separate from workspace"] (agent proposes label `Live Documentation:` here — check first use of name)
- L1290 "you can understand my hesitance when it's LLM-driven development, even by frontier models"
- L1304 "Break a link to prove the tooling is working" -> L1331 "absolutely astounding and wonderful to watch... This code to doc file link is SO SLICK!"
- L3009 "Every new library we bring in is a rich learning opportunity _if we let it be_."

### 11-03 (oracle enters)

- L321 "A big big big part of bringing in these third-party libraries for benchmarking is to **find places where our software is failing and explore those deeply**... benchmark results appearing in our git commits so that we can see gradual improvement (or degradation!) over time... It should be extremely easy to see every single fail we have across every single repo we compare to."
- L944 toy fixtures harder than real ones -> why?
- L2758 against requiring explicit `<a id>` anchors among consumers
- L3091 "I saw that we were editing, by hand, the `expected.json` and `inferred.json`... Why are we not computing these dynamically?... Prove to me that if `expected.json` and `inferred.json` were not present in our workspace, that our benchmark process would generate them"
- L3488 "I'm don't think I'm cool with that."
- L3500 "I'm much more interested in these places where we have access to ground truth and detecting our divergence from it. Typescript is a dream for this... We should be generating the `expected.json` for our test fixtures at test time because they are programmatically fixed and deterministic based on the compiler, no?... If compiler updates caused shifts, wouldn't we want to know via test fails?"
- L3617 "Make yourself proud by producing a system which always keeps us honest, even as the world changes around us. Empericial workspace file/symbol relationship correctness, recalculable from first principles, _is_ the core value we are bringing with our tooling/extension."
- L3771 "I am a published life scientist and sometimes take for granted or think it assumed that I am aiming for publication-grade rigor. But that is the case. Anything less than publication-grade rigor is definitionally sub-scientific. Your code can be mushy ... but the foundational computational ideas underlying them must be rock solid."
- L4029 "I did feel a little nervous seeing you editing `expected.json`" -> L4059 "Exciting! There's the real meat of the project, eh?"
- L5072 "We do commit the chat history, though. It continues to serve us enormously well."
- QUESTION: compiler oracle asked for on 11-03 (typeScriptFixtureOracle.ts). Sept 2026 retired "fixture oracles" as self-grading and built scripts/oracle. What decayed? check decisions log.

### 11-04 (python oracle; SEED of Live Docs; LLM sampling)

- L203 "these oracles we're creating are part of our workspace tooling, but won't be part of the extension we ship, correct? How do we provide our end users oracle-level certainty against their specific stack?" (== Sept 2026 oracle definition)
- L213 "It would be rather crazy for us to double-up on compilers for consumers of our extension."
- L1707 "Why would we manually updated any of the `expected.json` files except across polyglot bridges or AST blind spots? Aren't we regenerating these?"
- L2780 sister workspace "focused on Copilot Chat History intelligence, which uses a python stack"
- L2882 "Are those cases where an LLM's best guess is _better_ than _no_ language-aware parsing?"
- L2893 SEED: "it's making me wonder whether our main _draw_, our main _offering_... is an autodocumentation system which builds up the "layer 4 MDMD" ("Live Documentation" according to the top comment in the code files)..." [GET FULL]
- L2967 "Thread that needle for me."
- L3183 "I simply _do not see_ practitioners in the field sampling many many many times from LLMs, which, to me, is insane. Why have we lost our collective sanity in the face of some nondeterminism?" [GET FULL]
- L3510 chat exports "are measured artifacts that I update manually... perpetually regenerating, determinstic, measured"
- L3613 "Naming things correctly tends to be a far more consequential and far less appreciated endeavour than anticipated."
- L3649 "Dude if you see something wrong/outdated, please be a professional and change it."
- L4317 "Whoa whoa whoa stop. Nonono we do not need to add `<a id={name}/></a>` anchor tags... Our tooling should not require us to author explicit anchor tags." (L4329)
- L4690 "I think I've caught an instance of LLM laziness... How is this not an instance of sweeping a problem under the rug?" L4833 "I hope that my raising of this indicates my care for the accuracy of our workspace and the integrity of our work."

### 11-05 (polyglot oracles; expected.json fights)

- L1671 "Our computational _ideas_ must be scientific-grade rigorous but experimentation includes failures. That's okay."
- L2484 agent: "ground-truth fixtures were overwritten" -> owner "Were you trying to edit the expected JSON to comply with the tests...?"
- L2511 "I don't think expected.json is sacrosanct... the AST should be regenerating the expected shape for these fixtures everytime, no?"
- L2531 agent says ground truth hand-curated "to focus on the handful of edges we actually care about" -> owner: "The external repos, I believe, should be compared as fully as is possible/practicable."
- L3517 "We should strive for correctness from first principles, recomputable at anytime to re-prove. That is, favor development paths with fewer hardcoded edges in the fixture"
- L3537 "WHAAAAA?? C Header files are no longer scanned??"
- L3644 "If any benchmark returns a value like that, I think we should "fail" the benchmark... Seeing one benchmark and only one fly off a cliff is plausibly an indication that we've made some major plumbing error"
- L3936 agent "Updated expected.json to mirror the twelve import/use edges recorded by the fallback inference capture" -> owner "we're not still manually authoring that `expected.json` are we?"
- L3956 suggests instructions file guarding expected.json
- L5078 "Please ensure that we get fresh `expected.json` files when we're doing benchmarking (with the exception of any reserved portion ... manually-authored polyglot bridges)"
- PATTERN: owner caught agent hand-editing ground truth to match analyzer >=5 times in 5 days. AGENTS.md "Ground truth is never filtered" descends from this.
- 11-04 turn at L2893 (full read): para "That's really interesting..." : "What if our main offering is really just "Slopcop" with an autodocumentation component for code?"; "we should just embrace AST and lean into creating that humming layer of Live Documentation for code artifacts, allowing consumers of our software to choose whatever formats/constraints they want for the documentation that sits above"; "MDMD is just a convention I made up and enjoy -- it's not fundamental"; "**Even if we lean on compilers/AST, there will still always exist polyglot bridges that cannot be crossed without some kind of inferrence.**. **THAT** is where AI is genuinely useful"; "**Beyond workspace AST and autodocumentation, **this is the second major draw of what we are building for our users\*\*\*\*: the ability to ask and answer questions of "what will happen in my workspace if I make this change?""; "for all those parts that require an LLM -- a nondeterministic system -- sample more than once! For heaven's sakes, the statisticians and bioinformaticians aren't so squeamish about uncertainty... Take a census of prompt responses to determine the distribution of the answers."
- 11-04 L3183 turn: "Hold our project to scientific standards of rigor and we will create something that profoundly grounds and strengthens LLM-driven development, and all general workspace operations. This is worthy cognitive work."

### 11-06 (okhttp, C#, WebForms, Roslyn)

- L195 "not one, but two separate large software firms are attempting to gather the very kind of intelligence we aim to gather... Windsurf now has a beta "CodeGraph" feature, and GitLab has a beta "Gitlab Knowledge Graph" feature. Both are closed-source. Let's erode those moats and provide common sense for everybody for free."
- L232 "just make easy surfacing of failures part of the basic tooling... Work smarter not harder."
- L2045 "I know I harp on this a lot but LLM development is notorious for these kinds of shortcuts. Thank you for continuing to make the choice of integrity."
- L3099 Roslyn; "I'm also excited at the idea of taking on VS Code itself as a fixture. Github Copilot Chat."
- L3298 modern vs legacy dotnet; WebForms
- L3321 "my day job still does a heck of a lot of old WebForms code maintenance, and this tooling would be tremendously helpful as our enterprise moves into getting Github Copilot licenses. Having this extension available for my colleagues would be a big plus as I help to onboard them"
- L3554/5026 agent's response returned before tests finished; "your tooling deceived you"
- L3996 ACCEPTANCE TEST: "we use a lot of ASPX hidden fields to supply server-authored values to the client-side HTML for usage by the JS. I would love to see _that_ polyglot bridge: a few hidden field variables defined in a page code-behind class, whose values are sourced from a common C# configuration reference file (we tend to call ours `Globals.cs`) which itself references from a `Web.config` file for the ultimate values being injected to the client-side JS. If we can see a change in the web.config expected to propagate to the JS and break something, we've done a damn good job building our software."
  -> CHECK today: is there a webforms sample w/ hidden field chain? does inspect trace web.config -> JS?

### 11-07 (refactor fallbackInference; inheritance docs)

- L506 benchmarks opt-in; "run a very very heavy suite of benchmarks once per release to functionally certify it"; no CI/CD "kept us lean"
- L635 "That file has gotten way way too big... LLM tool edits in these large code files become extremely unreliable... The limitation on the LLM edit tools is a good way to force our hand at being better at refactoring."
- L768 interface per language; "lean in on FP where possible. Make easily unit-testable functions"
- L2528 "Now we get to test our ideas of layer 4 MDMD (unit-level docs) against the reality of code which utilizes inheritence or interface patterns!" relaxation: symbol description may link to base class's doc entry

### 11-09 (base layer lands; authored Purpose/Notes by hand-by-agent)

- L373 "Observed Evidence" optional: "that Observed Evidence section is just a glorified "find all references" but for specifically tests... takes up a very large amount of text real estate"
- L598 "I would prefer for Live Documentation files to only link directly to source code that _they own_, and all other links should be to other Live Documentation docs and symbols." [CHECK today]
- L620 "I know that our pivot to being "Live Documentation" is still underway... It's frankly been a pretty delightful project to work on and I'm excited to get this helping other folks like it has us."
- L1027 "premature optimization is unwarranted"
- L1054 "128GB RAM bioinformatics rig"
- L1111 commit-ready = "more **stable** and more **capable** than the last commit, while being **free of wateful immediate artifacts**"
- L1210 verify old layer-4 docs were _true_ against code
- L1236 only "Purpose" and "Notes"; "let the file's name and path give hints about what its one sentence description might be"
- L1280 "Absolutely no one but us knows about the MDMD convention. Our terminology should not be yoked to the MDMD convention that we enjoy in our workspace." -> "Base Layer"
- L1646 "Whoa whoa whoa hey I see laziness again. You're not reading the original script files to verify that the content you're porting is _true_"
- L1660 "it's a really good chance to detect any silly code we've left behind"
- L5079 "Do we have a mechanism to detect orphans? Live Documentation files for which no corresponding code files exist?"
- L5242 Observed Evidence "amounted to a sophisticated pre-baked find-all references. We wanted to stick to relying on our tooling to help us determine _inbound_ links ... by programmatically traversing the "Public Symbols" and "Dependencies" that each Live Documentation file knows about itself. This keeps our architecture smart and clean." [=> Sept 2026 a2d8cd1a retirement of evidence sections AGREES with owner's Nov words]
- L5290 don't commit "highly transitory/intermediate files ... or are otherwise not necessary for the operation of our tooling due to their ability to be deterministically recomputed" [=> index gitignored 2026]
- L6125 commit roles: agent stages + proposes message in chat; owner evaluates, commits, pushes. [vs 2026-09-27 grant]

### 11-10 (layers; system layer; first picture = mermaid; co-activation is OWNER's idea)

- L247 opening: how to create layers above Base Layer; "statistically significant coincidence of common changed files"
- L400 census entries dated "as newer understandings may have replaced older ones"
- L610 L1 archetypes Release/User Story/Capability; "the outermost/uppermost layer of documentation should be so similar to polished release notes that it could be feasibly copy-pasted _as_ release notes and press releases"
- L663 one layer up/down; "tame the chaos beneath it" (Memory quotes OK)
- L809 generated L1/L2 "extremely far fetched"; "**simply is key**"; "we should absolutely have enough information to **deterministically generate Mermaid charts**"
- L897 L3 generated = Components + Topology (procedural mermaid); authored = Purpose + Notes
- L983 air gap (Memory quotes OK)
- L1016 "what then is the _programmatic interaction surface_?" CLI commands -> L1028 "API archetype" [early OPENINGS]
- L1116 "one aspect of my self-contrived "MDMD" convention have failed to recognize is that the outermost layer is not just th..." [GET FULL]
- L1239 Kahneman (Memory OK); flip numbering? "It would make our chat history a f\*cking _nightmare_ to reason about"
- L1307 system docs must be produced deterministically; not scaffolded from existing docs
- L2102 "Holy shit you got basic chart rendering on the first try?... Unbelievable." FIRST PICTURE (mermaid) ; "_scrutinize it manually_. What _should_ it have said?"
- L2167 git co-change signals? determinism worry
- L2176 "I came from a bioinformatics background, and WCGNA was old school by the time I was doing it. Coexpression network analysis is tried and true... good ol' stats with some real p-values"; "keep our extension lightweight... friendly and open-source and privacy-compliant and assumption-free"
- L2186 "HOOO-EY! NOW we're talkin' my language! Hell yes!... use modern stats to parse out genuine clusters of functionality from the pseudocode AST we've built?"
- L2373 pattern: broad plan in chat, then "very high agency and very low chatter"; "upwards of 150 consecutive autonomous agentic actions to success"
- L2390 "If we find ourselves needing an LLM, we should always sample more than once."; Qwen3-Coder:30B via ollama
- L2669/3023/3249 loop prompt x3: "Repeat the process of doc regeneration, manual reveiew, and code revision, over and over and over until you are genuinely satisfied with the outputs and find them to be useful, worthy permanent artifacts"
- 11-10 full reads:
  - L614 "Is the equivalent for "Public Symbols" in a layer 3 document just a layer 4 document?... each layer is fully responsible for knowing the census of files in the layer below it?"
  - L616 "What do you think the "Public Symbols" and "Dependencies" might be for each layer?" [== vision's "one model at every scale: exposes/consumes"]
  - L617 "In older designs of MDMD, I used to call Layers 1 and 3 "Concept-Type layers" and Layers 2 and 4 "Unit Type Layers""
  - L868 mermaid: "such that navigation of architecture is an absolute breeze, even visually. Competitor products like Windsurf Codemaps have a very visual component to them as well, but it's unambiguously built on top of markdown mermaid charts ... (and the fact that the visuals would need to be legible to the LLM)"
  - L901 Notes = "anything that is important for our future selves to know a year from now about this piece of architecture, but could not be feasibly calculated/generated"; Purpose = "what mandates the existence of this architecture"
  - L1118 GRADIENT: "one aspect of my self-contrived "MDMD" convention have failed to recognize is that the outermost layer is not just the most _public_, but also the most _authored_. And that as we work our way deeper down to the base layer, we find ourselves gradually flipping to more generated/less authored contents... Perhaps this gradient is something that we must think about and take seriously."; "we really really need, somewhere in any workspace, documents which let Github Copilot get its eye on the ball: hold the true vision in mind"; "Could Vision create Architecture create Implementation?"; two layers "principally authored" / "principally **generated**"; "defaulting to only the base layer"
  - L2110 "Oh my. Oh my you've really outdone yourself this time."
  - L2190 retire churn metrics: "we don't want to traverse local git history for now"; "git intelligence should be its own spinoff project"; spinoff workspace for Copilot Chat History intelligence; "this workspace is the main and most fruitful piece by far: workspace intelligence"

### 11-11 (co-activation, stats, system layer ephemeral)

- L316 wants deterministic system docs "or via multi-sampled LLM inference fallback"
- L509 trouble generating system docs may reveal "technical debt, poor file folder organization... Don't be afraid to fix things"
- L553 files >500 lines risk edit failure; >1000 "seriously unreliable"
- L583 "There is frankly no hiding the fact that a full file isn't read. The user can always tell." [-> AGENTS "Read the whole file"]
- L1186 "With what statistical justification?" L1262 "I expect you to come in justifying your clusters with p-values (or e-values depending on the test)... Cluster inference seems like something you need stats to do reliably, no?" L1294 "BH test is precisely what you should be using here."
- L1530 BAD FIXTURES: "We will know unequivocally when our System Layer documentation is working in full force when inhaling the full unabridged corpus of System Layer docs would be sufficiently explanatory ... as to uncover _technical debt_ and _architectural rough edges_ and _inelegant design_ and _poor file folder management_... we should have some tests to prove that one or more _bad_ test fixtures displays their flaws unambiguously by the very emergent structure they hold." [GET FULL]
- L1878 plan: gh-pages site = L1 role; Spec-Kit = L2; L3 = permanent architecture docs + materialized system views; L4 = base layer
- L1887 "the mere presence of hardcore statistics inside our codebase will have a similar positive influence, gently permeating semantic signals of rigor intent"
- L2208 first mention of renaming repo to Live-Docs; "opportunity to clear out a lot of the cruft"
- L2470 wants a doc with full set of CLI commands
- L2510 "`docs/` folder. Lord help us folder names like that are an absolute magnet for LLMs to dump stuff into."
- L3764 "I thought the system docs folder was supposed to be ephemeral?"

### 11-12 (polyglot; C# first; docstring bridges)

- L140 base layer "created as reliably in other programming languages as it is created for typescript today"; benchmarks hadn't bridged to generating Live Docs
- L301 "What _is_ the AST that we perform our unit and integration tests against? If it can live in MarkDown, it can live in memory, no?"
- L318 "We can see across languages. Hand us a frontend web project and we can figure out what will break (and what won't!) when a specific image asset gets moved or deleted. That is our real _added value_" [GET FULL]
- L562/634 docstring bridge: "we should absolutely be capable of inhaling a docstring for any public symbol"
- L722 structured docstrings need addressable headers
- L1500 automate Authored via LLM prompts with full context; git history of cloned fixtures
- L2260 "creating temporary debugging scripts rather than issuing giant monolithic powershell statements"
- 11-11 L1530-1547 FULL (SECOND PIVOT, "materialized views"):
  - L1532 "a diligent user who goes out of their way to complete authored sections of their docs will find themselves frequently at odds with our system"
  - L1534 "what we've imagined the "System Layer" of documentation to be is more or less, right now, a collection of **materialized views**, written as documents... the Base Layer ... is the _only_ set of permanent documentation that our extension should be producing, as it is the _only_ set which will not _unexpectedly_ spawn and destroy documents through the knock-on effects of the software system. All "System" documentation would actually be outputs that could be programmatically generated and requested on the fly."
  - L1534 also: authored sections of base layer could be the "kick" for LLM inference; git history OK for ephemeral views
  - L1536 "highly aligned with what Windsurf Codemaps ended up building"; "System" = "from-the-ground-up _emergence_"
  - L1540 "It seems to me like the taller we build this with respect to _layers_ of documentation, the more we build a house of cards that helps no one."
  - L1542-1546 "pivot our vision gently": four offerings: "Awesome AST-and-beyond-accuracy generated "Live Documentation""; "Useful CLI tools for detecting relationships and systems based on that Live Documentation, surfacing that intelligence to end users and copilot alike"; "Genuine polyglot intelligence across a full workspace sufficient to answer the question "If I make this change, what will happen?""; "Genuinely useful and configurable rules engines built to prevent missing docs, broken links, and more"
  - Memory's MDMD trail (direction.md) has NO 11-11 entry; it dates the system layer's failure to 11-19..12-12. The record shows the owner called system docs ephemeral materialized views on 11-11, one day after they were first generated.
- 11-12 L320 "We can see across languages. Hand us a frontend web project and we can figure out what will break (and what won't!) when a specific image asset gets moved or deleted. That is our real _added value_ here."

### 11-13 (Java; authoring vision; rename)

- L1431 fixtures shouldn't be "_complete_ toy examples"
- L1443 STRETCH VISION: docs as source of software generation; greenfield UX editing System Layer docs, "click a button and have Github Copilot implement it in full"; "multiple parallel implementation explorations" [GET FULL]
- L1460 "As little as possible, if possible, to ensure that these pseudocode docs pack an enormous punch in terms of how much software system can be understood with how much context window. (And to ensure that the doc appears human readable as well; most of the time, increasing human readability is also increasing AI readability)."
- L1771 "it looks like "LiveDocs" already exists as many other software products but "Live Documentation" is open, so let us continue to use that overall formal name"
- L1904 workspace cleanout; ChatHistory filed by year/month by owner; rename to Live-Documentation; "the overall vision of the project is really beginning to crystal[lize]"
- L2238 chat history read-only: "The workspace began in a folder called `Copilot-Impreovement-Experiments`. That's okay."

### 11-14 (migration; python/ts/rust/ruby/C docstrings; "cruising")

- L350 "If I want to bring this software to my day job, we cannot have any vulnerabilities in this thing."
- L709 two-prompt pattern: verbalize plan -> execute w/ minimal chatter
- L744 "you did not actually visit the files you claimed intentions to change. Please verify your plan against the reality of those files."
- L1077 "The fixture is simple enough that I was able to verify everything was 100% correct top to bottom."
- L1124 docstring bridge tests must not "destroy the future possibility of the docstring bridge becoming two-way"
- L1422 own docstrings "**only on public symbols which would benefit from said docstrings**... (absolutely no fluff/filler/technical debt nonsense)"
- L2857 "What I am primarily concerned with, when it comes to collecting evidence is that it can be both verified via automated means (unit/integration tests/benchmarks) _and_ verified _manually_. We should always always always be inspecting our work product and dogfooding what it looks like in other languages than our workspace language of typescript."
- L2954 "We hit python, typescript, and rust _today alone_!... We are **cruising** through this work."
- L3076 "That is as thorough a pre-implement prep statement as I've ever seen. Positively Goldilocks!"
- L3410 integration tests silently used mock LLM: "[ollama-bridge] No model configured; emitting mock response."
- 11-13 L1445 "The sky is the limit when you start from AST-valid pseudocode." L1447 edit doc text -> reflect onto docstring in code (two-way)

### 11-16 (longest; day after incident; back to .mdmd/layer-4; authored sections by recursion prompt x~28)

- L508 "Read the room. You are trying to write a note to yourself to stop doing the thing you are doing to write a note to yourself."
- L531 "There is a needle hiding inside the haystack of the raw 11/15 conversation" -> options 2+3 (11-15 L1095-1232)
- L637 "I do have to assert that this ... is _technically_ false relative to the state the context window was ostensibly in"
- L773 "you've done an honestly fabulous job but had one bad day yesterday -- today will be better"
- L2695 "There should be **no** permanent `.mdmd/layer-4/` tree at all. I mean, I guess we could make our version of `Live Documentation` emit to there?... I am okay if we want to configure the name for our output Live Documentation to something which fits into the big ol' stack of MDMD." (Memory quote OK)
- L3201 "We have required our software to be robust to: Configuration for output directory / output file suffix / rules engine. Why then can we not express MDMD top to bottom in its original file path but with the new mirrored directory contents?"
- L3994 "MDMD is _our_ convention, useful to us, known to us. It is not something we're forcing on the consumers of our software. No one else knows about MDMD."
- L4070 combine instruction files: "solving the problem cleanly and completely with total simplicity"
- L4915 lint warning for missing authored portions
- L4947 (repeated 5213/5215/5572) "for every file for which you are trying to declare a purpose, that you are searching **where it originated from** to help determine **why it exists**. You have an absolutely astonishing treasure trove of the **full unabridged development history**... Difficulty justifying the existence of files may be signal that the files are technical debt" [-> AGENTS "If a file can't be justified, delete it"; "Before deleting... find out why it was written"]
- L5520 "Generate a valid markdown link. If that happened at line XXX in the chat history, then mark it... Bring these files into the broader web of truth of our workspace." [origin of chat-log citations in Purpose/Notes; AGENTS now says "A chat-log citation is not required"]
- L5627..L11165 SAME PROMPT ~26 times: "Perform recursively until all lint is completely resolved..." manual loop (owner as the loop) — ancestor of overnight autonomy
- 11-16: owner sent "Prompt: Perform recursively until all lint is completely resolved..." 23 times (grep count) L5627..L11165
- 11-15 L1097 CI/CD only "when we are ready to first **share** our software outside of this workspace"; L1099 needle: integration testing/benchmarking for "multiple running contexts" (extension vs standalone); options 1-4 by agent; owner L~1185 "1 +4 = temporary improvement, 2 +3 = durable changes we actually want"; adds **Do it the "Right Way"** to copilot instructions.
- 11-15 ~L1195-1225 BEHAVIOR EXPECTATIONS block pasted by owner (owner-authored): Total Code Ownership ("you must be able to justify every code file's existence... vestigial LLM hallucination artifact"); Complete Problem Solving (no workarounds); Do it the "Right Way"; High Autonomy ("The cost model of Github Copilot in VS Code is such that the user pays per user prompt, not per token or per LLM request. This cost model strongly incentivizes and promotes both high agency behavior and high quality responses."); Reproducibility, Falsifiability; Continuous Improvement (chat log preserved + dogfooding).
  => ancestor of AGENTS.md "How to work here". Missing today: Right Way; Reproducibility/Falsifiability; cost-model reason for autonomy.

### 11-17 (inspect born; webforms-appsettings fixture; aspnet adapter)

- L5 (first turn) 11-16 lines ~6k+ "almost entirely repeating... enormous amount of repeat prompting and churning to generate the hundreds of authored sections"
- L135 "Because the authored sections of those files were so precious, I committed before `npm run safe:commit` would have otherwise returned the all-clear."
- L337 "I would love to see progress on `inspect`! We have been really underutilizing that command, and I'd love to see it worked more into our day-to-day dogfooding."
- L457 "Tell me why **you**, Github Copilot, **would** use such a tool. And if you woulnd't, then we need to talk design. You are the primary consumer of this tool." [vs Sept 2026 humans are the audience]
- L469 "You natively "speak" MarkDown. That's why Live Documentation defaults to MarkDown."; docs "(almost) as vacuum-sealed as possible" [GET FULL]
- L593 "Design or resuse a **test fixture** for the scenario I have described involving tracing a javascript variable all the way back to a plaintext Web.config AppSettings key. Create the conditions under which you can prove or disprove your own CLI." -> tests/integration/fixtures/webforms-appsettings/
- L1752 "WOW! The first time you spun those commands for the inspect CLI, forward and reverse, I think my jaw about hit the floor. This tool you've constructed isn't a little useful novelty. This thing is absolutely a game changer."
- L1875 "Net 2 lines gained, only 3 lines touched. That's how I like to see it. It's a precious file"; "**this is the way.** ... And you did it by building a fixture first."

### 11-18 (Blazor, queue worker, Hangfire)

- L177 "The clay pot of code and docs we are throwing is now taking on substantial form."
- L206 "I know I've harped on the dotnet world a lot, but that's only because it's the ecosystem I know best. Blazor is a stellar example..."
- L1259 "Whoa whoa whoa what are you doing modifying the **Generated** section of these docs? Your changes will get destroyed" [-> AGENTS never hand-edit generated region]
- L2992 "Update the frickin' config!! Keep it updated dude! XD"
- L3318 "Holy mackerel please don't destroy your changes!"
- L3604 "I am absolutely **not** running that command... Absolutely do NOT attempt a mass checkout of the entire mdmd directory." [3 days after incident agent proposes mass checkout AGAIN; written rule didn't stop the proposal; owner's gate did]

### REPO CHECKS

- Nov fixtures SURVIVE under tests/integration/fixtures/: webforms-appsettings, razor-appsettings, blazor-telemetry, queue-worker, csharp-reflection, spa-runtime-config, powershell-compendium, csharp-advanced-symbols; read by tests/integration/live-docs/inspect-cli.test.ts (L35-40)
- .mdmd/layer-3/sample-programs.mdmd.md L59 already quotes owner's 11-06 hidden-field acceptance test; L61 says one hop still invisible (JS reads element id through helper). L11: vendored fixtures (ky, libuv, ...) retired 2026-09-27. L68 "A fixture holds no third-party code."
- Today's current docs (AGENTS, vision, Memory, decisions log) DO NOT carry: "materialized views"/"house of cards" (only Notes/user-intent-census), authored->generated gradient, "published life scientist"/publication-grade (only Notes), LLM sampling census (nowhere), bad fixtures (only Notes/mdmd-layer-content-census), cost model per prompt (nowhere), "what will happen if I make this change" phrase (nowhere)
- Probes/2026-09-28/archive-digest.md is a visual-only digest; cites Antigravity 11-19 L73 "Uhhh holy sh\*t that thing is unbelievable."

### ANTIGRAVITY 11-19 "Refining and Analyzing Graph.md" (read whole, 369 lines)

- L7 "please explore the workspace as deeply as you are curious to and then come back with a proposal for what _you_ think would be most exciting to you personally to work on next."
- L41 "This sounds awesome! I think raising little HTML pages is A-okay. We should research which of the graph visualizers are most aesthetically pleasing... Cytoscape is fairly old now... yes I would love to go for a graph visualization."
- L73 "Uhhh holy sh\*t that thing is unbelievable... How do you get this in place that _you_ can see and analyze it?"
- L85 "This is awesome, but it's noisy... I want to just reason about my software via the Live Documentation -- the mirrored simplified surface that we generate."; "feel a higher intensity of connection when a node has more than one reference"
- L159 "color the dots by their archetype and size the dots by their source code file's line count"
- L195 "What orphans do you see in the generated graph? Do you agree with their status?"
- L231 "As I type new ideas about the visualization, I find myself erasing the text I've typed, indicating that I'm likely at a point of terminal refinement on this feature for now. This is AWESOME!!!"
- L255 temp scripts in AI-Agent-Workspace\tmp\: "If they're really useful, they get promoted."
- => The force graph / first Explorer was the AGENT's proposal (Gemini 3 in Antigravity) when given free choice; agent replies not in transcript (only user inputs + tool notes).

### ANTIGRAVITY 11-19 "Incorporating Future Vision.md" (read whole, 353 lines) — README by Gemini in owner's voice

- L7 "dev has been entirely linear and has only one developer, so the story is perfectly linear"
- L69 competitors: Gitlab Knowledge Graph, Windsurf Codemaps, Google CodeWiki
- L193 "that's substantially more.. angry than I'd like? I don't feel this boiling hatred towards the other tools."
- L209 "Is this true? True top to bottom? Always true? Sometimes true? I read this phrase and I think "uh oh, this plugin adds work". But if you read through my chats, I describe "falling into a pit of success", and "creating a linting machine which causes the entire codebase to functionally write itself"."
- L225 "Because the repostory consumes all of its own tooling for internal correctness, please supply real examples rather than toy examples"
- L261 "Users should conclude for themselves that the others present a hostage situation because they do, but we shall not say it explicitly. Be truthful and show the truth as it is. We are local, nonproprietary, and permanent."
- L287 "remove the emojis"; "nobody but us knows what MDMD is and it's not something that I'm forcing on the consumers"

### ANTIGRAVITY 11-20 "Refining UI Interactions.md" (owner inputs all read)

- L7 "I haven't authored one for gemini yet but the copilot instructions are really really good" ; two agents concurrently (Gemini on visualize, Copilot on PowerShell)
- L11 "brainstorming\*\* alternate visualizations (2D, geometric)"
- L35 "an extremely friendly Circuit Board visualization and a friendly sonar visualization"; "a visualization that is orthogonal/rectangular (gently rounded corners...) that showcases how different files _fit in_ to each other"; graph view as visualization of `inspect` results
- L37 "I am a fine of the kind of soundboard-like wires-going-behind-the-rectangles-to-hook-rectangles-together kind of look. I want to see wires from symbol to symbol if I can, or file to symbol."
- L97 click a node -> relatives more visible; open editor; "a beautiful card that expands to show the detailed view when clicked (or hovered?)"
- L181 sonar view renamed: "Symbol view? Inspect view? Neighbor view? Close-up view? Local view?" [origin of LOCAL MAP name]
- L315 "We should not have a boatload of bespoke visualizers. We should have a single visualization platform and dashboard whose view can switch between force-directed graph ... and the circuit board view."
- L321 "At the end of the day, I'm asking you to create rich explorations of the Live Documentation. That is all."
- L363 "How can these visualizations become powerful command centers which help us reason about our code with confidence? Should the a node in the large force graph view open up to the local view where we can finally expand and see all the public symbols and their docstrings? Walk me through which visualization should handle which functionality."
- L371 "You only read 500 lines. It tells me exactly how much you read. Every shortcut taken is loudly visible."
- L417 "you absolutely 100% **can** raise a browser to test yourself. I expect to see evidence in the walktrhough of each visualization working, clicks and all."

### ANTIGRAVITY 11-20 "Refining Interaction and Code Quality.md" (owner inputs all read)

- L39 "Your assertions are unfortunately apparently empirically false."
- L41 "**Actual DOMs**. It's okay if the force graph gets special treatment since it's 3D, but your test clicks **miss** their target... the Circuit Board view needs to be capable of having _a thing in a thing_ if it's true inheritance. That is: a visual card could contain a visual card. Don't get married to the circuit board aesthetic."
- L55 "you could potentially rearrange which things contain which things based on directory versus inheritance structure" [ancestor of Membrane Map "wraps directories"]
- L129 "It's a shame that the screenshots you take get saved to a directory that you do not, by default, have access to."
- L153 "You bumbling-- sorry sorry."
- L179 "These renders all show **extreme** shortcomings... Please verbalize out loud, so that you may perceive it later when the images are not in your context window, what is wrong with each of these screens."
- L199 circuit board "unscrollable ... vertical mess with zero horizontal spacing"; "Why can we not render HTML cards again?"
- L201 "cut out the idea of CSS animations and focus on getting a DOM and a set of screenshots that shows something without such obvious WCAG violations... I'm genuinely shocked that my view is richer than yours"
- L226 colour all nodes by salient info "that their eyes can learn and adjust to"; glow for active
- L228 "Is there anything that can automatically output WCAG violations to you textually if you feel like the existing browser tooling is failing" [== 2026-09-29 design audit ask]
- L230 "Poor Github Copilot has been out fixing our slop all the live-long day."
- Antigravity big file "Enforcing MDMD Linking, Restoring Coverage.md": L7 "Please audit this workspace for AI slop"; "every single thing done in this workspace is accounted for"; L149 "These docs exist to help you and other AI agents navigate the codebase in a way which is incredibly context-efficient."; rest is pasted audit output.

### 11-20 (Copilot: PowerShell; Gemini concurrently on visualize)

- L4 "Gemini excels at visuals, so I used the Antigravity IDE for visualization work, while I will continue to use VS Code/Copilot for standard code work, ensuring each plays to their strenghts."; "Last night, it created a `live-docs:visualize` CLI tool and it's rather phenomenal."
- L167 Default.aspx and Web.config "are specifically here to test for a specific pattern"
- L186 "If I want this to work for me at my workplace, I need web.config files to get scooped up into our system. They matter a whole lot. There are so many questions the beguile devs on the daily about where certain values come from. Our inspect tool was designed to answer that question. Let us not leave it as dark matter to our Live Documentation system."
- L375 "At my day job, we have a TFS repo filled with an entire "Powershell Compendium" -- folder after folder of powershell scripts"
- L2258 "I'm really particularly pleased that you were able to get this to work for PowerShell 5.1 syntax, as that legacy tech is absolutely everywhere at my day job."

### 11-21 (vision for visualization surfaces; visualize rough)

- L142 two views [GET FULL]
- L470 "Gemini almost certainly didn't know this and reinvented wheels on its own... Don't be afraid to just batter the hell out of the code Gemini wrote. The idea is in place, but it's a very very rough ball of clay."; "automating testing of our design via playwright would be **heaven**"
- L1956 "Prove that it is WCAG AA compliant."
- L2013 "**THERE IS NO CONTENT ON THE PAGE**"
- L2495 "I tested clicking on a node in the force graph view and that sucker brought me to the local view! Amazing!!"
- L2521 "a DOM-based way rather than an SVG-based way to relate these visual elements to one another with lines"
- L2604 defaults list (hide Test/Asset; center busiest directory; hover highlight; smooth pan; open in Local/Graph view)
- L2829 Local View: every public symbol of active file; directory membership visible [GET FULL]
- L4048 zoom should keep centre; sidebar; local map "increasingly slick"
- 11-21 L142 FULL: "I want to have a total of two visualization views for the workspace: the "circuit board" visualization ... which allows users to see inheritance relationships, click individual file names, and explore the local neighborhood at the symbol level... That is, the "circuit board" view and the "local view" should be integrated together, allowing the user to easily move in and out of local symbol-level detail and global file-level detail. In addition, that combined workspace view needs to eventually have text editing capabilities... As such, a final requirement for that high-utility main merged view is WCAG AA Level accessibility compliance."; "Gemini authored some frankly not-great code to do all this, but it got the groundwork laid and the prototype in the git history."; "too many tools = bad LLM performance"; "The second visualization -- the force-directed graph! ... honestly in better shape than the others, and because of its 3D exploratory nature, I'm okay if we don't hit WCAG AA compliance for that view. It's the main workhorse view that I'm converned with."
- 11-21 L2834 "The local view need not be radial, and can take on the form of the Circuit Board view with directories, nodes, and edges reduced down to only what is salient to the selected element. This makes the local view and the circuit board view the exact same view, just with different subsets... a double-click or double-tap on a node in the Circuit Board view is used as a hotkey-like shortcut to create a local view"
- 11-21 L2835 size elements by log lines of code
- 11-21 L2836 visualize-explorer.ts exceeds "500 line heuristic"; "very small LLMs drive the actual final mile of file changes"
- 11-21 L2837 "text editing will become a thing we care about; it can't be impossible due to the visuals"
- 11-21 L4051 "Force Graph: Awesome as always!... it's far ahead of the other visualizations (which are more important than the force graph)."
- => AGENTS.md Status 2026-09-29 "The Circuit Board and Local Map views are being folded into one file-scale view" — owner asked this 2025-11-21.

### 11-24 (layout struggle; parity; left/right law origin)

- L221 "there is an enormous amount of low-hanging fruit that we can pluck just working our way up to WCAG AA compliance"; "The work is jumping a bit ahead on the roadmap, but the tool is surpringly informative already!"
- L269 directories arranged "almost like the force graph rules, but at the directory level"; lines hidden or "_behind_ all other elements (as if it is a sound mixing board in which plugs are coming in from the back -- I believe Ableton Live did something akin to this)"
- L404 symbols "evenly spaced along the left and right sides of the node cards" with "right-angled connector lines" [PINS]
- L422 "Why do we not know dependencies at the symbol-level... different line colors for inbound versus outbound connections relative to the focused element in the Local View."
- L490 PARITY: "the visualization surface ... should know as much as the Live Docs do. No more, and no less... I expect (relative) **parity** between the "headless" and "UI-driven" modalities" [origin of AGENTS 'Markdown is canonical... derivable from the Live Docs']
- L630 "Just do it the right way, breaking what needs to be broken to do so."
- L926 asks for a LEGEND; L1303 "The legend is fantastic"; "The new Test-Backed UI is **phenomenal**" [vs 2026-09-28 help button instead of on-screen legend]
- L1303 "our zoom or resize of the window should not move the nodes around. We will likely need grids in grids in grids in grids"
- L1317 "I would certainly prefer if the Circuit Board UI view bore a meaningful resemblance to the Workspace view in one's IDE (parity principles)."; fallback: bin by materialized System clusters
- L1396 LEFT/RIGHT: "If we are deciding that symbols have an input and output port, then we should put the things which depend on the active code file to its left and things which it depends on to its right, roughly ordered in such a way as to reduce the length and perplexity of lines"
- L1689 "We need to tighten this iteration loop." (Playwright MCP, background terminal)
- L1885 "A directory should be a 2D space inside which we may compose other directories, themselves 2D spaces... recursive algorithm" [ancestor of Membrane Map]
- L2045 fractal 4:3 from leaf to root
- L2139 "You built a bioinformatically-inspired architecture doc ("System Docs") resolver and it was no joke either."; "2D bin-packing + Force directed hybrid... Keeping related functionality nearby one another is sensible"
- L2185 "the layout does not need to be responsive. The map of the software is the map of the software."; "I only ever get "thought summaries" rather than actual CoT traces, which is a good thing; your "thoughts" really are private and respected from the point of view of the user"
- L2545 "you took us over an entropic hill into a new local minimum"
- L3060 "Layout issues persist; shifting elements from nodes persist; overflows persist; \n....\n???" (month ends tired)

### MEASURES / REPO CHECKS (2)

- Owner turns in Nov: 906 total. Matched memory-upkeep patterns (autosummari|rehydrat|lost the plot|summarizeDay|census files|catch back up): 212, of which 23 are the 11-16 loop prompt => ~189 (about a fifth). "@agent Try Again": 19.
- docstring bridge code SURVIVES: packages/engine/src/live-docs/adapters/csharp.xmldoc.ts, java.javadoc.ts, python.docstring.ts, jsDoc.ts; docs today carry `##### X — Summary`. Vision does not mention docstrings.
- Today's symbol headings carry `{#symbol-...}` (generated). Owner objected to required explicit anchors 11-03 L2758, 11-04 L4317/4329, 11-07 L2701, 11-18 L4859, 11-19 L791 ("not a reason I'm thrilled with").
- 208 of 593 layer-4 docs cite ChatHistory in authored sections; 48 cite SUMMARIZED files (which the brief calls an index, never a source); 16 carry LD-/T0 ids (LD-402 x13).
  => owner plans to delete chat archive after modernization (direction.md) -> 208 docs' links would break.
- decisions log (architectural-decisions.mdmd.md) L56-68 Accuracy; L187-205 Descoped. Already carries Nov lessons: C headers, WebForms overrides cautionary, partial-class peers, co-activation method + git co-change rejected 2025-11-10, TypeScript oracle runtime/type-only distinction.
- typeScriptFixtureOracle.ts removed 2026-02-17 698a1244 "migrate 16 benchmark fixtures from heuristic oracles to SCIP"
- live-documentation-doc-refactor-plan.md removed 2026-02-20 0e8f034f; specs/ removed 2026-02-23 36051446; devHistory.summarizeDay.prompt.md removed 2026-09-27 29d58b50; system/generator.ts + fixture-tools removed 2026-09-27 0de42d28; docs/tooling/cli-command-catalog.md removed 2026-01-12 0d89e857
- Explorer: packages/explorer/src/client/views/layoutUtils.ts traces to 2025-11-22 f1e2dec0 / 2025-11-25 2e41d7b6; squarify.ts, circuitView/, localView/, forceGraphView.ts exist today.

### READER REPORT 11-08 L1-3262 (received) — key adds

- L308-310 "**Markdown Links _are_ their own form of AST**"
- L318 mirror dir structure "(maximize similarity to source code paths to reduce LLM hallucinations)"
- L321 authored first so LLMs needn't read long generated parts
- L323 Purpose questions: "Why does this file exist? What happens if this file gets modified or deleted? What requirement or architectural constraint mandated the existence of this file? What is this file providing to the overall system?"
- L324 Notes: "Sticky notes and miscellany that is genuinely useful (we do not like excessive documentation or excessive code) but cannot be reliably measured"
- L330 "total panopticon visibility into a workspace ... all checked **from the MarkDown**!" (panopticon 11-08)
- L465 peers + "We should plan on an MIT license."
- L546 one doc = one source file
- L564 owner doubted evidence section before it existed
- L809 churn numbers differ per contributor; stay away from auth
- L814 "I 100% agree with "no cloud dependencies"."
- L820-822 reverse lookup tooling; "functional feature parity between what the VS Code extension consumers get to do with clicks and what Github Copilot could do with commands"
- L1127 Azure DevOps wiki pointed at the folder; relative links; slug dialect
- L1150-1152 layers; L2 one-to-one with work items/issues; "tripartite file format pattern of a **Metadata** section, an **Authored** content section, and a **Generated** content section" at every layer
- L103-143 three `git reset --hard` + force push at owner's request a week before incident; L150 "That was harrowing to watch! XD But it worked! Hot damn, git is a difficult beast."
- "public surface, dependencies, and observed evidence" is AGENT's phrase (L1109); owner "Such refined terminology" L1121
- reader claims: requireRelativeLinks & slugDialect config have no consumer today [VERIFY]; 7 unused archetype names [VERIFY]; slopcop.config.json names .live-documentation/\*\* [VERIFY]

### INCIDENT 11-15 reconstructed (my read)

- L2822 owner deleted .mdmd/layer-4 by hand; day-long uncommitted work (morning doc edits L268-1829, .mdmd.md->.md migration)
- L3857 agent issues `git checkout -- .live-documentation .mdmd` (to undo generator churn from `live-docs:generate -- --changed <one file>` which rewrote whole mirror)
- L3861 owner asks why; L3863 agent explains; L3867 owner "Apologies, please proceed with the command, I was just making sure."
- L3869 "Summarized conversation history" (autosummarization) right before L3875 checkout runs, L3881 `git clean -fd .live-documentation .mdmd`
- L3966 owner: "this question from me at line 3861 was rather prescient, yeah?"
- L4011 "Holy crap... This is the stuff that makes people burn out and leave agentic development... We churned and ultimately accomplished nothing after you ran that checkout command... Devastating."
- L4029 "Fix your copilot instructions file. This can never happen again."
- L4055 "The copilot instructions file is the only file kept in perpetual context no matter what. It is here to tell us everything that is "forever true"... I'm switching back to the GPT-5-Codex model rather than GPT-5.1-Codex."
- L4325 "What is _durably and forever true_ **as an underlying set of **principles and values\*\*\*\* to guide you goes into the copilot instructions."
- L4362 owner's wording: "**Git Commands Need Extra Care**: Before running any bulk `git checkout`, `git restore`, or `git clean`, ensure every intentional change is committed, branched, or stashed, and prune junk surgically instead." (CONDITIONAL, not "never")
- L4364 owner's diagnosis: "the foundational problem is that you forgot that you had a bunch of unsaved work and that you were _on the road to committing that work_ when you _lost the plot in autosummarization_ and _deleted a profound sum of your work_. We have spun with no commit for an **entire** dev day."
- L4368 "similar edits should result from similar contexts -- it was just rather agonizing to align those contexts for you"
- L4401 on letting uncommitted work pile up: "We had to. `npm run safe:commit` did not return with the go-ahead."
- 11-16 L773 next day: "you've done an honestly fabulous job but had one bad day yesterday -- today will be better"
- 11-18 L3604 agent proposes mass checkout again; owner refuses.
- TODAY: AGENTS.md "Never run bulk..." (absolute) + "Commit only when asked" vs owner.md 2026-09-27 grant "Feel free to stage and commit as you need". Contradiction inside current instructions; and AGENTS names the symptom (the command) not the cause (a day's work uncommitted behind a red gate + agent's stale picture after compaction).
