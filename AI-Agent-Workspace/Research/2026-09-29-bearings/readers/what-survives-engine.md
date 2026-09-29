# A reader's report: the engine's survivors

_Written on 2026-09-29 by a reader launched by the "what survives" explorer of [the second brief](../brief-2.md), on the hand-written adapters, the docstring bridges, `packages/engine/src/languages/`, the engine's other Copilot-era files and the November fixture workspaces. It returned after that explorer had written its report, so it is kept here as the reader handed it back, its headings moved one level down. It decides nothing; paths are relative to the repository root._

Paths are relative to /workspaces/Live-Documentation. I checked every quotation with `grep -n -F` or `sed -n` and confirmed its speaker by walking back to the turn's prefix.

How I measured reach: I grepped the imports of every file. One `live-docs:inspect` run confirmed the chain `heuristics/dom.ts -> sourceAnalysis.ts -> core.ts -> generator.ts -> scripts/live-docs/generate.ts` (4 hops, inbound). Every adapter is reached through the `ADAPTERS` list in `packages/engine/src/live-docs/adapters/index.ts`.

### 1. The hand-written adapters

**(a) When they arrived**

- C and Ruby: 2025-11-14 (`6086294a`, `4687cfc3`). The owner offered Ruby only as an option: "What's our next move? Rust docstrings? Ruby?" (`ChatHistory/2025/11/2025-11-14.md`, line 1835).
- PowerShell: 2025-11-20 (`c5678a94`). The owner asked: "At my day job, we have a TFS repo filled with an entire "Powershell Compendium" -- folder after folder of powershell scripts" (`2025-11-20.md`, line 375).
- ASP.NET markup and the DOM heuristic: 2025-11-17 (`80aba249`).
- HTML and CSS: 2025-12-09 (`512cd665`), after the owner asked "So if you delete an image file, our software will not know that it's going to affect the HTML file? Why not?" (`2025/12/2025-12-09.2.md`, line 1065).
- JSON: 2026-01-15 (`8a4b21c1`).

**(b) The owner's reactions**

- PowerShell: "I'm really particularly pleased that you were able to get this to work for PowerShell 5.1 syntax" (2025-11-20, line 2258). The fix behind that was the parser script running under Windows PowerShell 5.1 (agent, line 2247). That constraint is recorded only in the parser script's layer-4 Notes.

**(c) Reach:** every adapter is reached by `generate`.

**(d) What is true and lives nowhere else**

- **PowerShell is not a hand-written scanner.** `powershell.emit-ast.ps1` line 148 runs PowerShell's own `Parser::ParseFile`, so the vision's "until an oracle exists to measure a replacement" (vision, line 86) points at the wrong problem. The gaps are in resolution, not parsing:
  - In the fixture's own generated doc, `Import-Module "./modules/Inventory.psm1"` is left as an unlinked specifier.
  - `using module <Name>` is dropped, because for a bare name `ModuleSpecification` is null. I confirmed this by running the parser under the installed pwsh 7.5.4.
  - A call to a function from a dot-sourced script gets no symbol-level edge.
  - `.psd1` files return nothing.
  - `polyglot-adapters.mdmd.md` line 12 says adapters work "without shelling out to each language's toolchain". PowerShell shells out to pwsh.
- **The owner's real hidden-field case is a master page.** They wrote: "Let's say I have an ASPX master page file which supplies a hidden field to the javascript containing some important value from the server-side: let's say it's some connection string or identifier for Azure App Insights (this is something I actually do)" (2025-11-17, line 493). Nothing handles it:
  - `.master` appears nowhere in the code.
  - `aspnet.ts` registers only `.aspx`, `.cshtml` and `.razor` (line 16), and its directive pattern matches only `<%@ Page`.
  - `.ascx` appears in the default globs, in `MARKUP_EXTENSIONS` and in the DOM heuristic's list, but not in the adapter's extensions.
  - `polyglot-adapters.mdmd.md` line 44 has claimed `.aspx`, `.ascx`, `.master` since 2026-01-18. It was never true.
