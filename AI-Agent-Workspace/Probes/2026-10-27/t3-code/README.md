# T3 Code: from a fresh scan to a cross-provider explanation

Historical probe begun 2026-10-27. Authorized in [Turn 3](../../../ChatHistory/2026/10/2026-10-27.1.record.md#turn-3). Work in progress: findings below are checkpoints, not a claim of a finished map or runtime validation of T3.

## Question and evidence boundary

Can someone use Live Documentation to understand how T3 Code dispatches a task to another provider and returns the result? The initial computed Local Map is kept separate from later authored explanation. The root already read the [upstream evidence review](../../../Research/2026-10-27-t3-code.md); facts learned there are not credited to the generated map.

Target: upstream `pingdotgg/t3code` release `v0.1.3`, commit `d2c440312e5f39d59827ed466838a623516454d6`. No T3 dependencies or provider sessions are needed for the static scan. A live migration trial is a separate question.

Operational checkout and logs live, ignored, at `AI-Agent-Workspace/tmp/t3-code-2026-10-27/`. Generated Explorer output will live under `dist/explorer/samples/`; it is a rebuildable artifact, not committed source. This probe keeps the observations and selected pictures.

## Getting to the first scan

1. The getting-started guide installs this repository from source. The CLI package is private, its wrapper invokes monorepo TypeScript scripts, and this checkout has no compiled CLI. The root npm scripts also explicitly pass this repository's `.live-docs.config.json`; visualize passes this repository's board. These are not generic commands to copy into an unrelated project. This is a diagnostic run from the development checkout, not a completed package-first installation journey.
2. The generator's `--help` works and describes `--workspace` and configuration defaults. The Explorer builder's `--help` fails with `Unknown argument '--help'`. Reading its source shows that it uses the current working directory and accepts an output path, with no workspace flag. That source-reading step is a discoverability finding.
3. The GitHub connector supplied upstream metadata and files for research. A full local checkout is obtained with Git because the connector does not materialize a repository for scanning: `git clone --depth 1 --branch v0.1.3 --single-branch https://github.com/pingdotgg/t3code.git AI-Agent-Workspace/tmp/t3-code-2026-10-27/source`. The Windows-backed workspace takes noticeable time to materialize the 28,720 tracked files; this cost precedes analysis and must not be attributed to the generator.
4. Read the pinned upstream `AGENTS.md` and `.gitignore` from Git while checkout proceeded. `.repos/` is documented as vendored, read-only reference code. No exclusions have been added to conceal its effect on default discovery. The root instruction to produce the static Live Docs explanation authorizes generated documentation here; no T3 source implementation or upstream contribution is planned.

## Default scan and first correctness finding

Default discovery found 28,146 paths. The nested probe location triggers the generator's warning that another scan exists above it; the target remains the explicitly selected T3 root. The first generation attempt could not start because `/usr/bin/time` is absent. A Python subprocess wrapper records command, dates, elapsed time, exit code and peak child RSS in `generate-baseline.time.json`, with full output in `generate-baseline.log`.

The unmodified scan failed after **563.163 seconds**, with peak child RSS **1,026,752 KiB**. It indexed 65,441 symbol names and 115 declared entries, read 287 citations of 280 files, and wrote three Live Docs before `live-docs:generate failed: EISDIR: illegal operation on a directory, read`. T3's tracked `.claude/skills` symlink points to the `.agents/skills` directory. The installed glob library returns it even with `nodir: true`; discovery passes it onward as a file. A directory-classification repair is needed before the computed baseline can exist. No T3-specific exclusion is appropriate.

The dependency resolver contains a product-specific `@live-documentation/` prefix and guessed aliases. A small diagnostic using `apps/server/src/mcp/toolkits/orchestrator/tools.ts` as the origin returned no file for `@t3tools/contracts`, but correctly resolved `../../OrchestratorMcpService.ts`. Independently, T3's contracts manifest declares the package name and its root export `./src/index.ts`, which exists. This is a confirmed resolution gap; its manifestation in the full generated docs remains to be checked. No package-name substitution or hand-authored dependency has been used to hide it.

## Next checkpoint

Retain the default generation outcome and initial bundle, inspect the actual docs, then decide the appropriate product repair from the evidence. No Explorer screenshot or T3 runtime experiment has run yet.

## Repair and evidence checkpoints

Discovery now asks what each symlink targets while preserving the existing traversal: file links remain files, directory links and missing targets do not become source. The regression failed against the original implementation and now passes with all eight existing discovery cases. It exercises both source and document discovery and explicit include paths. Before/after dependency inspection in Live Documentation itself preserves the same discovery → core → generator route. No T3 source files were modified.

The first implementation accidentally combined glob's mutually exclusive `absolute` and `withFileTypes` options. Tests caught this immediately; a prematurely started scan also failed in 3.719 seconds. The corrected implementation uses each typed entry's full path. The corrected default scan is recorded separately as `generate-classified.log`; its final timing is pending. It selects 28,145 paths, removing only the directory symlink from the original set.

The [delegation explanation](delegation.md) is drafted from the released source and upstream lifecycle document. Its 13 pinned links resolve to 11 files in the checkout, with source-line references checked. It is authored interpretation; the initial generated map receives no explanatory prose before its first review.

The full `npm run safe:commit -- --e2e` verification for the discovery repair passed: lint/build, 1,407 unit tests, 113 integration tests, documentation and SlopCop audits, and all 206 Playwright cases. The chain completed in 2,337.516 seconds while T3 generation ran concurrently. These browser tests cover this repository and its existing samples; the T3-specific visual review is still pending.

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

Generation is running; the build invocation above is the next step, not yet a successful result. The existing local server serves `dist/explorer` at port 8080 and is left running. A portable static bundle also needs an HTTP server; opening an extracted `index.html` directly is not the delivery path being claimed here.
