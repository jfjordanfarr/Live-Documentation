# User Use-Case Census — How I Want This Software to Work

**Source**: `all-user-prompts.md` (2,588 prompts across 102 chat files)
**Method**: Manual scan of all user prompts, extracting those that describe desired software behavior from the user perspective.
**Date**: 2026-03-01

---

## Entries

### UC-001 — The Founding Vision (2025-10-16.md:L1)

> "raises intellisense 'problems' for specific files which we intelligently note reference one another... Building software based on markdown docs or building markdown docs based on software, in such a way that the link between specific documentation files and specific _implementation_ files are in some way logically 'linked', such that modifying one raises a lint-like 'problem' in the other... My desire is for Github Copilot, while working in agent mode, to be given intuitive clues about salient context sitting _just outside_ the bounds of its current windowed knowledge, _based on the changes it is making_."

### UC-002 — Cross-Lingual Graph Without Forced Frontmatter (2025-10-16.md:L183, L246, L1005)

> "Our AST may need to be derived via LLM in order for it to be truly truly truly cross-lingual... knowledge graph construction is a known practice in RAG today" / "absolutely certain to provide the line numbers of where things are" / "having forced frontmatter or forced command line calls to construct graphs seems counterproductive... How does Github Copilot/VS Code do workspace indexing, and how often?"

### UC-003 — Degraded-Mode as Default (2025-10-16.md:L1267)

> "This 'degraded-mode' behavior should be the default behavior. It is a little sugar on top if we have the support of AST for our task of building the knowledge graph of the code, but it is **not** required."

### UC-004 — Least Work, Ride on VS Code (2025-10-16.md:L287)

> "It is very important to me that we do the least amount of work possible and leverage solved problems (especially officially solved problems that are continuously improving with enormous labor and backing behind them)."

### UC-005 — Dogfooding (2025-10-19.md:L239)

> "Why can we not use what we are building on the thing we are building? It's just typescript, no? We should be thinking about and prioritizing dogfooding this as early as possible."

### UC-006 — THE MISSION STATEMENT (2025-10-19.md:L2140)

> "The function for our extension is this: 'For any given change in any given file, this extension provides the definitive answer to the question: What files will be impacted by this change?'"

### UC-007 — Code-to-Code First, Docs Later (2025-10-19.md:L2753)

> "We're still initially starting off on the rather simpler problem of code-to-code, no? Once we solve the very difficult code-to-code gaps (like the gap between a UI server and the frontend HTML/JS/CSS), we will then be ready to resolve the code<--->docs relationships."

### UC-008 — Markdown Linking as Superpower (2025-10-20.md:L1742)

> "Markdown's superpower (and MDMD's superpower (and our project's software's superpower)) is _linking_ files to one another, creating an abundantly-obvious, easily-navigable-from-anywhere web of truth; consistent and reproducible."

### UC-009 — Layer 4 = 1:1 Implementation Mirror (2025-10-20.md:L1768)

> "A layer 4 MDMD doc has a 1:1 correspondence between it and an _implementation_ file... If you plan to author 5 typescript files, you'd have 5 layer 4 MDMD files."

### UC-010 — Auditability (2025-10-20.md:L2388)

> "I was a life scientist before and a builder of secure enterprise software now. Auditability is valuable to me."

### UC-011 — Knowledge Graph from Lowest-Hanging Fruit (2025-10-20.md:L4476)

> "Having simple patterns to detect file path strings in code files (including references from markdown files!)... building up this knowledge graph should start proceed in order of easiest/lowest-hanging fruit..."

### UC-012 — Falsifiability: Broken Links, False Positives, Ripple Verification (2025-10-21.md:L1411)

> "A test in which one markdown file links to another file and we change either the target file name/path or the markdown path... such that it breaks a link... A test or suite of tests designed to detect _false positive relationships_... A test in which we intentionally change only ONE line of a single file with many dependents and can verify that ALL of its dependents are flagged."

### UC-013 — All File Types Welcome (2025-10-22.md:L2461)

> "What file types do we NOT want our system aware of? I can't think of any... We envision using LLMs to help develop pseudocode AST based on plain text files of virtually any type."

### UC-014 — Code Like Clay: MDMD-First Development (2025-10-23.md:L439)

