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
- Since 2026-11-12, after [the first-visit evaluation](../../../../../AI-Agent-Workspace/Screenshots/2026-11-12/first-visit/README.md): every `live-docs:*` command's `--help`, `-h` and an unknown option; another folder mapped end to end, docs then Explorer, by `--workspace`, with no board when its configuration names none; and the board a configuration names, read by the Explorer's build and the board command when none is given. The 31 commands start together in `beforeAll`, eight at a time, and each case reads its own run: one after another they took 167 s on a loaded machine and about 120 s on a quiet one; together, 36 s.

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
