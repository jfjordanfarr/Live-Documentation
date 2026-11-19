# tests/integration/live-docs/generate-cli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generate-cli.test.ts
- Generated At: 2026-11-19T20:23:44.659Z

## Authored
### Purpose
The generate CLI over a workspace given by `--workspace`: it reads that workspace's own `.live-docs.config.json` when no `--config` is given, and the file given when one is.

### Notes
- Written 2026-10-17. Until then `--workspace` without `--config` read no configuration and wrote the shipped default root, which the history probe of 2026-10-16 found and the history command's run over another repository would have met.
- Since 2026-11-12, after [the first-visit evaluation](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md): every `live-docs:*` command's `--help`, `-h` and an unknown option; another folder mapped end to end, docs then Explorer, by `--workspace`, with no board when its configuration names none; and the board a configuration names, read by the Explorer's build and the board command when none is given. The 31 commands start together in `beforeAll`, eight at a time, and each case reads its own run: one after another they took 167 s on a loaded machine and about 120 s on a quiet one; together, 36 s.
- Since 2026-11-19, after [the cold run](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles): the folder a person runs a command from, by `npm --prefix <checkout> run` from another folder, as npm really starts it. A relative `--workspace` and `--config` are taken from there, and with no `--workspace` that folder is mapped; before [the mend](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) both cases failed, looking for the configuration in this checkout. The configuration is named so that a run taking its paths from this checkout stops before it writes anything there. Later that day, at the root's ruling, the workspace when none is named: through `npm run` this checkout from its root and from `scripts/`, read from its committed docs by `inspect`; through `npm --prefix` another repository from its root and from a folder in it; and a folder with no configuration above it, which is its own workspace. The two cases run from a subfolder failed before the mend, one finding no docs and the other mapping the subfolder alone. The same day, a `--workspace` that names no folder or names a file, refused on one line with the path looked for by `generate` and `inspect` alike, and nothing made there; before the mend `generate` reported success over nothing. And the kinds of file no reader reads, named with their counts at the end of generation, in the case they are spelled, with a picture left out. And `live-docs:orphans` over docs the engine's writer wrote, one for a file whose name begins with a quotation mark (skipped on Windows, which allows no such name): each doc's source is held to what `parseLiveDoc` reads, and only the doc whose source is gone is listed. It passes before and after the mend under today's writer; it is the case that turns red, with the old pattern, once the writer quotes such a path ([the probe](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md#second-leg-november-19)). And a failing command, which says why on one line and how to see where, and with `--stack` prints the stack of the failure and of its cause; before the mend every command refused `--stack` as an option it did not know. And what git ignores: in a repository, a nested `.gitignore`'s `bin/` is left out; with git off the path, the same repository's `bin/` is documented and the run warns that only the root's `.gitignore` is read; outside a repository it says so in a line. Both lines were missing before the mend.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`, `execFileSync`
- `node:fs`
- `node:os`
- `node:path`
- [`document.parseLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