> "I tend to work on these implementations is from MDMD to Code. That is, I author the MDMD docs for the code docs I _think_ I need, with the properties I _think_ they should have, and then implement based on my own documentation, sharpening the implementation and the docs as hard reality smacks into my best laid plans."

### UC-015 — Nearest Symbol Neighbors Tool (2025-10-23.md:L1146)

> "One feature I wish we had was an LLM tool which allowed you to pick a symbol and simply ask for the nearest neighbors to it (in terms of number of hops away/degrees of separation). That could have saved you a lot of searches if you take a look at our chat history."

### UC-016 — Workspace-Wide Pseudocode AST of Increasing Granularity (2025-10-24.md:L1740)

> "The tooling we want to build is far more generic. We must widen our minds to consider what we can and should do with workspace-wide pseudocode AST of increasingly high granularity as development progresses."

### UC-017 — LLM Extraction, Not Parsers (2025-10-24.md:L1773)

> "We do _not_ need a million and one different file type-specific parsers and pattern matchers. We need a good set of prompts and an LLM who can extract symbols, files, and their relationships, into a structured format."

### UC-018 — Broken Links as LLM Hallucination Detector (2025-10-25.md:L564)

> "Do we have ANY markdown links which are BROKEN in our workspace? Broken markdown links are a telltale sign of LLM hallucinations: a link to a file that does not exist."

### UC-019 — Pre-Commit Validation Gate (2025-10-25.md:L595)

> "Think of what we could run here as a means of validating our workspace before doing any given commit which would capably answer whether we are free of these odd forms of modern 'lint'?"

### UC-020 — Increasingly-Salient Lints Build Toward Pseudocode AST (2025-10-25.md:L792)

> "I think that the path to true workspace-wide pseudocode AST generation will be built on a series of increasingly-salient lints... each lint layer adds another facet of the AST."

### UC-021 — Public Symbol Documentation Coverage (2025-10-26.md:L3518)

> "The next big milestone I want us moving towards is this: 'For every public symbol in our codebase, there must be at least one mention of it in an MDMD doc'. This will get us closer to Markdown AST over our design."

### UC-022 — Reverse Generation: Docs to Code (2025-10-26.md:L4923)

> "What if we could run this process in reverse? Here's one possibility: read the MDMD Layer 4 doc, determine the Exported Symbols, and generate code stubs."

### UC-023 — Polyglot Test Fixtures as Tooling Proof (2025-10-27.md:L6092, L6098)

> "I would not mind if our .mdmd root had entry into workspaces of varying natures... start enabling our slopcop/graph audit functionality against integration test fixtures... detecting the programmatic surface of base class files which have abstract or protected symbols (C#)."

### UC-024 — AST Benchmarking as Accuracy Measurement (2025-10-28.md, 2025-10-31.md:L1575)

> "Adding another language... We just create `tests/integration/benchmarks/fixtures/<language-id>/` with `expected.json`/`inferred.json`... the manifest already supports per-fixture `language` labels, so reports will immediately surface the new row." / "I need something akin to a 5-paragraph justification for _any_ of these fixtures we bring in. _How_ are they a good fixture?"

### UC-025 — Docstring-to-Markdown Bridges for Public Symbols (2025-11-12.md:L562, L634, L722)

> "enriching with XML doc comments will be very very cool when we begin doing docstring bridges. Are you interested in starting that work now? That's where the docstring on a public symbol transports its way into the LiveDocs as the description for the symbol." / "Oh yes, we should absolutely be capable of inhaling a docstring for any public symbol."

### UC-026 — Configurable Output Paths, Not Hardcoded MDMD (2025-11-08.md:L1314)

> "Make sure that the **name** of that base layer of documentation (the folder name under the also-configurably-named `/.live-documentation/` folder) is user-configurable. It is **only** 'layer-4' because we use MDMD as a convention. That is not a foundational part of the thing that we are delivering. A reasonable default name would be 'source'."

### UC-027 — Tiered User Adoption Path (2025-10-29.md, 2025-11-08.md:L1685)

> "I favor the removal of the necessity of an archetype for binary/non-plaintext assets. **However**, I could be **very meaningfully convinced** that an archetype gives us an easy, intuitive, immediately recognized set of visual cues..."

### UC-028 — Code-to-Doc File Linking (2025-11-02.md:L1331)