- **Missing targets are handled two ways.** HTML and CSS keep a missing target as an unresolved dependency, which is what the owner asked for: "Having the explorer visually flag broken links/dependencies would be absolutely phenomenal" (2025-12-09.2, line 263). ASP.NET silently drops a `<script src>` whose file is missing.
- **C and Ruby have limits written nowhere.** C resolves includes only relative to the including file, and its comment claims C++ extensions it does not register. Ruby never resolves a non-relative `require`, and its comment claims `.rake`, `Gemfile` and `Rakefile`.

**(e) Bathwater**

- `html.ts` and `css.ts` share 112 identical lines across five functions (they differ only in line endings).
- Four extension lists for ASP.NET markup disagree with each other.
- The parser script emits an `Errors` field that nothing reads.
- `polyglot-adapters.mdmd.md` line 63 still plans Javadoc and rustdoc parsing, which has been done.

### 2. The docstring bridges

**(a) When they arrived**

- The owner, before any of it was built: "That's where the docstring on a public symbol transports its way into the LiveDocs as the description for the symbol" (`2025-11-12.md`, line 562), and "we should absolutely be capable of inhaling a docstring for any public symbol" (line 634).
- `python.docstring.ts`: 2025-11-14 (`00960362`). The owner asked for tests that don't "totally destroy the future possibility of the docstring bridge becoming two-way" (2025-11-14, line 1124) and set the rule of the "_entire census_ of XML attributes" (line 1093). `RECOGNIZED_DOC_TAGS` in `csharp.xmldoc.ts` is that census.
- `csharp.xmldoc.ts`: split out of the C# adapter on 2025-12-10 (`8dceda22`).

**(b) The owner's reaction** (`2025/12/2025-12-12.1.md`, line 241): "the most utility I've gained is from the "code --> docs" docstring bridging relationship (which is freaking phenomenal)". The same turn put docs-to-code on "the backburner".

**(c) Still live, and called by the tree-sitter adapters.**

- Tree-sitter finds the comment nodes and hands the text to the Copilot-era parsers: `csharp.ts` line 225 and `python.ts` line 155.
- `java.javadoc.ts` and `rust.rustdoc.ts` are new since 2026-09-27. `jsDoc.ts` is reached through `symbolExtraction.ts`. C and Ruby carry their own parsers inside the adapter. PowerShell uses `GetHelpContent`.
- All of them fill one shape, rendered by `compose.ts` (lines 384 to 477) as `##### name — Summary / Remarks / Parameters / Type Parameters / Returns / Value / Exceptions / Examples / Links / Additional Documentation / Unsupported Doc Tags`.
- The graph index carries these as `sections`. Only the detail panel shows them, through `renderLiveDoc`. No view reads `sections`.

**(d) Lives nowhere current**

- The owner's verdict above. The vision never mentions symbol documentation, and "two-way" appears in no current document.
- The owner's ask for a view: "expand and see all the public symbols and their docstrings?" (`2025/11/Antigravity/11-20/83f976da-.../Refining UI Interactions.md`, line 363).
- `<inheritdoc/>` and `<include>` come out as raw tag text, not the inherited text.

**(e) Bathwater**

- `python.docstring.ts` has 25 exports; one is used outside tests.
- The layer-4 Notes for `csharp.xmldoc.ts` still say it reduced `csharp.ts` "from 1120 lines to 329 lines". It is 1,248 today.

### 3. `packages/engine/src/languages/`

**(a) When and why:** 2026-01-29 (`f8de9910`). The January report has the story. The owner's promises that day: "Am I crazy that a `LanguageSyntax` interface would be used for the _adapters_" (`2026/01/2026-01-29.1.md`, line 1181); "please make sure that we're building in async compatibility ... when it's time to union with tree-sitter" (line 1226); "What is the function of this common `LanguageSyntax` interface if not to thin (or at least harmonize) the language adapters themselves?" (line 2555).

**(c) September made it more live, not less.** In April its only callers were `c.ts` and two stdlib lists. Today:

