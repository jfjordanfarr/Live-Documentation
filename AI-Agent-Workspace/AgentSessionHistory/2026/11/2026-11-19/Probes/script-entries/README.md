# Which files a package script starts: the every-word rule, measured

Current as of November 19, 2026. A builder measured this for the root at `0bb8bbbc`, before building anything. Nothing under `packages/` changed. The rule under test is the one the root recorded after [the second review](../../../2026-11-18/Probes/history-data-review/second-review.md) and [the third review](../../../2026-11-18/Probes/history-data-review/third-review.md) refused a rule built on a list of launchers: *every word of a script that resolves to an existing workspace file the tool analyses as code is an entry of that script, reading into quoted command lines.*

**Answer: the measurement says the recorded rule is wrong, so nothing was built.** On 983 real scripts the rule found no start that today's rule misses. It added 13 false entries and 2 arguable ones. Its notion of code lost 2 true starts that today finds. Every false entry it added is a tool's argument: a minifier's `-o min.js`, a `cp` target, a file a script rewrites. Only a list of each tool's flags could tell those apart from a file that is run, and a list is what this rule was meant to avoid. The verdict does not depend on what "code" is taken to mean. With today's filter in place of a code filter, the rule adds 15 false entries and still finds nothing new. Read as a shell reads it, with `(` and `)` as separators, the rule also puts a false entry on this repository's own engine manifest: from late September to October 16 the engine's `build` (at first the shared package's) copied the PowerShell emitter inside `node -e "…copyFileSync('src/…/powershell.emit-ast.ps1', 'dist/…')"`, and the history would show that build starting the emitter.

Every true start the rule finds that today's rule misses comes from the constructed rows: the reviews' cases, the wrapper forms in each wrapper's documentation, and my probes. Rule **B** below is today's rule, read through the same tokenizer, plus one positional reading of `--`. It finds every one of those starts that the reviews or the wrappers' documentation name. It misses two, both probes of mine that today's rule misses too: `node -r ./setup.js main.js` and `node --env-file .env server.js`. On real scripts B adds no false entry and loses no true start. Its one new false entry anywhere is the third review's constructed `node scripts/gen.mjs -- go x.js`. B is my recommendation; the choice is the root's.

## What was measured

- **This repository.** Every distinct script text over the first-parent line of `main`: 181 manifest versions under 12 manifest paths (`package.json`, the five current packages, and the retired `extension`, `scripts`, `server`, `shared` and `testing`). That gives 96 texts, 32 at the head and 64 earlier. Each was resolved against the tracked tree of the newest commit that held it, with that commit's `tsconfig` files in place, so that a `dist/` path maps back to its source as the adapter maps it.
- **The samples.** The three scripts of `tests/integration/fixtures/entry-points/workspace` and `tests/integration/programs/typescript/tidepool`. The estate sample is C# and has no `package.json`; no other sample or fixture has one.
- **Published packages.** These were not in the brief. This repository's scripts use no wrapper at all, so they cannot say how often a wrapper's form or an argument occurs. The 319 manifests installed under `node_modules` are real scripts written by other people, and 261 of them have scripts: 884 distinct texts. Each package's directory is its own workspace. A caution about this sample: published packages ship their build outputs and seldom their sources. So an output path names an existing file here more often than in a source checkout, where `dist/` is usually ignored. But a committed `min.js` or `umd/`, a `cp` target beside its source, and a `dist/` path that the `tsconfig` beside the manifest maps back to `src/` all occur in source repositories too.
- **Constructed rows, 43.** Every case of the two reviews, the brief's `eslint src/a.ts`, the nine wrapper forms the reverted tests took from each wrapper's documentation (dotenv-cli, concurrently, nodemon, start-server-and-test, `sh -c`, npm-run-all, the browser lane), and eight probes of my own for forms the corpus might hold: `node -r setup.js main.js`, `node --env-file .env`, `bash x.sh`, `> out.ts`, two test files, `cp`, `node -e`, a data argument. Their counts show which rule handles which form; they are not frequencies.

Each row was read by today's adapter (`jsonAdapter.analyze` on a manifest holding that one script) and by prototypes of each rule, using the adapter's own path resolution, copied verbatim. Every difference from today was then judged by reading the script: **T** a true start, **F** false, **A** arguable.

## The rules

**Today.** Split on `&&`, `||`, `;` and `|`; in each command, the first whitespace-separated token that looks like a path and names a workspace file that is not a tooling input.

**The tokenizer every other rule shares.** Quotes keep a word whole: `node "scripts/my script.js"` is one path. A `#` that begins a word begins a comment. `&` separates commands, except in `2>&1` and `&>`. A redirection's file (`<`, `>`, `>>`, `&>`, `<<<`) is not a word of the command. A backslash escapes only a quote, a backslash, whitespace or a shell operator, so `scripts\a.ts` stays a path. `(` and `)` stay inside words unless a column says otherwise. A quoted word that holds whitespace and does not itself name a file is read as a command line of its own.

**What "code" can mean in this engine.** The engine has three facts to draw that line with, and no fourth:
- `isToolingFile` names the inputs a tool reads (`tsconfig.json`, `*.config.ts`, a manifest).
- `hasReader` says whether a reader reads the file, by its name or its extension.
- The JSON adapter says of its own files that they hold configuration keys.

So "code" was taken as: a reader reads it, it is not a tooling input, and it is not JSON. That correctly drops `data/input.json`, `config/dev.env` and `check.log`. It also drops a shell script and an extensionless executable such as `bin/www` or `bin/http-server`. The engine cannot tell `bin/www` from `.env`: no reader handles either, and only a list of extensions or a look inside the file would separate them.

- **Recorded:** every word as above whose file is code.
- **Recorded, `(` `)` as a shell reads them:** the same rule, with `(` and `)` separating commands as they do in a shell.
- **Recorded, not after `--`:** the root's suggested variant. A word after a bare `--` does not count.
- **A:** today's rule read through the tokenizer. In each command, the first file that is not a tooling input counts, and a quoted command line is a command of its own. This is today's filter, not the code filter.
- **A, code only:** A with the code filter.
- **B:** A, plus one positional reading. A bare `--` begins a new command when the word after it is a program name: a word that is not a flag, not an assignment and does not look like a path (`dotenv -e f -- vite-node a.ts`, `lane --label gate -- node e2e.mjs`). What follows a `--` that is followed by a file or a flag stays the first command's arguments (`node gen.mjs -- data/input.json`, `tsx a.ts -- --watch x.js`). There is no list of launchers.

## Totals