> "Okay that was absolutely astounding and wonderful to watch... This code to doc file link is SO SLICK! Excellent work! Seriously, it was absolutely incredible to see that single change be effectuated right to the terminal."

### UC-029 — Compiler-Backed Oracles for Ground Truth (2025-11-03.md:L147, 2025-11-05.md:L2511)

> "I don't think expected.json is sacrosanct. I think that we will need to be accommodating of having a section for manually-authored edges/connections that are due to polyglot bridges, but the AST should be regenerating the expected shape for these fixtures everytime, no?" / "If any benchmark returns a value like [0.18 precision, 0.31 recall], I think we should 'fail' the benchmark."

### UC-030 — Publication-Grade Rigor (2025-11-01.md:L754, 2025-11-03.md:L321)

> "Where are our benchmark results going? The `test-report.md` I see is from 11/1 and doesn't appear to contain these new third-party libraries. A big big big part of bringing in these third-party libraries for benchmarking is to **find places where our software is failing and explore those deeply**."

### UC-031 — The Grand Simplification: Live Documentation Replaces Prior Complexity (2025-11-08.md:L622, L1149)

> "Let's continue through the doc refactor plan checklist with that aim. If you like, you could devise this effort in such a way as to replace our primary documentation folder from `.mdmd/` to `.live-documentation/`, allowing us to refine what the other layers should contain."

### UC-032 — File Archetypes: Source, Test, Asset (2025-11-08.md:L1685, 2025-11-09.md:L373)

> "I do think, however, that you should prepare for the inevitability that the text coming in and out of these docstring bridges has some amount of structure to it." / "We no doubt need to _know_ about the presence or absence of test coverage, but we would prefer for the 'Observed Evidence' block to be an **optional** populated field."

### UC-033 — Orphan Detection for Live Docs (2025-11-09.md:L1111, 2026-01-16.1.md:L285)

> "It would be beneficial..." to detect disconnected files/islands in the graph. / "What `*main.*` files have no dependencies and no dependents from a Live Documentation perspective? I want to see hard evidence that this is the case in our own workspace."

### UC-034 — System Layer: Deterministic Aggregate Documentation (2025-11-10.md, 2025-11-11.md)

> Automated generation of higher-level documentation views from the base layer, including cluster detection, co-activation analysis, and enrichment statistics — all deterministic and regenerable from first principles.

### UC-035 — Co-Activation Clustering with Statistical Rigor (2025-11-11.md, 2026-01-17.1.md:L388)

> "Walk me through the CLI tooling that exists for this presently, and plan for a statistical background that is based on the cumulative set of all _edges_ (all MarkDown links to other Live Documentation files); that is both the simplest and generally the most correct (at least from my work in bioinformatic motif enrichment) mechanism of background usage."

### UC-036 — Technical Debt Detection via System Layer (2025-11-11.md, 2026-01-17.1.md:L1529)

> "I strongly suspect this is because of our choice to take on barrel export files. I suspect that we would see more neat, clean architectural boundaries within our main codebase if we stopped re-exporting and opted to use symbols where they come from."

### UC-037 — Mermaid Topology Diagrams from Live Docs (2025-11-10.md)

> Deterministic Mermaid diagram generation from Live Documentation dependency graph — enabling visual topology views embedded in markdown.

### UC-038 — Greenfield Feature Authoring via Docs First (2025-11-13.md, echoing UC-014)

> Extending "Code Like Clay" into greenfield feature planning: author MDMD documentation for components you _think_ you need, then implement against that documentation, letting reality refine both iteratively.

### UC-039 — VS Code Fork Compatibility (2025-11-15.md)

> Ensuring compatibility with VS Code forks (Cursor, Windsurf) so the extension can reach the broadest developer audience regardless of editor choice.

### UC-040 — Container/Sandbox Integration Testing (2025-11-15.md, 2025-11-16.md)

> Desire for integration tests that copy fixtures into isolated sandboxes, preventing cross-contamination and ensuring reproducible results across environments.

### UC-041 — Inspect CLI / Pathfinder: Oracle-of-Bacon for Code (2025-11-17.md:L1752)

> "MAN oh man! I did not take a moment to mention this but uh, WOW! The first time you spun those commands for the inspect CLI, forward and reverse, I think my jaw about hit the floor. This tool you've constructed isn't a little useful novelty. This thing is absolutely a game changer."

