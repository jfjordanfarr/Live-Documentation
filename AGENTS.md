# Live Documentation: working notes for agents

This is the one place agents are told how to work in this repository. Vendor-specific files (`CLAUDE.md`, `.github/copilot-instructions.md`) only point here.

## What this is

Live Documentation turns a folder of source files into a map you can look at. It writes one markdown file per source file describing what that file exposes and what it is wired to. The Explorer (a static web page), the CLI, and the VS Code panel are renderings of those files and nothing more. It exists so a person can see how a system's pieces connect without reading the code or drawing the diagram by hand.

The full statement of intent is [the vision](.mdmd/layer-1/vision.mdmd.md). Read it before proposing features.

## How to work here

- **You own the code.** This is a single-owner repository where nearly every line was written by an agent. Nothing is "pre-existing" or "not my code." If a file can't be justified, delete it.
- **Stop at forks.** When there are two reasonable ways forward, or an assumption would decide the design, stop and ask. Do not pick one and keep going.
- **Fix causes, not gates.** Never lower a threshold, exclude a path, skip a test, or add a workaround to make a check pass. If a check is wrong, fix the check and say so. A passing suite is not the goal; being correct is.
- **Say what's true.** Disagree with the owner when the text says otherwise. Don't flatter. Don't invent deadlines or time estimates. Report failures with their output.
- **Prefer deletion.** The simplest correct form is the most correct form. All duplication is a smell. Excess code is a liability someone has to carry.
- **Read the whole file** when asked to read a file. No sampling.
- **Git needs care.** Never run bulk `git checkout`, `git restore`, or `git clean`. Commit only when asked. Commit messages must make sense to an outsider: no internal IDs, no "Option C."
- **Keep the product separate from this workspace.** This repo's own conventions (the `.mdmd` root, `layer-4`, the `.mdmd.md` extension) come from `.live-docs.config.json`. Product code reads configuration; it never hardcodes these.

## Workspace facts

- Linux devcontainer, bash, Node 22 (`.nvmrc`), TypeScript 5.
- npm workspaces: `packages/shared` (analysis engine and language adapters), `packages/scripts` (Explorer client and static builder, `inspect` pathfinder), `packages/generator` (the Live Doc generator and the evidence bridge), `packages/cli` (not yet publishable). CLI entry points are `scripts/live-docs/*.ts`.
- Live Docs for this repo are generated into `.mdmd/layer-4/`, one per tracked source file. Shipped defaults are `.live-documentation/source/*.md`.
- `.mdmd/layer-1` through `layer-3` are authored docs. Many are stale; see Status.
- `AI-Agent-Workspace/ChatHistory/` is the full chat record from October 2025 to April 2026. It is historical reference only, never a source of current facts.

## Commands that matter

| Command                                                                                         | What it does                                                                                   |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run build`                                                                                 | `tsc` for the four buildable packages (about 15 s)                                             |
| `npm run lint`                                                                                  | ESLint, type-aware (about 2 min)                                                               |
| `npm run test:unit`                                                                             | Vitest, 873 tests (about 30 s)                                                                 |
| `npm run test:e2e`                                                                              | Playwright against the built Explorer, 29 tests (about 2 min)                                  |
| `npm run test:integration`                                                                      | Vitest over `tests/integration/live-docs`: generator, CLI, Rosetta parity (~20 s)              |
| `npm run live-docs:generate`                                                                    | Regenerate `.mdmd/layer-4`. `--dry-run` reports drift; `--changed` limits scope                |
| `npm run live-docs:lint`                                                                        | Structural and link checks on generated docs                                                   |
| `npm run live-docs:inspect -- --from A [--to B] [--direction inbound\|outbound\|both] [--json]` | Dependency pathfinding. Run it before and after risky edits                                    |
| `npm run oracle:index -- <fixture>`                                                             | Write a fixture's compiler-resolved edges to its `expected/` (needs its language's indexer)    |
| `npm run oracle:compare -- <fixture>`                                                           | List where the shipped generator disagrees with a fixture's expected edges                     |
| `npm run live-docs:visualize`                                                                   | Build the static Explorer into `dist/explorer/`                                                |
| `npm run safe:commit`                                                                           | The full pre-commit chain. CI runs the same chain as `ci-check`                                |

After changing source, run `live-docs:generate` and commit the regenerated docs with the code.

## Documentation rules

- Markdown is canonical. Everything the Explorer or CLI shows must be derivable from the Live Docs. If a picture needs a fact the docs can't carry, grow the doc format rather than add a side channel.
- Never hand-edit a `LIVE-DOC:BEGIN` … `LIVE-DOC:END` region. Fix the generator.
- Authored `Purpose` and `Notes` explain what a file is for and what a maintainer must know. Write them for a new reader, not as a changelog. A chat-log citation is not required.
- Every authored doc is either current or historical. Historical docs say so in their first lines. Current docs may cite them as provenance but never depend on them for facts.
- Before deleting an authored document, find out why it was written (`git log`, and the chat record under `AI-Agent-Workspace/ChatHistory/`) and carry forward anything still true that lives nowhere else.
- Anything carried forward from the chat record or a retired document is written as dated history or as an open question, never as a current decision, unless the owner re-affirms it. Old certainty is the easiest thing to import and the hardest to notice.
- No requirement-ID schemes (`CAP-`, `REQ-`, `UC-`, `LD-`). Name things in plain words.

## Explorer client (`packages/scripts/src/live-docs/explorer/client/`)

- Layout math lives in pure modules with Vitest tests; DOM modules render from them. No jsdom tests: they pass when the UI is wrong. Visual behavior is verified with Playwright.
- The visual language is consistent across scales: inputs enter on one side and outputs leave on the other, colour-coded the same way everywhere (today left/green in, right/blue out; the owner is open to other designs). Fade the irrelevant; never boost the relevant. No emoji anywhere in the UI.
- Prefer a symbol's origin file over a barrel re-export when resolving links.
- View-specific doctrine (the Membrane Map's pin spectrum, font-size invariance) lives in `.mdmd/layer-3/membrane-map.mdmd.md`, and the vision's "one crafted rendering per scale" may revise it. Don't treat either as settled.

## Correctness

- Ground truth is never filtered. Whatever produces benchmark expectations, its output is not trimmed to fit the analyzer; adapter blocklists may remove only true framework or builtin names; a filter that can only raise false negatives is a bug.
- Adapters are the product, oracles are the ground truth, and nothing grades itself. A "precision" that compares an analyzer to a re-run of the same analyzer is not a measurement.

## Status (2026-09-27)

The cleanup pass is under way; the order of work is in the vision doc. Retired so far: the VS Code Electron test harness, the AST accuracy benchmark and its reports, the benchmark-only inference path and fixture oracles, the system layer and co-activation clustering, the headless harness, `live-docs:report`, `tech-debt` and `audit:network`. The VS Code extension shell and the language server went on 2026-09-27 as well; the editor panel described in the vision will be built fresh. The Circuit Board and Local Map views are being folded into one file-scale view. The compiler-backed oracle landed on 2026-09-27 (`scripts/oracle/`); every sample program whose language has an indexer in the devcontainer carries expectations, 17 of 21 (C and Ruby have none). The tree-sitter C#, Python, Java and Go adapters landed the same day; they match every compiler edge on their programs except the ones that need type inference and scip-go's package-symbol artifact, both recorded in the decisions log. Rust, Ruby, C and PowerShell are still hand-written scanners and are next, each measured the same way.
