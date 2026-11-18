# T3 Code: from a fresh scan to a cross-provider explanation

Historical probe begun 2026-10-27. Authorized in [Turn 3](../../../ChatHistory/2026/10/2026-10-27.1.record.md#turn-3). The 2D companion and portable bundle are complete and transfer-tested. The isolated 3D trials failed; no live T3 provider trial was run.

## Open the result

- [Open the 2D map with the guide and path restored](http://localhost:8080/samples/t3-code/?s=N4IgbiBcDMA0IBsqgQewMYEMEFlMAdkR1UEBXAWwDsBxAqAdgCZ4BLAFwFMK7DIBGAGzwARpioATXlCYAGeAAtOrAOYL2AYVQBndlH4sQFbiIBO4zgFEwnKlU7bt%2B%2BMYpmLAZVYV8CVug4AT31ZeRBTVAB3ABlOGwR7RyhZADomAFYAX3gAM1RTdE4ac3wFIj8qAGtpGEN0BUxTFU4oaDCSBD9tVlRaekg61DJfVioVZxAqVAlOLwAvFsgAFnhtQLdSDywERf54FXMwIOSU2Qz4esbmgCVxZuT4CsqPdlNbFXYyyFT0%2BGGJTBcSz2JrBATwLifTimE5nC4cTgSABCgQACmROhMngB1VgST4TKYzABaqFQFGuDlYunEhROcBAkVYb1J5Mp3RpVDp3xSAE5MtlwlActhtJx4AArYWi8UgVBQADaIAVAB0QPhRmrYGqCPhtAB6MWmGymQ0FfUUdD4fUAeQKSl05nY%2BRwVo80KOhRS7G0WrVACo1QBdEDwVXqzWhnX4PWGj3Qs3ofX5eoOV6AnpUAC0YCY%2BoAKgo3pgJHgqJhmsYqOx3cb-Jxvb6oyBAyAQ0H4FQoCBdQajSbE8n7WmnZmc3nC8XS%2BIK9xbDWPfXG6GQKwiBRuxIMAa-DYs1v0JR5xnevvODsVCeqCkKBIQIK%2BArQF3ID2Y3346btObLda7anHUBF03UXL0fRXJxX39e9YGfbtezjY0E2-JMUwddN2DHXMCyLTgSzLWcqwXOswKcVZu2gzIOxAHJFXkWRqIADyIF831jftkJ-K1bWHQDnVMV18FrT0G3AgUgA). At 1440×900, wait for the entry to settle and collapse the left navigation to see both cards beside the guide; framing and sidebar preference are not shared by the URL.
- [Download the portable ZIP](http://localhost:8080/samples/t3-code-v0.1.3-live-documentation.zip) (13,267,724 bytes). Its README explains HTTP serving and reopening the saved exploration. The archive needs neither the T3 checkout nor a Live Documentation development installation to run.
- [Read the guide](delegation.md), [CLI evidence](inspection.json) and [verification results](validation.json), or compare the [unannotated bundle](http://localhost:8080/samples/t3-code-baseline/).

These local served artifacts are rebuildable outputs under `dist/explorer/samples/`; this committed probe, its source citations and its pictures preserve the findings. The archive SHA-256 is `daac14b63b6b75865d604e8cb3c7652f8d33f4d88c8be3522e9a98049139874c`.

## Question and evidence boundary

Can someone use Live Documentation to understand how T3 Code dispatches a task to another provider and returns the result? The initial computed Local Map is kept separate from later authored explanation. The root already read the [upstream evidence review](../../../Research/2026-10-27-t3-code.md); facts learned there are not credited to the generated map.

Target: upstream `pingdotgg/t3code` release `v0.1.3`, commit `d2c440312e5f39d59827ed466838a623516454d6`. No T3 dependencies or provider sessions are needed for the static scan. A live migration trial is a separate question.

Operational checkout and logs live, ignored, at `AI-Agent-Workspace/tmp/t3-code-2026-10-27/`. Generated Explorer output lives under `dist/explorer/samples/`; it is a rebuildable artifact, not committed source. This probe keeps the observations and selected pictures.

## Getting to the first scan

1. The getting-started guide installs this repository from source. The CLI package is private, its wrapper invokes monorepo TypeScript scripts, and this checkout has no compiled CLI. The root npm scripts also explicitly pass this repository's `.live-docs.config.json`; visualize passes this repository's board. These are not generic commands to copy into an unrelated project. This is a diagnostic run from the development checkout, not a completed package-first installation journey.
2. The generator's `--help` works and describes `--workspace` and configuration defaults. The Explorer builder's `--help` fails with `Unknown argument '--help'`. Reading its source shows that it uses the current working directory and accepts an output path, with no workspace flag. That source-reading step is a discoverability finding.
3. The GitHub connector supplied upstream metadata and files for research. A full local checkout is obtained with Git because the connector does not materialize a repository for scanning: `git clone --depth 1 --branch v0.1.3 --single-branch https://github.com/pingdotgg/t3code.git AI-Agent-Workspace/tmp/t3-code-2026-10-27/source`. The Windows-backed workspace takes noticeable time to materialize the 28,720 tracked files; this cost precedes analysis and must not be attributed to the generator.
4. Read the pinned upstream `AGENTS.md` and `.gitignore` from Git while checkout proceeded. `.repos/` is documented as vendored, read-only reference code. No exclusions have been added to conceal its effect on default discovery. The root instruction to produce the static Live Docs explanation authorizes generated documentation here; no T3 source implementation or upstream contribution is planned.

## Default scan and first correctness finding

Default discovery found 28,146 paths. The nested probe location triggers the generator's warning that another scan exists above it; the target remains the explicitly selected T3 root. The first generation attempt could not start because `/usr/bin/time` is absent. A Python subprocess wrapper records command, dates, elapsed time, exit code and peak child RSS in `generate-baseline.time.json`, with full output in `generate-baseline.log`.

The unmodified scan failed after **563.163 seconds**, with peak child RSS **1,026,752 KiB**. It indexed 65,441 symbol names and 115 declared entries, read 287 citations of 280 files, and wrote three Live Docs before `live-docs:generate failed: EISDIR: illegal operation on a directory, read`. T3's tracked `.claude/skills` symlink points to the `.agents/skills` directory. The installed glob library returns it even with `nodir: true`; discovery passes it onward as a file. That required a directory-classification repair before the computed baseline could exist. No T3-specific exclusion is appropriate.

The dependency resolver contains a product-specific `@live-documentation/` prefix and guessed aliases. A small diagnostic using `apps/server/src/mcp/toolkits/orchestrator/tools.ts` as the origin returned no file for `@t3tools/contracts`, but correctly resolved `../../OrchestratorMcpService.ts`. Independently, T3's contracts manifest declares the package name and its root export `./src/index.ts`, which exists. This is a confirmed resolution gap; the generated Dependencies sections and the CLI query confirm the missing connection below. No package-name substitution or hand-authored dependency has been used to hide it.

## Second correctness finding

The corrected discovery run wrote all 28,145 docs, then failed graph construction because the HTML adapter turned valid `href="/"` references into empty dependency specifiers. A complete grammar audit found exactly three affected docs. The repair preserves unresolved URL identity separately from filesystem lookup, including leading slashes and query-only references, and trims attributes before filtering external links or fragments. Its new regression failed before the fix; all 15 HTML adapter cases pass afterward. An older assertion that expected a missing leading slash was corrected because it encoded the defect.

All 137 HTML/HTM sources regenerated successfully in 784.476 seconds: 7 updated and 130 unchanged, retaining the other 28,008 docs. The complete original HTML set is preserved in a diagnostic ZIP. A full post-repair grammar audit passed with 28,145 docs and zero issues. The restarted full repository verification passed for this second repair; its final counts are recorded below. These failed scans are part of the newcomer account, not successful generation timings.

## What the initial Live Docs actually show

Read the complete generated docs for the tool definitions, handlers, MCP service, thread management, orchestrator, effect worker, turn-start service, session manager and adapter registry as they became available. Their Purpose and Notes remain pending. Relative-import connections locate the main services, and existing upstream documents citing source files become `Cited By` evidence automatically. These are source relationships, not a computed runtime sequence.

- The tool file exposes `OrchestratorToolkit`; the individual `delegate_task` declaration is private, so it is absent from that doc's Public Symbols. The subsequent browser review confirmed that searching the tool name returns no result.
- `@t3tools/contracts`, `@t3tools/shared/...` and `@t3tools/provider-core/...` remain unlinked package entries in Dependencies. Some signature types link through the separate workspace-wide name index. Those signature links are not evidence that the package-import resolver succeeded.
- `ThreadManagementService.ts` and `Orchestrator.ts` label the combined contracts dependency `(type-only)` despite also importing runtime values. This needs investigation of merging/rendering; it must not be interpreted as a reliable statement that those imports have no runtime use.
- `ProviderAdapterRegistry.ts` links its unqualified `ReadonlyArray` parameter type to the exported name in vendored `.repos/effect-smol/packages/effect/src/Array.ts`. The registry uses TypeScript's global array type, not an import of that vendored export. This is a false type-name link exposed by the larger workspace. Preserve it as a correctness finding, not a reason to exclude the reference tree.

These findings remain visible in the initial output. No dependency or signature link has been repaired by hand.

## Repair and evidence checkpoints

Discovery now asks what each symlink targets while preserving the existing traversal: file links remain files, directory links and missing targets do not become source. The regression failed against the original implementation and now passes with all eight existing discovery cases. It exercises both source and document discovery and explicit include paths. Before/after dependency inspection in Live Documentation itself preserves the same discovery → core → generator route. No tracked T3 implementation files were modified.

The first implementation accidentally combined glob's mutually exclusive `absolute` and `withFileTypes` options. Tests caught this immediately; a prematurely started scan also failed in 3.719 seconds. The corrected implementation uses each typed entry's full path. The corrected default scan is recorded separately as `generate-classified.log`; it failed after 3,160.273 seconds while constructing the graph, after writing all 28,145 docs. It selects 28,145 paths, removing only the directory symlink from the original set.

The [delegation explanation](delegation.md) is written from the released source and upstream lifecycle document. Its 17 pinned links resolve to 15 files in the checkout, with source-line references checked. It is authored interpretation; the initial generated map receives no explanatory prose before its first review.

The full `npm run safe:commit -- --e2e` verification for the discovery repair passed: lint/build, 1,407 unit tests, 113 integration tests, documentation and SlopCop audits, and all 206 Playwright cases. The chain completed in 2,337.516 seconds while T3 generation ran concurrently. These browser tests cover this repository and its existing samples; the separate T3-specific visual review is recorded below.

The reference files divide into 19,245 under `.repos/alchemy-effect` and 2,590 under `.repos/effect-smol`. The checkout has no tracked filename collisions under case folding. Scan timings are observations on this Windows-backed Linux workspace with concurrent verification, not an isolated performance benchmark or a prediction for another machine.

## Development invocation

These commands document the route used here, with Live Documentation's dependencies already installed. They are not a published-package installation recipe. Run the generator against T3's root with its shipped defaults, and run the Explorer builder **from T3's directory**, because that command currently takes its workspace from the current directory. Do not copy this repository's npm shortcuts: they explicitly pass its own configuration and board.

```bash
LD_REPO=/workspaces/Live-Documentation
T3_SCAN="$LD_REPO/AI-Agent-Workspace/tmp/t3-code-2026-10-27/source"

"$LD_REPO/node_modules/.bin/tsx" --tsconfig "$LD_REPO/tsconfig.base.json" \
  "$LD_REPO/scripts/live-docs/generate.ts" --workspace "$T3_SCAN"

cd "$T3_SCAN"
"$LD_REPO/node_modules/.bin/tsx" --tsconfig "$LD_REPO/tsconfig.base.json" \
  "$LD_REPO/scripts/live-docs/visualize-static.ts" \
  --output "$LD_REPO/dist/explorer/samples/t3-code-baseline" --history none
```

The corrected generation and baseline build succeeded. The build took 26.539 seconds and reports 28,145 files, 81,634 graph edges, 50 related documents and a 129.8 MB bundle. The existing local server serves `dist/explorer` at port 8080 and is left running. A portable static bundle also needs an HTTP server; opening an extracted `index.html` directly is not the delivery path being claimed here.

## First browser review

At 1440×900 in a fresh browser context, the initial Local Map lands on the scan root with much of its contents outside the viewport. The visible left-hand files and large empty centre do not explain where to begin. The exact user-facing tool name `delegate_task` returns “Nothing found.” The implementation appears first when searching `OrchestratorMcpService`, but that name came from source research, not discovery through this map. Selecting it pins and frames the service card; dense wires and off-screen neighbours make its wider context difficult to read.

The first 3D transition did not finish within the automation’s 30-second click window; the attempted error screenshot also failed. A separate existing browser test timed out concurrently. That test passed unchanged in the restarted full suite. The later isolated T3 trials below also failed, so the initial T3 interruption cannot be dismissed as overlap with the suite; its startup costs are traced in the Turn 6 follow-up below.

| Picture | State and finding |
| --- | --- |
| [01-baseline-landing.png](01-baseline-landing.png) | Fresh root; substantial clipping and no obvious starting subject. |
| [02-baseline-tool-search.png](02-baseline-tool-search.png) | `delegate_task` has no search result. |
| [03-baseline-service-search.png](03-baseline-service-search.png) | Known service name finds implementation first. |
| [04-baseline-service-2d.png](04-baseline-service-2d.png) | Selected and pinned service; much connected context lies off-screen. |
| [06-baseline-service-reader.png](06-baseline-service-reader.png) | Pending authored sections and generated dependencies; reader covers part of the card. |
| [07-baseline-destination-search.png](07-baseline-destination-search.png) | Destination is found with an explicit “the other way” badge. |
| [08-baseline-service-path.png](08-baseline-service-path.png) | The reverse route is offered; the neighbourhood remains visible. |
| [09-baseline-path-reader.png](09-baseline-path-reader.png) | File evidence beside the reverse-route offer. |
| [10-baseline-reversed-path.png](10-baseline-reversed-path.png) | Offered reverse link succeeds, but the destination card is clipped. |
| [11-baseline-path-zoomed-out.png](11-baseline-path-zoomed-out.png) | One Zoom Out still clips the right-hand card. |
| [12-baseline-compact-path.png](12-baseline-compact-path.png) | Compact alone leaves the wide test badges and clipping. |
| [13-baseline-path-tests-hidden.png](13-baseline-path-tests-hidden.png) | Hiding tests removes the wide badges; both files fit. |
| [14-baseline-path-navigation-collapsed.png](14-baseline-path-navigation-collapsed.png) | Collapsed navigation gives more room without changing the two-file question. |
| [15-guide-citation.png](15-guide-citation.png) | Ordinary generated Cited By link to the authored guide, low in the reader. |
| [16-guide-in-explorer.png](16-guide-in-explorer.png) | Embedded guide with local file links and separate pinned source citations. |
| [17-guide-to-orchestrator.png](17-guide-to-orchestrator.png) | Following the guide opens the Orchestrator Live Doc while keeping the path. |
| [18-guide-back-restored.png](18-guide-back-restored.png) | Visible desktop Back restores the guide and retained exploration. |
| [19-guide-navigation-collapsed.png](19-guide-navigation-collapsed.png) | Both service cards fit beside the guide after collapsing navigation. |
| [22-recipient-fresh.png](22-recipient-fresh.png) | First recipient capture during entry motion; not a settled framing verdict. |
| [23-recipient-readable.png](23-recipient-readable.png) | First recipient attempt after collapsing navigation; a card still overlaps the reader. |
| [25-recipient-settled.png](25-recipient-settled.png) | Recheck after layout/entry settling: expanded navigation leaves the destination obscured. |
| [26-recipient-navigation-collapsed.png](26-recipient-navigation-collapsed.png) | Settled recipient with navigation collapsed: both cards fit beside the guide. |
| [27-recipient-pan-overshoot.png](27-recipient-pan-overshoot.png) | An unnecessary fixed pan moves the origin out of view; this is a failed adjustment, retained as evidence. |

The [saved headless evidence](inspection.json) includes a two-hop MCP service → **ThreadLaunchService** → orchestrator import path. Delegation's implementation calls **ThreadManagementService** instead. The map is useful for locating related services, but shortest dependency paths must not be narrated as runtime call sequences.

The baseline is preserved before adding `docs/live-documentation-delegation.md`. The first guide named nine source files; the final guide names thirteen after adding the concrete provider drivers and adapters. Ordinary regeneration produced all their `Cited By` evidence, retaining pinned upstream citations. No generated region is hand-edited, and no authored World Map substitutes for the computed result.

The path direction deserves particular care: the UI draws offers → uses. ThreadManagementService therefore points to the MCP service that uses it, opposite to the request's call direction. Destination search accurately offers the reverse question. The CLI's outbound direction follows imports. This is a useful distinction with a substantial introductory cost; the guide explains it beside the example.

The two-file path initially still clips its destination. Compact alone does not remedy it. Hiding tests removes the wide test badges and lets both cards fit; collapsing navigation provides additional space. These are display choices within the same complete graph, not analyzer exclusions. The default evidence is retained above.

A planned power interruption stopped the first guide-generation attempt and the second full verification chain after browser case 95. The earlier browser failure occurred before the interruption. Both unfinished operations were restarted with separate `*-resumed` logs; the preserved baseline hashes match exactly. No successful completion is inferred from an interrupted log.

## Explaining and handing over the result

The guide's ordinary Markdown links produce Cited By evidence; the builder includes the document in its static data. Local file links open generated Live Docs, while separate pinned source links preserve the implementation evidence. The browser's Markdown download is byte-identical to the embedded authored guide. Following its Orchestrator link and pressing the visible desktop Back button restores the guide with the two-file path and both pins intact. An initial automation run targeted the responsive reader's hidden Back control; the visible desktop control succeeds. That script error is not presented as a product navigation failure.

At 1440×900 the reader covers part of the right-hand card with navigation expanded. Collapsing navigation makes both cards visible beside the prose. The sidebar preference is not shared in the exploration URL. The guide link is also below long generated dependency/dependent lists; an unassisted reader must find it there. These are concrete remaining difficulties in passing an explanation to someone else.

The initial nine-file citation generation was interrupted by the power cut; its restarted run succeeded in 1,106.775 seconds. The guide now names the concrete Codex and Claude drivers and adapters as well, giving 13 locally linked source files. Their four Cited By updates completed in 785.658 seconds. The final build took 15.512 seconds and carries 51 related documents. A comparison of every file’s outbound dependencies found no changes from the baseline; all baseline hashes still match, and the guide is bundled verbatim with exactly 13 Cited By links. Even this small authored addition rebuilds the workspace indices, making iteration expensive on this checkout. There is no claimed clean, unmodified first-attempt installation or cold successful full-scan timing: the completed baseline was reached through the failures and incremental repairs documented above.

## Final verification and outcome

The actual 13.3 MB ZIP was extracted into a separate temporary folder and served at a different origin, port 8766, with empty browser storage. It restored the two pins, two-file path, Compact layout, hidden tests and guide reader. A local guide link opened Orchestrator's Live Doc; browser Back restored the guide; downloaded Markdown matched the bundled guide byte for byte. All 13 observed requests stayed on the copied bundle's origin, with no page errors. The temporary copy contained no source checkout and its server/copy were removed after verification. The verified archive hash is recorded above and in `validation.json`.

The first recipient pictures were too early for a settled framing assessment. The recheck waited for the layout's idle state and entry motion. With navigation expanded, the reader still obscures the destination; collapsing navigation makes both cards fit. A subsequent unnecessary fixed pan overshot and hid the origin. The ZIP instructions therefore describe an adjustable view, not a guaranteed camera position. The state transfer succeeds; a self-evident visual handoff still needs work.

The separate 3D review used fresh 1440×900 headless Chromium contexts after all generation and the full browser suite had finished. Both the two-file guide path and the broader service neighbourhood timed out after a 120-second 3D transition window; each subsequent screenshot request timed out after five seconds. No successful 3D screenshot is claimed. At delivery the cause was untraced; the later startup investigation below identifies major CPU costs. This failure measurement remains specific to the large bundle in the development-container browser. The delivered explanation is verified in 2D.

The generic source-discovery repair is committed as `a357604c`; the HTML URL-identity repair as `cbb17f15`. The latter's full `npm run safe:commit -- --e2e` chain passed in 2,287.347 seconds: lint/build, 1,408 unit tests, 113 integration tests, documentation/SlopCop audits and all 206 browser tests. The first interrupted run and its earlier timeout are retained separately. No threshold was weakened, no T3-specific source exclusion was introduced, and no tracked T3 implementation file changed.

This rehearsal produced an explorable source explanation and a verified portable handoff, while exposing clear limits. Package installation still needs the development checkout; first useful generation required two product repairs; exact tool-name search provides no entry; workspace-package and type resolution have correctness gaps; default framing needs intervention; 3D failed this scale trial. A curated guide can connect known pieces effectively. Helping an unfamiliar person find those pieces remains a distinct unfinished part of the product. These are findings for the next design discussion, not approval of a new launcher, resolver or renderer.

## Owner-run hosting

At [Turn 5](../../../ChatHistory/2026/10/2026-10-27.1.record.md#turn-5), the owner’s browser showed [connection refused](28-owner-connection-refused.png). The bundle files remained present, but port 8080 had no listener. The earlier running preview did not persist through the handoff. To serve the existing URLs from the devcontainer, keep this command running in a terminal:

```bash
python3 -m http.server 8080 --bind 0.0.0.0 --directory /workspaces/Live-Documentation/dist/explorer
```

Refresh the existing shared link afterward. If needed, forward port 8080 in VS Code’s Ports panel. This serves the built output without regenerating it.

## Follow-up: the owner also cannot render 3D

After hosting the bundle themselves, the owner confirms 2D works and 3D freezes. The [startup investigation](3d-startup.md) measures the actual 21,720-node workload behind the two-file path, the repeated global name scans, and the exact-pair physics cost before the synchronous warmup can finish. It includes a raw browser CPU profile and an output-identical naming prototype. No product source has changed; the map-scope decision remains open.