### UC-042 — PowerShell Language Support (2025-11-20.md)

> Adding PowerShell as a supported language for symbol extraction and dependency analysis, reflecting the user's daily development environment.

### UC-043 — D.R.Y. Documentation / No Hallucination Fuel (2025-11-15.md, 2025-11-08.md)

> Generated documentation must not duplicate information that lives elsewhere. Redundancy creates "hallucination fuel" — stale copies that mislead LLMs reading the workspace. Each fact should have one canonical home.

### UC-044 — Bespoke Scripts Over Terminal Tricks (2025-11-16.md:L508)

> "Read the room. You are trying to write a note to yourself to stop doing the thing you are doing to write a note to yourself. If that file is being weird with respect to your LLM edit file tools, we can work through that. But if you think you need programmatic expression to solve a small local problem, you should follow the advice you are literally trying to impart yourself."

### UC-045 — Visualization Surfaces: Circuit Board + Force Graph + Local Map (2025-11-21.md onward)

> Three complementary views for exploring the Live Documentation graph: Circuit Board (treemap of directory hierarchy), Force-Directed Graph (emergent topology), and Local Map (3-column symbol-to-symbol detail view). Each serves a distinct cognitive purpose.

[Planned successor: The **Membrane Map** (Dev Day 79, 2026-03-22) will unify Circuit Board and Local Map into a single zoomable treemap, reducing the primary view count from three to two (Membrane Map + Force Graph). Implementation began Dev Day 80 (2026-03-23) — 826 tests green, browse-mode rendering + pin-based focal overlay + SVG connections functional. See [membrane-map.mdmd.md](../../.mdmd/layer-3/membrane-map.mdmd.md) and Stage 12 in the feature backlog.]

### UC-046 — Visualization Parity Between Headless and UI Modalities (2025-11-24.md)

> "I expect (relative) **parity** between the 'headless' and 'UI-driven' modalities of exploring the Live Documentation."

### UC-047 — Symbol-Level Dependency Connections in Local Map (2025-11-24.md)

> "Why do we not know dependencies at the symbol-level?" — driving the requirement that the Local Map show which specific public symbol in file A connects to which specific public symbol in file B.

### UC-048 — Type Reference Badges in Visualization (2025-12-05.md)

> Reference badges showing extends/implements/references relationships on symbol connections, providing at-a-glance relationship taxonomy in the Local Map view.

### UC-049 — French Corset / Self-Reference Visualization (2025-12-07.md)

> A distinctive visual connector (the "French Corset" or "Shoelace") that wraps around the back of a node's card to represent self-referencing symbols within a single file — making intra-file dependencies visible.

### UC-050 — Stacking Context Correctness: Connectors Above, Cards Below, Pins Above All (2025-12-05.md, 2025-12-06.md)

> Persistent z-index battle for correct visual layering in the Local Map — connectors must render above card backgrounds but below pinned symbol indicators. Visual correctness matters for UX trust.

### UC-051 — Detail Panel as Markdown Renderer for Authored Content (2025-12-07.md)

> "The Detail Panel Becomes a Markdown Renderer... As it should always have been." — rendering the authored Purpose/Notes sections of Live Documentation files directly in the Explorer UI.

### UC-052 — Static Site Export / GitHub Pages Hosting (2025-12-07.md)

> "I want the Live Documentation Explorer to be capable of working as a static site off of pure JSON data." — enabling deployment to GitHub Pages, embedding in Teams/Slack, or offline usage.

### UC-053 — Sticky Symbol Pinning on Click (2025-12-09.md)

> "Make it so a click or tap causes the hover effects on a symbol to 'stick'" — allowing persistent focus on a symbol's connections without continuous hovering.

### UC-054 — HTML Asset Dependency Detection (2025-12-09.md)

> HTML files depending on CSS/JS files must be detectable as edges in the dependency graph, enabling full-stack connectivity from markup to script to style.

### UC-055 — Binary Asset Live Documentation (2025-12-09.md)

> Images, fonts, and other binary assets should appear as nodes in the graph even without code analysis — their _consumers_ (HTML, CSS, markdown files referencing them) provide the connectivity.

### UC-056 — CI/CD Pipeline for Build Validation (2025-12-13.md)

