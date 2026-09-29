# A reader's report: 2025-12-16, the NotebookLM critique and Knowledge Sources

_Written on 2026-09-29 by a reader launched by the December 2025 explorer of [the brief](../brief.md), on `2025-12-16.1.md`, the day of the NotebookLM critique and the Knowledge Sources view. The explorer stopped at the model's usage limit before writing its own report, so this is kept as the reader handed it back, its heading moved one level down. It decides nothing; its line numbers are those of the transcript it names._

## Deep read of 2025-12-16.1.md (both sides, lines 1-2875, read whole)

Transcript: `/workspaces/Live-Documentation/AI-Agent-Workspace/ChatHistory/2025/12/2025-12-16.1.md`. Line numbers are that file's unless another file is named; each was checked with `grep -n`. Lines 1-319 are the ritual (summary, census) and a Zod 4 fix; nothing there bears on this. I wrote nothing to disk and ran no generating script, so nothing below is a fresh measurement: counts come from the decisions log and commit messages.

### 1. The critique and the follow-up

NotebookLM's four points:

1. **Heuristics are maintenance debt; move the base to compiler indexes.**
   - NotebookLM, 351: "trying to achieve and, more importantly, _sustain_ that 95% floor with custom heuristics just creates this, um, immense open-ended maintenance burden."
   - NotebookLM, 353-355: the evidence was C# recall at 85.4% "just because of an incomplete file globbing rule."
   - NotebookLM, 371: "strategically shift the base layer of fidelity. Move it away from proprietary heuristics and towards integrating these external, uh, compiler-grade semantic index formats."
   - NotebookLM, 379: "you put that engineering effort into incorporating SIP generation. Use a tool like `sip.net`." (its hearing of SCIP and scip-dotnet)
   - NotebookLM, 387: "de-risking the base 95% so you can focus all your expertise on that crucial 5% of cross-language insight."
2. **The LLM pipeline is high cost, low use.** NotebookLM, 411: "The policy is just too restrictive." Remedy, 431: a line from "a solid blue, which represents the deterministic, compiler-derived ground truth, to say a thin, dashed yellow line for a low-confidence LLM suggestion."
3. **The showcase is tied to an unfinished UI** (449). NotebookLM, 471: "You prioritize delivering the "headless" output."
4. **The Internals pseudo-symbol hides debt.** NotebookLM, 501: "it also hides the _magnitude_ of the technical debt"; 507: "instrument that internals pseudo-symbol"; 515: "It should get bigger and redder in the circuit board view."

The owner's follow-ups to NotebookLM:

- 556: a fact-check against the codebase. NotebookLM (559) said the critique relied "on several **stale assumptions**". It also cited "the Antigravity sessions (Dec 20)" (592), a date after the day it was asked. Neither the owner nor the agent remarked on it.
- 606, owner: "Has the project proposed any durable mechanisms to deal with the maintenance burden of custom heuristics? ... If not, what might be a useful mechanism to strengthen the system away from needing too many custom heuristics?" NotebookLM answered that it was already done: oracles that "consume compiler outputs" (617) and "External Feed Integration: The architecture supports incorporating standardized semantic index formats like **SCIP** or **LSIF**" (619).
- 645, owner: "I have removed the speculative LLM-derived NotebookLM critique file from the sources. I ask once more, now forcing you to go from the git commits". The second answer softened to ground truth "directly from compiler APIs or reliable static parsers" (659), and feeds dropped out of it. Its table (690) still called the oracles "**Implemented**".

So the owner's own checker told them twice that compiler-backed oracles existed. They did not.

### 2. The argument, 700-1340

**First reply, made without a search (700-796).** The agent dismissed point 1:

- Agent, 719: "the codebase _already has_ `scipParser.ts` and `lsifParser.ts`".
- Agent, 728: "The oracles ARE the durable mechanism."
- Agent, 767-771: lean away from SCIP/LSIF because it would "Contradict the offline-first security posture".
- Agent, 796: the critique is what "an intelligent but context-limited reviewer would conclude".

**Owner corrects (800):** "NotebookLM's context window is 1M tokens. Yours (via Github Copilot's limits) is ~128k tokens... I didn't see you performing much in the way of searches".

**Second reply, after searching (856-882), reverses the first.**

- Agent, 856: "my “context-limited reviewer” framing was off."
- Agent, 869: "But the C# oracle is _not_ Roslyn-backed; it’s a bespoke scanner with minimatch include/exclude in csharpFixtureOracle.ts. That’s still heuristics".
- Agent, 867: "Gamma Internals" "appears to be a made-up label."
- Agent, 879: the parsers exist but "the missing piece is the operational pipeline: generating those indexes reliably for target repos, offline, across ecosystems."