- `getSyntaxByPath` has one product caller, `languageOf` in `compose.ts` (added in `fe08c9d8`, 2026-09-28). It limits a type reference to files of the same language, so the registry's grouping of extensions into languages is now load-bearing.
- `c.ts` uses `cSyntax.stripComments` and `isFrameworkType`.
- The Go, Java, Python and Rust tree-sitter adapters filter names through `isFrameworkType`.

What is dead:

- The comment and string delimiter data.
- The Go, Python, Ruby and PowerShell comment strippers (154 lines).
- `createSyncStripper` and the async wrapper. Tree-sitter came as a replacement, not a union.
- The C#, TypeScript, Ruby and PowerShell entries, which are reached only for their id.

**(d)**

- The filter runs by bare name before resolution. Rust's list includes `Result`, `Option`, `Vec`, `Box` and `String`, so a crate's own `type Result<T>` would be dropped. This is a question; I did not measure it.
- The registry's extensions disagree with the adapters' (C: `.cpp` and others against `.c`/`.h`; Ruby: `.rake`/`.gemspec` against `.rb`; Python: `.pyw`).
- TypeScript's real filter is a separate list in `symbolExtraction.ts` line 242 (it includes `Map`, `Set`, `Error`, `Promise`). The registry's TypeScript list has no caller.

**(e)** The layer-4 Purpose for `languages/index.ts` names a function, `stripCommentsAndStringsForPath()`, that does not exist.

### 4. `dom.ts` and the other Copilot-era engine files

- **`heuristics/dom.ts`** (2025-11-17, reached).
  - It matches only a literal id inside `document.getElementById` or `querySelector('#…')`.
  - It climbs at most three parent folders and descends only into folders named pages, views, shared, components, partials, wwwroot or areas.
  - It never scans `.master`.
  - "ClientID" appears in no code, no current doc and no owner turn. In my own understanding of WebForms (not the record), a control on a master page renders under a different client id unless its ClientIDMode is Static. That is a question for the owner.
- **`dependencies.ts`.** TypeScript module resolution is written by hand; it does not call the compiler's resolver.
  - It reads no tsconfig `paths`.
  - It hardcodes `@live-documentation/<pkg>` to `packages/<pkg>/src` (line 263, since `4145e5b3`, 2025-12-14), plus guesses for `@/`, `~/` and `@x/`.
  - This repository's own 68 imports through that scope, declared in `tsconfig.base.json`, resolve only because product code names this repository's scope. That is against `AGENTS.md` line 25.
- **`discovery.ts`** line 279 still exports the pre-fix `resolveTypeToLiveDoc`: it drops the file itself and prefers any other file, which is the rule `fe08c9d8` fixed in `compose.ts`. It is re-exported from `core.ts` line 101 and called by nothing.
- **`archetype.ts`** hardcodes the folder names `fixtures`, `spec` and `tests`.
  - The move of the sample programs on 2026-09-27 (`aec5f74b`) silently reclassified them. Before, their 184 docs were 148 implementation, 12 asset and 24 test. Today all 260 are "test".
  - The Explorer hides tests when "show tests" is off (`forceGraphView.ts` line 99, `localView/controller.ts` line 693, `membraneView/index.ts` line 293). The default is on.
  - Its layer-4 Purpose still says archetype picks the sections ("Observed Evidence"), which it no longer does.
- **`gitUtils.ts`** (`--changed`) and **`symbolExtraction.ts`**: live, with nothing unique found.

### 5. The November fixture workspaces