> GitHub Actions pipeline running `safe:commit` in CI, ensuring that the entire validation suite (lint, test, benchmark, Live Docs regeneration) gates every merge.

### UC-057 — Network-Free Security Guarantees (2025-12-15.md)

> "Any HTTP request from its process going anywhere but a localhost address will simply be stopped." — the extension must operate entirely offline, with zero network dependencies at runtime.

### UC-058 — NPM Package Readiness (2025-12-14.md)

> Preparing the software for publication as an npm package, requiring clean public API surface, proper packaging, and dependency hygiene.

### UC-059 — Knowledge Sources View in Explorer (2025-12-16.md)

> "Show me where it is getting its information from, and help guide me to places and ways that I can rig up more information." — a dedicated Explorer view showing which knowledge sources (tree-sitter, heuristics, SCIP) contributed to each file's analysis.

### UC-060 — URL State + Shareable Links (2025-12-16.md)

> Default local map entrypoint + URL state persistence + localStorage — enabling shareable deep links into specific Local Map views of the Explorer.

### UC-061 — Omnisearch / VS Code-Style Command Palette (2025-12-06.md)

> "Top, center, own element, lives above everything." — a VS Code-style command palette for searching files, symbols, and navigating between Explorer views.

### UC-062 — Multi-Hop Pathfinding FROM/TO in Local Map (2025-12-17.md)

> "FROM" and "TO" omnisearch bars for symbol-to-symbol pathfinding across N hops, enabling Oracle-of-Bacon-style shortest-path queries within the Live Documentation graph.

### UC-063 — Hide/Collapse Irrelevant Nodes on Symbol Pin (2025-12-17.md)

> "Collapse or hide all Public Symbols which are not salient to the set of connections related to the Pinned symbols." — reducing visual noise when focusing on a specific dependency chain.

### UC-064 — N-Column Local Map Architecture (2025-12-18.md)

> "Build the Local Map 'correctly' to scale to many many columns over many many hops." — supporting arbitrary-depth pathfinding visualization beyond the initial 3-column layout.

### UC-065 — Integration Test Modernization (2026-01-06.md)

> Comprehensive overhaul plan for integration tests to be more robust, isolated, and representative of actual extension behavior.

### UC-066 — GraphStore Elimination / Stateless Ripple Analysis (2026-01-12.md)

> Simplification removing SQLite/GraphStore dependency entirely — "Live Docs ARE the database." All graph queries derive from the markdown files themselves, achieving full statelessness.

### UC-067 — Edge Aggregation Pipeline with Multiple Knowledge Sources (2026-01-12.md)

> Architecture for combining tree-sitter + language heuristics + SCIP/LSIF + VS Code API into a unified edge aggregation pipeline, with each source contributing edges that get unioned into the final dependency graph.

### UC-068 — Rosetta Stone Polyglot Test Fixtures (2026-01-14.md, 2026-01-16.1.md:L1433)

