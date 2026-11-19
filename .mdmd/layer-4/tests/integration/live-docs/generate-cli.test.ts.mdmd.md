# tests/integration/live-docs/generate-cli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generate-cli.test.ts
- Generated At: 2026-11-12T17:12:34.512Z

## Authored
### Purpose
The generate CLI over a workspace given by `--workspace`: it reads that workspace's own `.live-docs.config.json` when no `--config` is given, and the file given when one is.

### Notes
- Written 2026-10-17. Until then `--workspace` without `--config` read no configuration and wrote the shipped default root, which the history probe of 2026-10-16 found and the history command's run over another repository would have met.
- Since 2026-11-12, after [the first-visit evaluation](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-12/Screenshots/first-visit/README.md): every `live-docs:*` command's `--help`, `-h` and an unknown option; another folder mapped end to end, docs then Explorer, by `--workspace`, with no board when its configuration names none; and the board a configuration names, read by the Explorer's build and the board command when none is given. The 31 commands start together in `beforeAll`, eight at a time, and each case reads its own run: one after another they took 167 s on a loaded machine and about 120 s on a quiet one; together, 36 s.
- Since 2026-11-19, after [the cold run](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/cold-run/README.md#the-strangers-steps-and-stumbles): the folder a person runs a command from, by `npm --prefix <checkout> run` from another folder, as npm really starts it. A relative `--workspace` and `--config` are taken from there, and with no `--workspace` that folder is mapped; before [the mend](../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/windows-and-cli/README.md) both cases failed, looking for the configuration in this checkout. The configuration is named in both so that a run taking its paths from this checkout stops before it writes anything there. The same day, a `--workspace` that names no folder or names a file, refused on one line with the path looked for by `generate` and `inspect` alike, and nothing made there; before the mend `generate` reported success over nothing.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `execFile`
- `node:fs`
- `node:os`
- `node:path`
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