| Fixture                                                  | Arrived    | Read by                                                                     | Pattern                                                                                | Day job?          |
| -------------------------------------------------------- | ---------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------- |
| webforms-appsettings                                     | 2025-11-17 | `inspect-cli.test.ts` (2 tests)                                             | Hidden field, a literal `AppSettings` key, `CodeFile=` (the estate uses `CodeBehind=`) | Yes               |
| powershell-compendium                                    | 2025-11-20 | `powershell.test.ts` (top-level copy) and `inspect-cli` (`workspace/` copy) | Dot-source, `Import-Module`, `Export-ModuleMember`, comment help                       | Yes               |
| razor-appsettings, spa-runtime-config, csharp-reflection | 2025-11-17 | `inspect-cli`                                                               | `IConfiguration` plus `appsettings.json`; a TypeScript import; `Type.GetType("…")`     | No (ASP.NET Core) |
| blazor-telemetry, queue-worker                           | 2025-11-18 | `inspect-cli`, `aspnet.test.ts`                                             | Blazor host `data-` attributes; Hangfire                                               | No                |
| csharp-advanced-symbols                                  | 2025-10-28 | `polyglot-fixtures.test.ts`                                                 | XML docs, `protected internal`, events                                                 | Unclear           |
| slopcop-assets, slopcop-symbols                          | 2025-10-25 | SlopCop's own tests                                                         | Deliberately broken targets                                                            | No                |

- **webforms-appsettings.** The owner asked: "Design or resuse a **test fixture** for the scenario I have described involving tracing a javascript variable all the way back to a plaintext Web.config AppSettings key" (2025-11-17, line 593). The scenario is from 2025-11-06, line 3996. Their reaction: "I think my jaw about hit the floor ... This thing is absolutely a game changer" (2025-11-17, line 1752). Its field is literally `AppInsightsInstrumentationKey`: the owner's own case, moved off the master page. It has no `Globals.cs`.
- **powershell-compendium** holds two different copies of the same scripts in one fixture.
- **blazor-telemetry and queue-worker.** Hangfire was the agent's proposal (2025-11-18, line 212). The owner wrote "I don't know "queued worker pipelines"" (line 206) and named Hangfire in no turn of the record.
- **spa-runtime-config.** Its test is titled "resolves SPA alias imports", but `bootstrap.ts` has imported `./config/runtime` since its first commit. The `@app/*` alias its tsconfig declares is never exercised.
- **csharp-advanced-symbols.** Its README still describes "link-aware diagnostics", and its `docs/*.md` files are read only as asserted link text.

**What the fixtures hold that the estate lacks:**

- PowerShell. This is the only miniature of the day job's PowerShell.
- `CodeFile=`.
- Reflection by string.
- The ASP.NET Core patterns, which the agent chose; they are not the owner's estate.

**What neither holds, though the record names it:**

- The master page (2025-11-17, line 493).
- User controls.
- `web.config` XSLT transforms (decisions log, line 67, dictated 2025-10-21).

No current document says which real pattern each fixture encodes. `sample-programs.mdmd.md` line 7 defers to `testing-integration-architecture.mdmd.md`, which only lists them.

### Before-and-after questions

1. **The master page.** The owner's real hidden-field chain runs through a master page, and no adapter reads `.master` although the layer-3 doc says one does. Should the estate carry a master page and a user control, and do the owner's scripts read ids that ASP.NET rewrites (ClientID)? Only the owner can answer.
2. **PowerShell.** Its parse is already PowerShell's own, so does it need an oracle, or does it need resolution: modules by path, `using module`, and calls across dot-sourced scripts? The vision's wording depends on the answer. The code and the owner can answer.
3. **TypeScript aliases.** Should resolution read tsconfig `paths` and package names instead of this repository's scope, and should the SPA fixture finally test its alias? A measurement can answer.
4. **Which fixtures stay?** Which are the day job's miniatures, and which are modern .NET patterns the agent chose (Hangfire, Blazor, Razor)? Only the owner can answer.
5. **Docstrings in the view.** The owner called code-to-docs "freaking phenomenal", yet the vision never mentions symbol documentation and no view shows it. Does it belong on the Local Map's cards? Only the owner can answer.

### Not reached

- I read the C, Ruby, HTML, CSS and JSON adapters only in part, and the C and Ruby doc parsers not line by line.
- I did not check whether CI has pwsh; the PowerShell test skips itself when no runtime is found.
- I found no owner words on the JSON adapter's day (2026-01-15), or specifically asking for the razor, spa and reflection fixtures.
- I did not measure the Rust `Result` filter against the oracle.
- On disk only: `tests/integration/fixtures/simple-workspace/` is an untracked, empty-but-for-`data/` folder dated 2026-01-16.