> "Rosetta" naming convention — identical programs implemented across all supported languages (TypeScript, C#, Java, Go, Python, Rust), enabling cross-language comparison of symbol extraction accuracy.

### UC-069 — Go Language Adapter (2026-01-15.md)

> First-class Go language support for symbol extraction and dependency detection, benchmarked against the Rosetta fixture and the third-party `mux` library.

### UC-070 — JSON/Manifest Adapter for Asset Connectivity (2026-01-15.md)

> JSON files (package.json, tsconfig.json, etc.) should know about the files they reference, creating edges from manifest/config files to the source files they describe.

### UC-071 — Brownfield/Related Documentation in Explorer (2026-01-07.md, 2026-01-08.md)

> Displaying non-Live-Documentation markdown files (READMEs, guides) in the Force Graph and Detail Panel, so the Explorer reflects the _full_ documentation landscape of a workspace, not just generated Live Docs.

### UC-072 — Download All Documentation as ZIP or Flat Markdown (2026-01-09.md)

> Radio-button format choice in the Explorer for downloading the complete documentation bundle — enabling offline consumption and sharing.

### UC-073 — Test-Backed Detection Without Name-Matching (2026-01-16.1.md:L1667, L1826)

> "How feasible is it to get a **unit test** file per **unit** (within reason) and a single **integration test** file to combine those units? This would allow us to flex our ability to detect 'test-backed' implementations even when a test file is _not_ name-matched to its implementation file."

### UC-074 — Compiler-Backed SCIP/LSIF Oracles for Benchmark Fixtures (2026-01-26.1.md:L3332, 2026-01-27.1.md:L1297)

> "We have these 'fixture oracle' files... We have discussed at length that we wished for compiler-backed tools to give us the 'ground truth' for our third-party benchmarks." — installing actual compilers (scip-dotnet, scip-go, scip-typescript) to generate authoritative expected.json files.

### UC-075 — Roadblocks as Opportunities for Real Development (2026-01-27.1.md:L1975, L3503)

> "I think that the typical LLM 'instinct' to resolve the immediate problem instead of seeing problems as a wonderful opportunity to refine the underlying software/design is folly. When we bump into a problem, we need not create a workaround." / "Whoa whoa whoa hold up... This is another opportunity to make our software overall more correct presenting itself. Don't pass up this opportunity."

### UC-076 — LSIF Sets Our Relationship Taxonomy (2026-01-27.1.md:L3602, L3646)

> "Then we should design around the granularity we do get. So long as we are confident that the same _verbiage_ and _terminology_ would be presented by LSIF in multiple different languages, then LSIF should set our terminology." / "If we've only got those 3 possible values, then those are the 3 possible values we leverage! Simple simple! Keeps us well aligned with truth."

### UC-077 — Tree-Sitter WASM as Universal Baseline (2026-01-28.1.md:L2897, L2972)

> "There exists a full foundational vscode tree-sitter wasm bundle that we could've used this entire time to have common sane conventions for all languages? This whole time we had access to that? Good god, that is a solved problem if I've ever seen one." / "Prove to me why we shouldn't just use the tree-sitter for C# as well, even when our regex heuristics score us in the high 90s?"

### UC-078 — Oracle Fusion: SCIP ∪ Tree-Sitter (2026-01-28.1.md:L4085, L4265)

> "I want to commit to this architecture, yes. This is extremely elegant and gets us what we need at the minimum required complexity. That is a parsimonious implementation." — benchmark ground truth derived from the union of SCIP and tree-sitter outputs, runtime analysis from the union of tree-sitter and language heuristics.

### UC-079 — Common LanguageSyntax Interface for All Adapters (2026-01-29.1.md:L788, 2026-01-30.1.md:L1373)

> "Ah, A PATTERN! Look look! Recall that we stripped csharp comments to reduce false positives, and you just barely did the same with Go!" / "I just want a holistic clean architecture. I want an interface which proclaims loudly 'hey, language adapters! You should know about XYZ, generally', and each language adapter goes 'okay, here's how I implement XYZ'."

### UC-080 — Devcontainer for Reproducible Development (2026-02-03.1.md:L1858, 2026-02-03.2.md)

> "Should we finally just 'do it the right way' and do the research necessary to author a sane devcontainer for this project, such that we no longer have to worry about flaky Windows availability of certain scip-{lang} combinations?" — Codespaces-compatible devcontainer with all compilers pre-installed.

### UC-081 — JSDoc as Entry Point for Codebase Archaeology and Cleanup (2026-02-15.1.md:L691, L803)

> "How much of our codebase contains workarounds, deliberate lint suppression, that kind of thing? And can we create and enforce linting that works like the JSDoc comment requirement does — forcing us to deeply examine each public symbol?" / "How, with a 128k context window... do you think you can/should tackle the work of documenting the codebase?"

### UC-082 — Extension Capabilities De-Scoping: Simplicity Over Features (2026-02-18.1.md:L1067, L1257)

> "If the extension wants to regenerate live documentation files on dirtying of a file (save), how much diagnostics/hysteresis/change-queue stuff do we need to know?" / "No ripple analysis, no noise filtering, no acknowledgement workflow — just: 'your Live Doc at X references Y, but Y doesn't exist'."

### UC-083 — Correct Falsehoods Early and Often (2026-01-27.2.md:L192, 2026-02-03.1.md:L279)

> "I want you (Copilot) to have a 'positive association' with these points at which your default (mostly RLHF-derived) instincts are trying to point you in the direction of a workaround rather than the direction of actual development." / "Copilot has an incredibly strong tendency to make an assertion that failures are 'predicted' or 'expected' by fiat... My root question stood on `c-libuv`. Show me what's going on with _that_."

### UC-084 — Live Documentation as Report Generator (2026-02-24.1.md:L1800)

> "Whether Live Documentation can be thought of as some kind of _report generator_ which can be run over a workspace/codebase. If we were to find that a (or _the_) dominant use-case for Live Documentation fits within this framing, it makes me wonder if our core offering is a report generator which helps stakeholders understand directories of complex interlinked files (i.e. codebases), which, to accomplish this report, incidentally has to calculate a bunch of workspace-wide pseudocode-AST."

### UC-085 — Directory-Level Recursive Documentation (2026-02-24.1.md:L200, L1321)

> "Recursive Live Documentation files for directories: Repeating the 'Purpose' and 'Notes' metadata fields found in the current set of generated Live Documentation files, directories themselves could describe their contents with purpose/notes, and directories containing directories could see that as part of their own effective connectivity." / "Perhaps we would configurably emit them to an alternate directory like `layer-3/`."

### UC-086 — Force Graph as Emergent Shape Viewer (2026-02-24.1.md:L2509)

> "I couldn't disagree more with this. The Force Graph view has been, in my experience, by far the most useful view that we offer. I can see the _emergent_ (non-directory-bound) shape of the entire application. I have watched the emergent shape of our application, especially during the early 2026 trimming and consolidation work, visibly simplify before my eyes."

### UC-087 — Circuit Board Reimagined as Interactive Map View (2026-02-24.1.md:L2080)

> "Right now, the Circuit Board is borderline useless for me and you. For you, it completely fills the DOM with elements. The shape of the whole codebase down to each leaf lays itself down in the DOM and floods your context window everytime. The user experience is not much better. It abstracts/hides insufficiently..."

[Partially addressed: Dev Day 78 (2026-03-17.1.md) — Progressive disclosure with directory-level aggregation, two-zone layout, squarified treemap, and dimmed sibling strips shipped. DOM saturation resolved. Remaining gaps: cross-directory dependency rendering, focus mode, search-to-navigate, and the full unified view continuum (UC-094). The **Membrane Map** (Dev Day 79, 2026-03-22) is the planned successor that addresses these remaining gaps.]

### UC-088 — Prompt File Distribution as "Last Mile" AI Integration (2026-02-20.1.md:L467, L624)

> "By providing prompt files which leverage whatever conventions are common for agent steering at the time of releasing the software, we can recreate virtually all of the AI-enabled functionality with a vastly reduced security burden on our own software." / "We do not know, and cannot expect to know, the exact shape of prompt files... New conventions evolve constantly, which is why... we should 'wait until the last possible second to decide on conventions'."

### UC-089 — Full Use-Case Census for Product Identity (2026-02-24.1.md:L2731)

> "Please leverage terminal or bespoke temp code to locate and extract all user prompts from the chat history... and export that to a temp markdown file. From there, attempt to locate a full unambiguous census of every user prompt which described _a way in which I wanted to use this software_. Let us use that to guide us."

### UC-090 — PCI-DSS Sensitive Data Mapping (2026-02-24.1.md:L2731)

> (User's new use case, stated in the prompt that initiated this census): "Provide, at the granularity of single data fields, a detailed map of all the code that sensitive data ever touches" — for PCI-DSS compliance, tracing exactly which code paths handle cardholder data, encryption keys, or PII, using the Live Documentation dependency graph as the map.

### UC-091 — Open-Source Repo Comprehension: Brain Simulator III (2026-03-01, user prompt)

> Understanding an open-source repo (https://github.com/FutureAIGuru/BrainSimIII) which the user wishes to understand and perhaps one day contribute to — generating useful documentation for a project the user did not author. This represents the "run it on someone else's codebase and learn from the output" use case: Live Documentation as a comprehension accelerator for unfamiliar codebases.

### UC-092 — Unity Game Cross-Version Unification (2026-03-01, user prompt)

> Unifying improvements to a closed-source Unity game ("We Need To Go Deeper") which have occurred across two separate versions — using Live Documentation independently on a Unity/C# codebase to understand divergent branches and reconcile them. Raises open questions about MonoBehaviour detection, ScriptableObject references, Unity's asset serialization (.meta files, .prefab, .asset YAML), and whether the polyglot complexity of Unity projects (C#, ShaderLab, HLSL, YAML, JSON manifests) presents tractable or intractable rakes.

### UC-093 — The Throughline: Reverse Polyglot Code into Common Markdown for Reasoning (across all dev days)

> The unifying thesis across all use cases: "We can-and-should reverse polyglot code into a common MarkDown convention so that we can reason about a workspace in numerous ways with ease." Every UC above is a facet of this core insight — that markdown-as-AST enables change impact analysis, compliance mapping, visualization, report generation, and AI-assisted development from a single auditable substrate.

### UC-094 — Unified View Continuum: Circuit Board → Local Map Semantic Zoom (2026-03-17.1.md:L2453)

> "Why are the circuit board and the local map separate? Once you're zoomed in to a single file, why can't one seamlessly switch to seeing the inbound/outbound dependencies for that one node in the Local Map's 3 column layout, all via transition-like CSS?" / "Okay, let's go with Option C with the plan in the back of our mind to, if we can wrangle the design, work our way up to Option B." The long-term product direction where the Circuit Board and Local Map merge into a single view with continuous zoom levels: directory tiles (workspace overview) → file cards (directory contents) → dependency neighborhood (Local Map's 3-column layout), with CSS transitions between zoom levels rather than tab switching. Currently deferred in favor of the two-zone layout (Option C), but declared as an aspiration that should inform incremental design decisions.

[This use case is the direct ancestor of the **Membrane Map** concept (Dev Day 79, 2026-03-22). Membrane Map formalizes the unified view continuum as a zoomable treemap with four rendering modes (Browse, Explore, Compare, Path). See [membrane-map.mdmd.md](../../.mdmd/layer-3/membrane-map.mdmd.md). Dev Day 80 (2026-03-23) began implementation: 12-step execution plan, 34 pure-math tests (layout, hierarchy, detail-levels, edge-bundling), DOM rendering, pin state management, focal overlay, SVG connections, URL state persistence via lz-string, and iterative visual playtesting with Playwright MCP. The four discrete modes were collapsed into a **continuous pin spectrum** (see UC-095). Dev Day 81 (2026-03-24) added pin-active dependency-flow layout (L→R columns via BFS + Kahn's topological sort), Internals pseudo-symbol absorption, LCA ancestor membranes with clickable escape-hatch navigation, and commitPrep.prompt.md codification. Dev Day 82 (2026-03-26) added FLIP position+scale animations for smooth visual transitions, deferred SVG connector drawing (await FLIP Promise), selection-only fast path via structural fingerprint, hover dimming (connection highlighting on symbol hover), and cross-column directory bands (trie-based hierarchical computation, Strategy B+C hybrid) where directory membranes span across dependency-flow columns with honest encapsulation and bare-band rendering for root-level files. 41/867 tests (pin-layout/total) green at session end; primary remaining challenges are back-trace animation, visual regression test suite creation, and L3 architecture doc update.]

### UC-095 — Continuous Pin Spectrum: Progressive Symbol Activation as Fundamental Interaction Model (2026-03-23.1.md:L1343)

> "it occurs to me that the vanilla 'local map' we have now is just a de-facto render of all public symbols (including the 'Internals' pseudo-symbol) of the focused node pinned simultaneously. If the symbol list inside one of these node cards had the ability to multi-pin and functionally 'select all', then the existing Local Map should re-emerge as a function of having activated all the pins in search of connections to them from a single hop away in either direction."

The Membrane Map's interaction model is a continuous spectrum driven by pin count, not discrete view mode switches. The spectrum: 0 pins = browse (spatial overview, no connections), 1 pin = single-symbol focal (that symbol's connections only), N pins = filtered multi-focus ("a view that doesn't exist anywhere today" — union of N symbols' connections), All pins = full Local Map equivalent. Compare emerges naturally from multi-node pinning; Path is a pin population strategy (BFS produces ordered pins with hop-index metadata) not a separate rendering mode. Three pin population strategies: manual click, omnisearch-to-symbol, and pathfinder BFS-to-pins — all produce pin sets consumed by the same rendering engine. This architectural insight means the Membrane Map needs only one connection renderer operating per-symbol, with mode complexity reduced to "how many pins are active and where did they come from."