**scip-dotnet (884-950).** The agent's archaeology of 2025-12-11 (936): "**scip-dotnet was installed but never used.**" The owner overrides the shelving (950): "`scip-dotnet` is low-hanging fruit that we frankly _should_ consume if it's easy to. Our software tries to integrate truth from as many sources as is practicable within the security constraints we abide by." The agent offers three options (976-995) and a proof of concept; the owner declines for now (1024): "I'm just grappling with possibilities and tradeoffs".

**What "knowledge feeds" were**, by the agent's reading of the code (1114-1145):

- Agent, 1118: "The system discovers feeds by scanning `{workspaceRoot}/data/knowledge-feeds/*.json`", in SCIP, LSIF or the project's own snapshot format, normalized and ingested into SQLite.
- Agent, 1128-1132: "SCIP/LSIF consumption requires the language server"; "**CLI doesn't automatically discover/ingest feeds today**".
- Agent, 1140-1145: "**It doesn't talk to providers — it reads files.**" "This is **passive consumption**, not active generation."
- On reading headlessly, agent, 1073: "“consume SCIP/LSIF” is not inherently “VS Code-only”; it’s “available wherever you can read an index file”"; 1134: "The gap is narrow".
- The ladder, agent, 1077: "**SCIP/LSIF (compiler-grade)** > **IDE indexes (VS Code symbols)** > **heuristics** > **LLM hints**".

**Owner at 1084-1086** accepts no generation on other people's code, names compiler oracles the best proof, and leaves one thing unresolved: "a layer between heuristics and compilers whose entry points still elude me conceptually". The agent agrees (1164-1168) and offers to "prototype a minimal CLI entrypoint" (1193).

**Owner refuses the framing (1197):** ""Prototype" and "minimal" aren't quite the way we do things here." And challenges the directory: "Unless this is a silent directory that sits in common workspaces, I don't think I see anything like this at my day job."

The agent concedes:

- Agent, 1215-1217: "Which workspaces should _not_ have knowledge-feeds? Most of them."
- Agent, 1226: "**one optional convention**, not “the way”".
- The stance it proposes, agent, 1319-1321: "**Never generate compiler/build indexes by default**. **Always consume indexes if they are already present** (in a user-approved location). **Allow generation only via explicit opt-in**".
- It closes (1335) offering to walk the code for configurable feed locations "without writing any code yet."

**The turn.** The owner does not answer that offer. Their next message (owner, 1337): "Here's what I would really like: I would like for the Live Docs Explorer to **show me** where it is getting its information from, and **help guide me** to places and ways that I can rig up more information. Perhaps we need a new view -- not Circuit Board, not Local Map, not Force Graph, but Knowledge Sources."

**What was decided and built.** Nothing about oracles or feeds. The day's three feature commits are all Explorer: `2dce4c6e` (Local Map default and URL state), `af3277b7` (localStorage), `146d4d62` (Knowledge Sources). The agent's three-rule stance was never accepted or rejected in words.

### 3. The day-job use cases (agent, 1211-1313)

The agent never said plainly "this works today" or "this does not". It reframed (1211: "the killer feature isn’t “we can parse N languages”, it’s “I can ask a very human question about value flow / config flow / boundary crossings and get an auditable path.”") and listed what each would need.

- **JavaScript to Web.config (1256-1269).** Needs four edge kinds, and agent, 1264-1267: "Heuristics alone can get you some of this" plus "explicit “document/config symbol” modeling (Web.config keys as first-class nodes)". Feeds help only the C# part.
- **WCF contract to BiDictionary (1271-1287).** Agent, 1275: "compiler-grade indexing is hugely valuable"; heuristics as "gap filler" for "BiDictionary usage and “UNSET” fallbacks"; agent, 1287: "the UI should make it obvious what tier each edge came from."
- **SQL parameters (1289-1313).** Agent, 1290: "the nightmare mode". Model `proc`, `param`, `table`, `column`, `view` as nodes. Agent, 1310: "This won’t be “guaranteed correct” in the formal sense".

It did not take up Elixir, Hack, Go or Swift (owner, 1207) at all.

Against today, from the record rather than a run:

- The first use case is the estate sample in miniature. `/workspaces/Live-Documentation/tests/integration/programs/csharp/estate/expected/hand-verified-edges.json` lists `portal.js` to `Default.aspx` by `getElementById` on the hidden fields, markup to code-behind, and `Globals.cs` to `Web.config` by appSettings keys. The decisions log reports 17 of 20 hand-verified edges found.
- The second asks which value has no mapping. That is behaviour, which the vision excludes ("The map records interface and wiring, not behavior").
- The third: `.sql` files have Live Docs with procedures and tables as symbols, but `/workspaces/Live-Documentation/packages/engine/src/live-docs/adapters/sql.ts` contains no mention of parameters.