Against today's entries. Real scripts are this repository's, its samples' and the published packages'. The constructed rows test forms; they are not frequencies.

| Rule (real scripts, 983) | Adds a true start | Adds a false entry | Adds an arguable one | Removes a false entry | Removes an arguable one | Loses a true start |
|---|---|---|---|---|---|---|
| Recorded | 0 | 13 | 2 | 5 | 1 | 2 |
| Recorded, `(` `)` as a shell reads them | 0 | 17 | 2 | 5 | 1 | 2 |
| Recorded, not after `--` | 0 | 13 | 2 | 5 | 3 | 2 |
| A | 0 | 0 | 0 | 5 | 1 | 0 |
| A, code only | 0 | 0 | 0 | 5 | 1 | 2 |
| B | 0 | 0 | 0 | 5 | 1 | 0 |
| Recorded, today's filter in place of code | 0 | 15 | 2 | 5 | 1 | 0 |

| Rule (the reviews' and documented cases, 43) | Adds a true start | Adds a false entry | Adds an arguable one | Removes a false entry | Removes an arguable one | Loses a true start |
|---|---|---|---|---|---|---|
| Recorded | 11 | 2 | 1 | 7 | 0 | 2 |
| Recorded, `(` `)` as a shell reads them | 11 | 2 | 1 | 7 | 0 | 3 |
| Recorded, not after `--` | 8 | 0 | 1 | 7 | 1 | 3 |
| A | 6 | 0 | 0 | 3 | 0 | 0 |
| A, code only | 9 | 0 | 0 | 7 | 0 | 2 |
| B | 9 | 1 | 0 | 3 | 0 | 0 |
| Recorded, today's filter in place of code | 11 | 7 | 1 | 3 | 0 | 0 |

## What the numbers say

- **On real scripts the recorded rule finds nothing new and adds a false entry wherever a tool names a file it writes or rewrites.**
  - Outputs: `terser index.js -c -m -o min.js`, `uglifyjs … --output dist/es5/uri.all.min.js`, `browserify index.js -o umd/eventemitter3.js`, `esm-d-ts gen ./src/index.js --output ./dist/index.d.ts`.
  - Copy targets: `cp lib/index.d.ts lib/index.d.cts`, four times.
  - A file a script rewrites: `node ../../tools/dedupe-types.js dist/cjs/index.cjs dist/esm/index.js`.

  Nothing in a word's position says which of a tool's arguments it runs, reads or writes. Only the tool's own flags say that, and knowing them is the list again.
- **Read as a shell reads them, `(` and `)` make the rule worse.** A JavaScript call inside `node -e "…"` splits into words that name files, so every `copyFileSync('a', 'b')` names its target. That is how this repository's own engine manifest gets a false entry for three weeks of its history. It also happens in three published packages. Keeping parentheses inside words avoids it only by luck. The quoted text is JavaScript, not a command line, and the rule has no way to know that.
- **The tokenizer is where the real gains come from, under every rule.** A redirection's file is not a word, so the bundles that `browserify … | derequire > dist/lie.js` and `deno bundle mod.ts > index.js` write stop being entries. That removes five false entries today makes on real scripts, and one arguable one (a transform's input on stdin). Comments, here-strings, `&>` and a quoted path with a space come right on the constructed rows too.
- **The code filter costs more than it saves.** On real scripts it removes no false entry. It loses `node ./bin/http-server` (http-server's own `start`) and ajv's `scripts/prepare-tests`, and on the probes `bash scripts/build.sh`. What it removes, `config/dev.env`, `.env.local`, `.env` and `check.log`, occurs only in the constructed rows. Today's rule makes the same entries there.
- **This repository is quiet.** At its head no rule changes any entry. In its history only the engine's `node -e` build differs, and only under a shell's reading of parentheses. Its scripts are `tsx … scripts/x.ts` and `node ./scripts/x.mjs` without wrappers. So whatever is chosen here is for the repositories this product will map, not for this one.
- **B's `--` reading is harmless on real scripts, but it is often wrong about what follows.** 38 real scripts hold a bare `--`, and in 11 of them a program name follows.
  - Four really hand on a command: `warun "…" -- npm run -s test:mocha`, and three of the form `npx -p typescript@5.3 -y -- tsc -p …`.
  - Seven hand an argument to a script: eslint's `node Makefile.js lint -- fix`, `generateRelease -- latest` and the like.

  None of the eleven names a file afterwards, so B and A agree on every real row. The reading is there for the documented wrappers: dotenv-cli, `npm exec --`, and this repository's browser lane, whose run of `node ./scripts/e2e-passes.mjs` after `--` is the case that started this work.

## Alternatives, and what each gives

1. **B, recommended.** It is today's rule with three changes. Scripts are tokenized as above. A quoted command line is a command of its own. A bare `--` followed by a program name begins one.
   - Gains: it finds every wrapper's start in the reviews and the documentation. It drops the redirected outputs, the commented and here-string false entries, and the stray half of a quoted path.
   - Losses: none on real scripts.
   - Cost: `-- go x.js` gives `x.js`. After a script's `--`, an argument that looks like a program name is read as a new command, and a file that follows it becomes an entry. Seven real scripts pass such an argument; none of them follows it with a file.
   - Still wrong, as today:
     - a data or environment file standing first in a command (`dotenv -e config/dev.env`, `tee check.log`);
     - a tool's output or a copy's source standing first (`babel -o legacy.js index.js` gives `legacy.js`; `cp src/worker.js dist/` gives `src/worker.js`);
     - text that a quoted word merely mentions (`echo "node b.js must run first"`);
     - a file run after a preload (`node -r setup.js main.js`).
2. **A.** B without the `--` reading. On real scripts it is the same as B. On the constructed rows it misses `dotenv … -- vite-node scripts/a.ts`, `dotenv … -- node scripts/serve.mjs` and the browser lane's `-- node ./scripts/e2e-passes.mjs`, and avoids `-- go x.js`. Choose it if a `--` handing on a command should wait for real evidence.
3. **The recorded rule, not after `--`.** It keeps all 13 false entries the recorded rule adds on real scripts. It also loses true starts after `--` (`npm exec -- tsx scripts/a.ts`) and the test a runner is handed after `--`. I do not recommend it.

**A smaller fork, separate from the rule.** A `.env` file is an input a tool reads (dotenv, `node --env-file`, Docker Compose), in the same way as the inputs `isToolingFile` already names by their names. Naming `.env`, `.env.*` and `*.env` there would remove `config/dev.env`, `.env.local` and `.env` from B's rows without dropping shell scripts. It would also make such a file a `tooling` entry on its own doc. I have not built it.

**The never-right cases of the third review, under B.**
- `node scripts\a.ts` is already right today, because the adapter's path resolution turns `\` into `/`. It stays right only if the tokenizer keeps a backslash before an ordinary character. A POSIX tokenizer would break it, as the history's branch did.
- `(cd x && node ../a.js)` is still not read: a path is resolved from the manifest's folder, not from a `cd`.
- `%VAR%` and `$(…)` are still not read. Today finds `node $(npm root)/../scripts/a.js` only because `root)/..` happens to cancel.

## Every row

In each rule's column, `=` means the same entries as today; `+` an entry the rule adds and `−` one it drops, each marked T, F or A. A column for one variant, the recorded rule with today's filter in place of code, is left out of the row tables and kept in the totals; its differences are judged in the last column.

### This repository at its head, and its two samples (35 scripts)

| Script | Text | Today | Recorded | Recorded, `(` `)` as a shell reads them | Recorded, not after `--` | A | A, code only | B | Judgment of each difference |
|---|---|---|---|---|---|---|---|---|---|
| `build` | `npm run build -w packages/engine && npm run build -w packages/explorer && npm run build -w packages/generator` | none | = | = | = | = | = | = |  |
| `lint` | `eslint .` | none | = | = | = | = | = | = |  |
| `test:unit` | `vitest run --project unit --project unit-serial` | none | = | = | = | = | = | = |  |
| `test:integration` | `vitest run --project integration` | none | = | = | = | = | = | = |  |
| `test:e2e` | `node ./scripts/e2e-bundles.mjs && node ./scripts/e2e-passes.mjs` | `scripts/e2e-bundles.mjs`, `scripts/e2e-passes.mjs` | = | = | = | = | = | = |  |
| `e2e:bundles` | `node ./scripts/e2e-bundles.mjs` | `scripts/e2e-bundles.mjs` | = | = | = | = | = | = |  |
| `verify` | `node ./scripts/verify.mjs` | `scripts/verify.mjs` | = | = | = | = | = | = |  |
| `safe:commit` | `node ./scripts/safe-to-commit.mjs` | `scripts/safe-to-commit.mjs` | = | = | = | = | = | = |  |
| `docs:links:enforce` | `tsx --tsconfig ./tsconfig.base.json scripts/doc-tools/enforce-documentation-links.ts` | `scripts/doc-tools/enforce-documentation-links.ts` | = | = | = | = | = | = |  |
| `slopcop:markdown` | `tsx --tsconfig ./tsconfig.base.json scripts/slopcop/check-markdown-links.ts` | `scripts/slopcop/check-markdown-links.ts` | = | = | = | = | = | = |  |
| `slopcop:assets` | `tsx --tsconfig ./tsconfig.base.json scripts/slopcop/check-asset-paths.ts` | `scripts/slopcop/check-asset-paths.ts` | = | = | = | = | = | = |  |
| `slopcop:symbols` | `tsx --tsconfig ./tsconfig.base.json scripts/slopcop/check-symbols.ts` | `scripts/slopcop/check-symbols.ts` | = | = | = | = | = | = |  |
| `livedocs` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/run-all.ts` | `scripts/live-docs/run-all.ts` | = | = | = | = | = | = |  |
| `live-docs:generate` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/generate.ts` | `scripts/live-docs/generate.ts` | = | = | = | = | = | = |  |
| `live-docs:lint` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/lint.ts` | `scripts/live-docs/lint.ts` | = | = | = | = | = | = |  |
| `live-docs:inspect` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/inspect.ts` | `scripts/live-docs/inspect.ts` | = | = | = | = | = | = |  |
| `live-docs:history` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/history.ts` | `scripts/live-docs/history.ts` | = | = | = | = | = | = |  |
| `live-docs:board` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/board.ts` | `scripts/live-docs/board.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-static.ts` | `scripts/live-docs/visualize-static.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:estate` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-sample.ts --program tests/integration/programs/csharp/estate --board board.md --output dist/explorer/samples/estate` | `scripts/live-docs/visualize-sample.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:rosetta` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-rosetta.ts` | `scripts/live-docs/visualize-rosetta.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:tidepool` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-sample.ts --program tests/integration/programs/typescript/tidepool --output dist/explorer/samples/tidepool` | `scripts/live-docs/visualize-sample.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:history-sample` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4 --collision-output dist/explorer/samples/history-collision --growth-output dist/explorer/samples/history-growth --veil-output dist/explorer/samples/history-veil` | `scripts/live-docs/visualize-history-sample.ts` | = | = | = | = | = | = |  |
| `oracle:index` | `tsx --tsconfig ./tsconfig.base.json scripts/oracle/index-fixture.ts` | `scripts/oracle/index-fixture.ts` | = | = | = | = | = | = |  |
| `oracle:compare` | `tsx --tsconfig ./tsconfig.base.json scripts/oracle/compare.ts` | `scripts/oracle/compare.ts` | = | = | = | = | = | = |  |
| `live-docs:orphans` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/find-orphans.ts --docs-root .mdmd --base-layer layer-4` | `scripts/live-docs/find-orphans.ts` | = | = | = | = | = | = |  |
| `contact:sheet` | `tsx --tsconfig ./tsconfig.base.json scripts/contact-sheet/contact-sheet.ts` | `scripts/contact-sheet/contact-sheet.ts` | = | = | = | = | = | = |  |
| `layout:lab` | `tsx --tsconfig ./tsconfig.base.json scripts/layout-lab/lab.ts` | `scripts/layout-lab/lab.ts` | = | = | = | = | = | = |  |
| `ci-check` | `node ./scripts/safe-to-commit.mjs --skip-git-status --check-live-docs` | `scripts/safe-to-commit.mjs` | = | = | = | = | = | = |  |
| `packages/cli/package.json build` | `tsc -p tsconfig.json` | none | = | = | = | = | = | = |  |
| `packages/cli/package.json watch` | `tsc -p tsconfig.json --watch` | none | = | = | = | = | = | = |  |
| `packages/explorer/package.json build` | `tsc -p tsconfig.json && tsc --noEmit -p src/client/tsconfig.json` | none | = | = | = | = | = | = |  |
| `tests/integration/fixtures/entry-points/workspace/package.json start` | `tsx src/cli.ts --quiet` | `tests/integration/fixtures/entry-points/workspace/src/cli.ts` | = | = | = | = | = | = |  |
| `tests/integration/fixtures/entry-points/workspace/package.json test` | `vitest run` | none | = | = | = | = | = | = |  |
| `tests/integration/programs/typescript/tidepool/package.json start` | `vite` | none | = | = | = | = | = | = |  |

### This repository's earlier scripts on the first-parent line of main (64 scripts)

| Script | Text | Today | Recorded | Recorded, `(` `)` as a shell reads them | Recorded, not after `--` | A | A, code only | B | Judgment of each difference |
|---|---|---|---|---|---|---|---|---|---|
| `test:e2e` | `npm run live-docs:visualize && npm run live-docs:visualize:estate && npm run live-docs:visualize:history-sample && npm run live-docs:visualize:rosetta && node ./scripts/e2e-passes.mjs` | `scripts/e2e-passes.mjs` | = | = | = | = | = | = |  |
| `marble:sheet` | `tsx --tsconfig ./tsconfig.base.json scripts/contact-sheet/marble-sheet.ts` | `scripts/contact-sheet/marble-sheet.ts` | = | = | = | = | = | = |  |
| `test:e2e` | `npm run live-docs:visualize && npm run live-docs:visualize:estate && npm run live-docs:visualize:history-sample && node ./scripts/e2e-passes.mjs` | `scripts/e2e-passes.mjs` | = | = | = | = | = | = |  |
| `test:e2e` | `npm run live-docs:visualize && npm run live-docs:visualize:estate && npm run live-docs:visualize:history-sample && npx playwright test --config tests/e2e/playwright.config.ts` | none | = | = | = | = | = | = |  |
| `live-docs:generate` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/generate.ts --config ./.live-docs.config.json` | `scripts/live-docs/generate.ts` | = | = | = | = | = | = |  |
| `live-docs:lint` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/lint.ts --config ./.live-docs.config.json` | `scripts/live-docs/lint.ts` | = | = | = | = | = | = |  |
| `live-docs:inspect` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/inspect.ts --config ./.live-docs.config.json` | `scripts/live-docs/inspect.ts` | = | = | = | = | = | = |  |
| `live-docs:board` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/board.ts --config ./.live-docs.config.json` | `scripts/live-docs/board.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-static.ts --config ./.live-docs.config.json --board .mdmd/layer-3/board.mdmd.md` | `scripts/live-docs/visualize-static.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:history-sample` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4 --collision-output dist/explorer/samples/history-collision --growth-output dist/explorer/samples/history-growth` | `scripts/live-docs/visualize-history-sample.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize:history-sample` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4 --collision-output dist/explorer/samples/history-collision` | `scripts/live-docs/visualize-history-sample.ts` | = | = | = | = | = | = |  |
| `test:unit` | `vitest run --project unit` | none | = | = | = | = | = | = |  |
| `format` | `prettier --check .` | none | = | = | = | = | = | = |  |
| `ci-check` | `node ./scripts/safe-to-commit.mjs --skip-git-status` | `scripts/safe-to-commit.mjs` | = | = | = | = | = | = |  |
| `live-docs:visualize:history-sample` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-history-sample.ts --output dist/explorer/samples/history --window-output dist/explorer/samples/history-window --window 4` | `scripts/live-docs/visualize-history-sample.ts` | = | = | = | = | = | = |  |
| `test:e2e` | `npm run live-docs:visualize && npm run live-docs:visualize:estate && npx playwright test --config tests/e2e/playwright.config.ts` | none | = | = | = | = | = | = |  |
| `packages/engine/package.json build` | `tsc -p tsconfig.json && node -e "require('node:fs').copyFileSync('src/live-docs/adapters/powershell.emit-ast.ps1', 'dist/live-docs/adapters/powershell.emit-ast.ps1')"` | none | = | +`packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1` F | = | = | = | = | `packages/engine/src/live-docs/adapters/powershell.emit-ast.ps1`: false, a copy target inside `node -e` JavaScript; the build copies the script, it does not run it |
| `pretest:e2e` | `npm run live-docs:visualize && npm run live-docs:visualize:estate` | none | = | = | = | = | = | = |  |
| `test:e2e` | `npx playwright test --config tests/e2e/playwright.config.ts` | none | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-static.ts --config ./.live-docs.config.json` | `scripts/live-docs/visualize-static.ts` | = | = | = | = | = | = |  |
| `build` | `npm run build -w packages/engine && npm run build -w packages/scripts && npm run build -w packages/generator` | none | = | = | = | = | = | = |  |
| `build` | `npm run build -w packages/shared && npm run build -w packages/scripts && npm run build -w packages/generator` | none | = | = | = | = | = | = |  |
| `live-docs:targets` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/build-target-manifest.ts` | `scripts/live-docs/build-target-manifest.ts` | = | = | = | = | = | = |  |
| `build` | `npm run build -w packages/shared && npm run build -w packages/scripts && npm run build -w packages/server` | none | = | = | = | = | = | = |  |
| `build` | `npm run build -w packages/shared && npm run build -w packages/scripts && npm run build -w packages/server && npm run compile -w packages/extension` | none | = | = | = | = | = | = |  |
| `fixtures:verify` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/verify-fixtures.ts` | `scripts/fixture-tools/verify-fixtures.ts` | = | = | = | = | = | = |  |
| `fixtures:update-hashes` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/update-fixture-hashes.ts` | `scripts/fixture-tools/update-fixture-hashes.ts` | = | = | = | = | = | = |  |
| `fixtures:record-fallback` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/record-fallback-inference.ts` | `scripts/fixture-tools/record-fallback-inference.ts` | = | = | = | = | = | = |  |
| `fixtures:regenerate` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/regenerate-benchmarks.ts` | `scripts/fixture-tools/regenerate-benchmarks.ts` | = | = | = | = | = | = |  |
| `fixtures:sync-docs` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/sync-ast-doc.ts` | `scripts/fixture-tools/sync-ast-doc.ts` | = | = | = | = | = | = |  |
| `tech-debt` | `tsx --tsconfig ./tsconfig.base.json scripts/analysis/tech-debt-detector.ts` | `scripts/analysis/tech-debt-detector.ts` | = | = | = | = | = | = |  |
| `audit:network` | `tsx --tsconfig ./tsconfig.base.json scripts/analysis/audit-network-usage.ts` | `scripts/analysis/audit-network-usage.ts` | = | = | = | = | = | = |  |
| `live-docs:system` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/system.ts --config ./.live-docs.config.json` | `scripts/live-docs/system.ts` | = | = | = | = | = | = |  |
| `live-docs:headless` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/headless.ts` | `scripts/live-docs/headless.ts` | = | = | = | = | = | = |  |
| `live-docs:report` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/report-precision.ts --config ./.live-docs.config.json` | `scripts/live-docs/report-precision.ts` | = | = | = | = | = | = |  |
| `live-docs:co-activation` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/co-activation.ts` | `scripts/live-docs/co-activation.ts` | = | = | = | = | = | = |  |
| `test:contracts` | `npm run test:contracts -w packages/server` | none | = | = | = | = | = | = |  |
| `test:integration` | `node ./tests/integration/clean-dist.mjs && npm run build && tsc -p tests/integration/tsconfig.json && node ./tests/integration/dist/vscode/runTests.js` | `tests/integration/clean-dist.mjs` | = | = | = | = | = | = |  |
| `test:benchmarks` | `node ./scripts/run-benchmarks.mjs` | `scripts/run-benchmarks.mjs` | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-explorer.ts --config ./.live-docs.config.json` | `scripts/live-docs/visualize-explorer.ts` | = | = | = | = | = | = |  |
| `live-docs:report` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/report-precision.ts` | `scripts/live-docs/report-precision.ts` | = | = | = | = | = | = |  |
| `live-docs:orphans` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/find-orphans.ts` | `scripts/live-docs/find-orphans.ts` | = | = | = | = | = | = |  |
| `packages/testing/package.json build` | `tsc` | none | = | = | = | = | = | = |  |
| `packages/testing/package.json clean` | `rimraf dist` | none | = | = | = | = | = | = |  |
| `packages/server/package.json test:contracts` | `echo "No contract tests yet"` | none | = | = | = | = | = | = |  |
| `rebuild:better-sqlite3:node` | `node ./scripts/rebuild-better-sqlite3.mjs` | `scripts/rebuild-better-sqlite3.mjs` | = | = | = | = | = | = |  |
| `rebuild:better-sqlite3:force` | `node ./scripts/rebuild-better-sqlite3.mjs --force` | `scripts/rebuild-better-sqlite3.mjs` | = | = | = | = | = | = |  |
| `test:unit` | `npm run rebuild:better-sqlite3:node --if-present && vitest run` | none | = | = | = | = | = | = |  |
| `graph:inspect` | `tsx --tsconfig ./tsconfig.base.json scripts/graph-tools/inspect-symbol.ts` | `scripts/graph-tools/inspect-symbol.ts` | = | = | = | = | = | = |  |
| `graph:audit` | `tsx --tsconfig ./tsconfig.base.json scripts/graph-tools/audit-doc-coverage.ts` | `scripts/graph-tools/audit-doc-coverage.ts` | = | = | = | = | = | = |  |
| `graph:snapshot` | `tsx --tsconfig ./tsconfig.base.json scripts/graph-tools/snapshot-workspace.ts` | `scripts/graph-tools/snapshot-workspace.ts` | = | = | = | = | = | = |  |
| `test:integration` | `node ./tests/integration/clean-dist.mjs && tsc -p tests/integration/tsconfig.json && node ./tests/integration/dist/vscode/runTests.js` | `tests/integration/clean-dist.mjs` | = | = | = | = | = | = |  |
| `live-docs:system` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/system.ts` | `scripts/live-docs/system.ts` | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize-explorer.ts` | `scripts/live-docs/visualize-explorer.ts` | = | = | = | = | = | = |  |
| `build` | `npm run build -w packages/shared && npm run build -w packages/server && npm run compile -w packages/extension` | none | = | = | = | = | = | = |  |
| `live-docs:visualize` | `tsx --tsconfig ./tsconfig.base.json scripts/live-docs/visualize.ts` | `scripts/live-docs/visualize.ts` | = | = | = | = | = | = |  |
| `fixtures:regenerate` | `tsx --tsconfig ./tsconfig.base.json scripts/fixture-tools/regenerate-ts-benchmarks.ts` | `scripts/fixture-tools/regenerate-ts-benchmarks.ts` | = | = | = | = | = | = |  |
| `verify` | `npm run lint && npm run rebuild:better-sqlite3:force && npm run test:unit && npm run test:integration` | none | = | = | = | = | = | = |  |
| `ci-check` | `npm run verify` | none | = | = | = | = | = | = |  |
| `test:integration` | `tsc -p tests/integration/tsconfig.json && node ./tests/integration/dist/vscode/runTests.js` | none | = | = | = | = | = | = |  |
| `verify` | `npm run lint && npm run test:unit && npm run test:integration` | none | = | = | = | = | = | = |  |
| `ci-check` | `npm run lint && npm run test:unit` | none | = | = | = | = | = | = |  |
| `rebuild:better-sqlite3:node` | `npm rebuild better-sqlite3` | none | = | = | = | = | = | = |  |
| `test:integration` | `node ./tests/integration/vscode/runTests.js` | none | = | = | = | = | = | = |  |

### The reviews' cases, the wrapper forms from each wrapper's documentation, and probes (43)

| Script | Text | Today | Recorded | Recorded, `(` `)` as a shell reads them | Recorded, not after `--` | A | A, code only | B | Judgment of each difference |
|---|---|---|---|---|---|---|---|---|---|
| `r2-gen` | `node scripts/gen.mjs -- data/input.json` | `scripts/gen.mjs` | = | = | = | = | = | = | `data/input.json`: false, data handed to the script |
| `r2-out` | `tsx scripts/a.ts -- --out docs/x.md` | `scripts/a.ts` | = | = | = | = | = | = | `docs/x.md`: false, an output path; a document is never in the index anyway |
| `r2-vitest` | `vitest run -- tests/a.test.ts` | `tests/a.test.ts` | = | = | −`tests/a.test.ts` A | = | = | = | `tests/a.test.ts`: arguable, the test vitest runs; a test is an entry by its archetype already |
| `r2-spaced` | `node "scripts/my script.js"` | `script.js` | +`scripts/my script.js` T<br>−`script.js` F | +`scripts/my script.js` T<br>−`script.js` F | +`scripts/my script.js` T<br>−`script.js` F | +`scripts/my script.js` T<br>−`script.js` F | +`scripts/my script.js` T<br>−`script.js` F | +`scripts/my script.js` T<br>−`script.js` F | `scripts/my script.js`: true start, the quoted path is what node runs<br>`script.js`: false, half of a quoted path |
| `r2-ampgt` | `node scripts/a.mjs &> scripts/b.mjs` | `scripts/a.mjs` | = | = | = | = | = | = |  |
| `r2-comment` | `node scripts/a.mjs # node scripts/b.mjs` | `scripts/a.mjs` | = | = | = | = | = | = |  |
| `r3-pnpm-yarn` | `concurrently "pnpm exec tsx scripts/a.ts" "yarn tsx scripts/b.ts"` | `scripts/a.ts` | +`scripts/b.ts` T | +`scripts/b.ts` T | +`scripts/b.ts` T | +`scripts/b.ts` T | +`scripts/b.ts` T | +`scripts/b.ts` T | `scripts/b.ts`: true start, concurrently's second command runs it |
| `r3-npm-exec` | `concurrently "npm exec -- tsx scripts/a.ts"` | `scripts/a.ts` | = | = | −`scripts/a.ts` T | = | = | = | `scripts/a.ts`: true start, npm exec runs tsx on it |
| `r3-cross-env` | `concurrently "cross-env NODE_ENV=dev node a.js" "node b.js"` | `a.js` | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | `b.js`: true start, concurrently's second command runs it |
| `r3-sh-env` | `sh -c "NODE_ENV=prod node a.js"` | `a.js` | = | = | = | = | = | = |  |
| `r3-nodemon-vite-node` | `nodemon --exec "vite-node src/main.ts"` | `src/main.ts` | = | = | = | = | = | = |  |
| `r3-dotenv-vite-node` | `dotenv -e config/dev.env -- vite-node scripts/a.ts` | `config/dev.env` | +`scripts/a.ts` T<br>−`config/dev.env` F | +`scripts/a.ts` T<br>−`config/dev.env` F | −`config/dev.env` F | = | +`scripts/a.ts` T<br>−`config/dev.env` F | +`scripts/a.ts` T | `scripts/a.ts`: true start, dotenv runs vite-node on it<br>`config/dev.env`: false, variables dotenv loads, not a program |
| `r3-esbuild` | `concurrently "esbuild src/main.ts --watch" "node b.js"` | `src/main.ts` | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | +`b.js` T | `b.js`: true start, concurrently's second command runs it |
| `r3-dot-data` | `node scripts/gen.mjs -- ./data/input.json` | `scripts/gen.mjs` | = | = | = | = | = | = | `data/input.json`: false, data handed to the script |
| `r3-quoted-data` | `node scripts/gen.mjs "./data/my input.json"` | `scripts/gen.mjs` | = | = | = | = | = | = | `data/my input.json`: false, data handed to the script |
| `r3-go-x` | `node scripts/gen.mjs -- go x.js` | `scripts/gen.mjs` | +`x.js` F | +`x.js` F | = | = | = | +`x.js` F | `x.js`: false, an argument of gen.mjs |
| `r3-herestring` | `cat <<< "node b.js"` | `b.js` | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | `b.js`: false, text fed to cat |
| `r3-echo` | `echo "node b.js must run first" && node a.js` | `a.js`, `b.js` | = | = | = | = | = | = |  |
| `r3-semicolon-comment` | `node a.js; # node b.js` | `a.js`, `b.js` | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | −`b.js` F | `b.js`: false, inside a comment |
| `r3-quoted-hash` | `node a.js '# node b.js'` | `a.js` | = | = | = | = | = | = |  |
| `r3-dashdash-watch` | `tsx scripts/a.ts -- --watch x.js` | `scripts/a.ts` | +`x.js` F | +`x.js` F | = | = | = | = | `x.js`: false, an argument of a.ts |
| `r3-backslash` | `node scripts\a.ts` | `scripts/a.ts` | = | = | = | = | = | = |  |
| `r3-subshell-cd` | `(cd x && node ../a.js)` | none | = | = | = | = | = | = |  |
| `r3-percent-var` | `node %SCRIPTS%\a.js` | none | = | = | = | = | = | = |  |
| `r3-command-subst` | `node $(npm root)/../scripts/a.js` | `scripts/a.js` | = | −`scripts/a.js` T | = | = | = | = | `scripts/a.js`: true start, node runs it; today finds it only because `root)/..` happens to cancel |
| `brief-eslint` | `eslint src/a.ts` | `src/a.ts` | = | = | = | = | = | = |  |
| `doc-browser-lane` | `node ./scripts/e2e-bundles.mjs && node ./scripts/browser-lane.mjs --label gate -- node ./scripts/e2e-passes.mjs` | `scripts/browser-lane.mjs`, `scripts/e2e-bundles.mjs` | +`scripts/e2e-passes.mjs` T | +`scripts/e2e-passes.mjs` T | = | = | = | +`scripts/e2e-passes.mjs` T | `scripts/e2e-passes.mjs`: true start, the lane runs it after `--` |
| `doc-cross-env` | `cross-env NODE_ENV=production node scripts/serve.mjs` | `scripts/serve.mjs` | = | = | = | = | = | = |  |
| `doc-dotenv` | `dotenv -e .env.local -- node scripts/serve.mjs --port 3000` | `.env.local` | +`scripts/serve.mjs` T<br>−`.env.local` F | +`scripts/serve.mjs` T<br>−`.env.local` F | −`.env.local` F | = | +`scripts/serve.mjs` T<br>−`.env.local` F | +`scripts/serve.mjs` T | `scripts/serve.mjs`: true start, dotenv runs node on it<br>`.env.local`: false, variables dotenv loads |
| `doc-concurrently` | `concurrently -n api,web "node scripts/api.mjs" "tsx scripts/web.ts --watch"` | `scripts/api.mjs` | +`scripts/web.ts` T | +`scripts/web.ts` T | +`scripts/web.ts` T | +`scripts/web.ts` T | +`scripts/web.ts` T | +`scripts/web.ts` T | `scripts/web.ts`: true start, concurrently's second command runs it |
| `doc-nodemon` | `nodemon --watch src --exec "tsx scripts/web.ts"` | `scripts/web.ts` | = | = | = | = | = | = |  |
| `doc-start-server-and-test` | `start-server-and-test 'node scripts/serve.mjs' http://localhost:3000 'node scripts/check.mjs'` | `scripts/serve.mjs` | +`scripts/check.mjs` T | +`scripts/check.mjs` T | +`scripts/check.mjs` T | +`scripts/check.mjs` T | +`scripts/check.mjs` T | +`scripts/check.mjs` T | `scripts/check.mjs`: true start, the test command it runs |
| `doc-sh-c` | `sh -c 'node scripts/api.mjs && node scripts/check.mjs'` | `scripts/api.mjs`, `scripts/check.mjs` | = | = | = | = | = | = |  |
| `doc-npm-run-all` | `npm-run-all clean lint build:*` | none | = | = | = | = | = | = |  |
| `doc-redirect` | `node scripts/check.mjs 2>&1 \| tee check.log` | `check.log`, `scripts/check.mjs` | −`check.log` F | −`check.log` F | −`check.log` F | = | −`check.log` F | = | `check.log`: false, the log tee writes |
| `probe-preload` | `node -r ./scripts/setup.js src/main.js` | `scripts/setup.js` | +`src/main.js` T | +`src/main.js` T | +`src/main.js` T | = | = | = | `src/main.js`: true start, node runs it after preloading setup.js |
| `probe-env-file` | `node --env-file .env src/server.js` | `.env` | +`src/server.js` T<br>−`.env` F | +`src/server.js` T<br>−`.env` F | +`src/server.js` T<br>−`.env` F | = | +`src/server.js` T<br>−`.env` F | = | `src/server.js`: true start, node runs it<br>`.env`: false, variables node loads |
| `probe-sh` | `bash scripts/build.sh && ./scripts/deploy.sh` | `scripts/build.sh`, `scripts/deploy.sh` | −`scripts/build.sh` T<br>−`scripts/deploy.sh` T | −`scripts/build.sh` T<br>−`scripts/deploy.sh` T | −`scripts/build.sh` T<br>−`scripts/deploy.sh` T | = | −`scripts/build.sh` T<br>−`scripts/deploy.sh` T | = | `scripts/build.sh`: true start, bash runs it<br>`scripts/deploy.sh`: true start, the command itself |
| `probe-redirect-out` | `node scripts/gen.mjs > src/generated.ts` | `scripts/gen.mjs` | = | = | = | = | = | = |  |
| `probe-mocha-two` | `mocha test/a.spec.js test/b.spec.js` | `test/a.spec.js` | +`test/b.spec.js` A | +`test/b.spec.js` A | +`test/b.spec.js` A | = | = | = | `test/b.spec.js`: arguable, a test mocha runs; an entry by its archetype already |
| `probe-copy` | `cp src/worker.js dist/worker.js && node scripts/build.mjs` | `scripts/build.mjs`, `src/worker.js` | = | = | = | = | = | = |  |
| `probe-node-e` | `node -e "require('fs').copyFileSync('src/emit.ps1', 'dist/emit.ps1')"` | none | = | = | = | = | = | = |  |
| `probe-python` | `python scripts/train.py --data data/train.csv --out models/` | `scripts/train.py` | = | = | = | = | = | = | `data/train.csv`: false, data handed to the script |

### Published packages installed under node_modules: the 27 scripts where any rule differs from today, of 884

| Script | Text | Today | Recorded | Recorded, `(` `)` as a shell reads them | Recorded, not after `--` | A | A, code only | B | Judgment of each difference |
|---|---|---|---|---|---|---|---|---|---|
| `ajv:test-browser` | `del-cli .browser && npm run bundle && scripts/prepare-tests && npm run test-karma` | `scripts/prepare-tests` | −`scripts/prepare-tests` T | −`scripts/prepare-tests` T | −`scripts/prepare-tests` T | = | −`scripts/prepare-tests` T | = | `scripts/prepare-tests`: true start, an extensionless shell script the command runs |
| `http-server:start` | `node ./bin/http-server` | `bin/http-server` | −`bin/http-server` T | −`bin/http-server` T | −`bin/http-server` T | = | −`bin/http-server` T | = | `bin/http-server`: true start, the package's own server, run by node |
| `eventemitter3:browserify` | `rm -rf umd && mkdir umd && browserify index.js -s EventEmitter3 -o umd/eventemitter3.js` | `index.js` | +`umd/eventemitter3.js` F | +`umd/eventemitter3.js` F | +`umd/eventemitter3.js` F | = | = | = | `umd/eventemitter3.js`: false, browserify's output (`-o`) |
| `eventemitter3:minify` | `uglifyjs umd/eventemitter3.js --source-map -cm -o umd/eventemitter3.min.js` | `umd/eventemitter3.js` | +`umd/eventemitter3.min.js` F | +`umd/eventemitter3.min.js` F | +`umd/eventemitter3.min.js` F | = | = | = | `umd/eventemitter3.min.js`: false, uglifyjs's output (`-o`) |
| `@humanwhocodes/retry:build:cts-types` | `node -e "fs.copyFileSync('dist/retrier.d.ts', 'dist/retrier.d.cts')"` | none | = | +`dist/retrier.d.cts` F | = | = | = | = | `dist/retrier.d.cts`: false, a copy target inside `node -e` JavaScript |
| `are-docs-informative:build:full` | `tsup src/index.ts --clean --format cjs,esm --outDir lib --dts && cp lib/index.d.ts lib/index.d.cts` | `lib/index.d.ts` | +`lib/index.d.cts` F | +`lib/index.d.cts` F | +`lib/index.d.cts` F | = | = | = | `lib/index.d.cts`: false, a `cp` target |
| `requires-port:test-travis` | `istanbul cover _mocha --report lcovonly -- test.js` | `test.js` | = | = | −`test.js` A | = | = | = | `test.js`: arguable, the test mocha runs; an entry by its archetype already |
| `requires-port:coverage` | `istanbul cover _mocha -- test.js` | `test.js` | = | = | −`test.js` A | = | = | = | `test.js`: arguable, the test mocha runs; an entry by its archetype already |
| `@es-joy/jsdoccomment:types` | `esm-d-ts gen ./src/index.js --output ./dist/index.d.ts --emitCTS` | `src/index.js` | +`dist/index.d.ts` F | +`dist/index.d.ts` F | +`dist/index.d.ts` F | = | = | = | `dist/index.d.ts`: false, the tool's output (`--output`) |
| `ignore:build` | `babel -o legacy.js index.js` | `legacy.js` | +`index.js` A | +`index.js` A | +`index.js` A | = | = | = | `index.js`: arguable, babel's input, compiled, not run |
| `@eslint/config-array:build:dedupe-types` | `node ../../tools/dedupe-types.js dist/cjs/index.cjs dist/esm/index.js` | `dist/cjs/index.cjs` | +`dist/esm/index.js` F | +`dist/esm/index.js` F | +`dist/esm/index.js` F | = | = | = | `dist/esm/index.js`: false, a file the tool script rewrites |
| `@eslint/config-array:build:cts` | `node ../../tools/build-cts.js dist/esm/index.d.ts dist/cjs/index.d.cts` | `dist/esm/index.d.ts` | +`dist/cjs/index.d.cts` F | +`dist/cjs/index.d.cts` F | +`dist/cjs/index.d.cts` F | = | = | = | `dist/cjs/index.d.cts`: false, the tool script's output |
| `@eslint/core:build:cts` | `node -e "fs.cpSync('dist/esm/types.d.ts', 'dist/cjs/types.d.cts')"` | none | = | +`dist/cjs/types.d.cts` F | = | = | = | = | `dist/cjs/types.d.cts`: false, a copy target inside `node -e` JavaScript |
| `@eslint/plugin-kit:build:cts` | `node ../../tools/build-cts.js dist/esm/index.d.ts dist/cjs/index.d.cts && node -e "fs.cpSync('dist/esm/types.d.ts', 'dist/cjs/types.d.cts')"` | `dist/esm/index.d.ts` | +`dist/cjs/index.d.cts` F | +`dist/cjs/index.d.cts` F<br>+`dist/cjs/types.d.cts` F | +`dist/cjs/index.d.cts` F | = | = | = | `dist/cjs/index.d.cts`: false, the tool script's output<br>`dist/cjs/types.d.cts`: false, a copy target inside `node -e` JavaScript |
| `immediate:build-node` | `browserify-transform-cli inline-process-browser unreachable-branch-transform < ./lib/index.js > ./lib/browser.js` | `lib/index.js` | −`lib/index.js` A | −`lib/index.js` A | −`lib/index.js` A | −`lib/index.js` A | −`lib/index.js` A | −`lib/index.js` A | `lib/index.js`: arguable, the transform's input on stdin, compiled, not run |
| `immediate:build-js` | `browserify -s immediate ./lib/browser.js \| derequire > dist/immediate.js` | `dist/immediate.js`, `lib/browser.js` | −`dist/immediate.js` F | −`dist/immediate.js` F | −`dist/immediate.js` F | −`dist/immediate.js` F | −`dist/immediate.js` F | −`dist/immediate.js` F | `dist/immediate.js`: false, the output a redirection writes |
| `assertion-error:build` | `deno bundle mod.ts > index.js` | `index.js` | −`index.js` F | −`index.js` F | −`index.js` F | −`index.js` F | −`index.js` F | −`index.js` F | `index.js`: false, the bundle a redirection writes |
| `html-entities:flow-type-gen` | `flowgen --add-flow-header dist/esm/index.d.ts -o dist/commonjs/index.js.flow` | `dist/esm/index.d.ts` | = | = | = | = | = | = | `dist/commonjs/index.js.flow`: false, the tool's output (`-o`) |
| `flatted:min` | `terser index.js -c -m -o min.js` | `index.js` | +`min.js` F | +`min.js` F | +`min.js` F | = | = | = | `min.js`: false, terser's output (`-o`) |
| `html-escaper:minify` | `uglifyjs index.js --comments=/^!/ --compress --mangle -o min.js` | `index.js` | +`min.js` F | +`min.js` F | +`min.js` F | = | = | = | `min.js`: false, uglifyjs's output (`-o`) |
| `uri-js:build:es5` | `rollup -c && cp dist/esnext/uri.d.ts dist/es5/uri.all.d.ts && npm run build:es5:fix-sourcemap` | `dist/esnext/uri.d.ts` | +`dist/es5/uri.all.d.ts` F | +`dist/es5/uri.all.d.ts` F | +`dist/es5/uri.all.d.ts` F | = | = | = | `dist/es5/uri.all.d.ts`: false, a `cp` target |
| `uri-js:build:es5:min` | `uglifyjs dist/es5/uri.all.js --support-ie8 --output dist/es5/uri.all.min.js --in-source-map dist/es5/uri.all.js.map --source-map uri.all.min.js.map --comments --compress --mangle --pure-funcs merge subexp && mv uri.all.min.js.map dist/es5/ && cp dist/es5/uri.all.d.ts dist/es5/uri.all.min.d.ts` | `dist/es5/uri.all.d.ts`, `dist/es5/uri.all.js` | +`dist/es5/uri.all.min.d.ts` F<br>+`dist/es5/uri.all.min.js` F | +`dist/es5/uri.all.min.d.ts` F<br>+`dist/es5/uri.all.min.js` F | +`dist/es5/uri.all.min.d.ts` F<br>+`dist/es5/uri.all.min.js` F | = | = | = | `dist/es5/uri.all.min.d.ts`: false, a `cp` target<br>`dist/es5/uri.all.min.js`: false, uglifyjs's output (`--output`)<br>`dist/es5/uri.all.js.map`: false, a source map the minifier reads |
| `ts-api-utils:build` | `tsup src/index.ts && cp lib/index.d.ts lib/index.d.cts` | `lib/index.d.ts` | +`lib/index.d.cts` F | +`lib/index.d.cts` F | +`lib/index.d.cts` F | = | = | = | `lib/index.d.cts`: false, a `cp` target |
| `lie:build-node` | `copyfiles -f src/index.js lib && browserify-transform-cli inline-process-browser unreachable-branch-transform es3ify < src/index.js > lib/browser.js` | `lib/browser.js` | −`lib/browser.js` F | −`lib/browser.js` F | −`lib/browser.js` F | −`lib/browser.js` F | −`lib/browser.js` F | −`lib/browser.js` F | `lib/browser.js`: false, the output a redirection writes |
| `lie:build-js` | `browserify -s Promise -p bundle-collapser/plugin . \| derequire > ./dist/lie.js` | `dist/lie.js` | −`dist/lie.js` F | −`dist/lie.js` F | −`dist/lie.js` F | −`dist/lie.js` F | −`dist/lie.js` F | −`dist/lie.js` F | `dist/lie.js`: false, the output a redirection writes |
| `lie:build-poly-js` | `browserify -p bundle-collapser/plugin ./polyfill.js \| derequire > ./dist/lie.polyfill.js` | `dist/lie.polyfill.js`, `polyfill.js` | −`dist/lie.polyfill.js` F | −`dist/lie.polyfill.js` F | −`dist/lie.polyfill.js` F | −`dist/lie.polyfill.js` F | −`dist/lie.polyfill.js` F | −`dist/lie.polyfill.js` F | `dist/lie.polyfill.js`: false, the output a redirection writes |
| `comment-parser:build` | `rimraf lib es6 browser; tsc -p tsconfig.json && tsc -p tsconfig.node.json && rollup -o browser/index.js -f iife --context window -n CommentParser es6/index.js && convert-extension cjs lib/` | `browser/index.js` | +`es6/index.js` A | +`es6/index.js` A | +`es6/index.js` A | = | = | = | `es6/index.js`: arguable, rollup's input, the bundle's entry, as `esbuild src/main.ts` is today |