### 4. The thread forward

**January, twice.**

- 2026-01-13, the owner withdrew feed consumption. Owner, `/workspaces/Live-Documentation/AI-Agent-Workspace/ChatHistory/2026/01/2026-01-13.1.md`, line 499: "How feasible is it to ask users to throw SCIP/LSIF JSON files into a specific directory? That feels like rather un-fun UX." Owner, line 883: "this feature might be so unused as to warrant its total excision from our project and plan altogether... If those artifacts are not canonical things which a common workspace would have, then we must go without."
- Commit `cb35a274` (2026-01-13, "Descope SCIP/LSIF infrastructure") deleted the parsers, the detector and `data/knowledge-feeds/`, and its message says "Retire "Trust Ladder" phrase". The bridge had gone the day before in `0d89e857`.
- 2026-01-26, the oracle half came back. Owner, `2026-01-26.1.md`, line 3332: "onboarding **within the project alone** (not the eventual NPM package or VS Code extension we publish) **actual compilers to verify our AST benchmarks against**"; "We have these "fixture oracles" which are in many ways, for most languages, just more "heuristics"."
- `cb24c79b` and `c51d535c` (2026-01-27) followed. `c51d535c` added `scipNormalizer.ts` "for language-specific SCIP edge filtering" and set the go-mux threshold at "precision 70%, recall 5% to allow CI to pass".

**September.**

- `0de42d28` removed "the C and Ruby "oracles" (in-repo regex scanners) and the SCIP normalizer that filtered ground truth", along with an inference path "The shipped generator never called".
- `4c965539` added `scripts/oracle/`: `oracle:index` runs the indexer "over a temporary copy" and `oracle:compare` prints disagreements "as a list and never a score". First result: the shipped C# adapter matched "0 of 37 compiler edges".

**Is it what the owner described at 1084-1086?** Yes in kind. Compilers run only inside this workspace, on its own sample programs, and are never shipped. The owner, 2026-09-26 (`/workspaces/Live-Documentation/AI-Agent-Workspace/ChatHistory/2026/09/2026-09-26.1.md`, line 852): "Something done to prove the system we ship is working but not something our shipped system itself does." It is also the first version that measures the shipped adapters unfiltered.

**What is not met, or met differently:**

- **The "very very tight" loop (1086).** `/workspaces/Live-Documentation/tests/integration/live-docs/oracle.test.ts` says in its header that it "asserts the bookkeeping, not the adapter's score". `oracle:compare` is not in the gate script. An adapter that loses edges would not fail anything.
- **Coverage.** Sample programs only. No third-party repository (vendored fixtures went in `0de42d28`) and not this repository's own packages. C, Ruby, PowerShell, SQL and markup have no compiler oracle. Per the decisions log, type references "are not measured by anything yet".
- **Consuming an index a user already has.** Absent, by the owner's January word above. The decisions log says "No separate SQLite cache or external feeds are needed." The unresolved "layer between heuristics and compilers" was dropped, not answered. Its nearest living relatives are the vision's snapshots and the 2026-09-28 idea of "precomputed indexes" in ideas.md.
- **Showing where each fact came from.** Met on the World Map only: `/workspaces/Live-Documentation/packages/explorer/src/client/views/worldMap/controller.ts` draws a wire's basis and lists its evidence files. My search found no basis in the Local Map, the Membrane Map or the detail panel.

### 5. The Explorer half

**Commits 1 and 2.**

- The agent found `defaultView` and `initialFocusNode` already in the bundle schema but unwired (1382-1384).
- The owner corrected twice: 1709 "My view on initial load of the Explorer is not the Local Map", and 1748 "there is no default selection".
- On the entry point (owner, 1760): "Should we use a heuristic for this? I suppose I'm willing, but I also think it should be configurable perhaps?" The agent made it overridable by `?node=` and `viewerConfig`.
- Owner verdicts: 1884 "Looks awesome!"; 2064 the slider value restored but "didn't take any visual effect until I nudged the slider", a render-order bug the agent fixed; 2125 "Success! That worked like a charm!"

**Scoping the view.** The agent promised (2157) a view of "What data is this page using right now?" and "knowledge feeds discovered, where they're searched for, and why none are loaded if so". Asked for the non-minimal version (2164), it listed five tiers with hour estimates (2187-2223). The owner cut three:

- Owner, 2242, on per-edge provenance: "I have a sneaking suspicion that doing this will lead to an enormous amount of visual information overload. I'm open to being wrong on this".
- Owner, 2246, on Internals: "It is a fallback, absorbing what we do not know... "not enough confidence to proceed just yet"."
- Owner, 2250, on LLM tiers: "The user going through the Explorer should have to worry fairly little about the veracity of what they explore, **except in the Knowledge Sources view**."
- Agent, 2262: "**Knowledge Sources should be where epistemic humility lives**".
- Owner, 2296, approving the three-panel scope: "perhaps we make Knowledge Sources our default view for folks who have no localStorage history and no URL hints".

**As it landed.** The agent built it unseen (2435: "Since I can't directly see the browser") and described it only in the commit message (2863-2873). Owner, 2445-2449: "WOW! WOW WOW WOW!" and "The Knowledge Sources view has totally called us out on our barrel file!! (caveat: some items labeled as potential barrel files are likely not, and the actual barrel file is marked as over-depended-upon rather than a potential barrel file)."

In the code of `146d4d62`, the Data Provenance panel had three rows. One was the constant string "0 discovered (server-only feature)" for knowledge feeds. Nothing was discovered or counted. The guidance said "Place SCIP or LSIF JSON files in `data/knowledge-feeds/`", a path the static Explorer never read.

**Today**, `/workspaces/Live-Documentation/packages/explorer/src/client/panels/sources-view.ts` (463 lines, read whole):

- Data Provenance is one row with a constant, "The graph index in the static bundle".
- Graph Statistics: nodes, links, archetypes.
- Graph Health Warnings: fan-out of 50 or more is labelled "potential barrel file", fan-in of 30 or more "heavily depended-upon", top five each. These are the labels the owner's caveat called wrong, unchanged.
- Disconnected Nodes, added 2026-01-16.
- Related Documentation tree, How to Improve, and Export.

**Against the wish at 1337.**

- "show me where it is getting its information from": not met. No adapter or language breakdown, no count of edges by basis, no commit or time stamp, no list of files without an oracle.
- "help guide me": three generic bullets, one of which gives an `inspect` syntax that does not match AGENTS.md.
- Entry-point default: the heuristic survives in `/workspaces/Live-Documentation/packages/explorer/src/client/bootstrap/entry-heuristics.ts`. The configurable half went on 2026-09-28; the decisions log records "the viewer configuration hint, which nothing wrote". Only the URL overrides now.
- localStorage and shareable links: both survive under `/workspaces/Live-Documentation/packages/explorer/src/client/persistence/`. Recent searches were deferred (2125) and I found no sign they were built.
- Cold start moved to the Membrane Map on 2026-03-31 (`d6d1471f`).

### 6. What a reader of only the owner's turns would miss

1. **The agent's certainty was unearned, and the owner's method exposed it.** The first reply asserted that oracles had already solved the problem. One round of searching reversed it. The "prove it from the commits" move the owner used on NotebookLM (645) is the same one they used on the agent (800).
2. **The feeds row was a constant for nine months.** "0 discovered (server-only feature)" outlived the feed code, deleted 2026-01-13, and was removed only by `399b07ee` on 2026-09-28. The view meant to hold the project's honesty about its sources held a hard-coded claim.
3. **A question only the owner can answer.** In December they wanted provenance confined to one view (2250). On 2026-09-29 they wanted every claim to be a link, and the vision says every edge carries its evidence. Is Knowledge Sources still the home for "what we know and don't", or has hover-and-pin replaced it? The view is not named in the retirement plan.
4. **The withdrawal in January had a condition.** Feeds went because no canonical artifact exists in a common workspace. The vision's snapshots are a canonical artifact the tool itself would produce. Whether a snapshot is the answer to the layer that eluded them at 1086 is worth asking.
5. **The Internals caution is still live.** The owner's words at 2246 name barrels as "a black hole", and the 2026-09-28 growth list includes "the consuming symbol of an import". Any Membrane Map work that draws Internals rows inherits that doubt.
6. **Bathwater in the surviving view.** `sources-view.ts` renders emoji throughout, against the AGENTS.md rule "No emoji anywhere in the UI".
7. **A gate workaround on the day.** The agent found the cause of 25 lint errors (2695: the client was excluded from the tsconfig ESLint used), then chose "explicit eslint-disable directives" (2715), calling them "false positives". The owner did not object. Today the persistence code has no such directives and `eslint.config.js` lists the client tsconfig.
8. **Performance.** Owner, 2250: the Local Map of the main barrel draws "borderline abominations, which **chug** on my **bioinformatics rig desktop workstation**". The agent misread the workspace-wide counts as that file's, and the owner corrected it (2294).
9. **The December rule on process.** Owner, 1197: "We reason it out, deeply and fully, conclude on a path with open eyes, and implement the real thing." September's disposable probes are a different practice, which may be worth raising with the owner.
