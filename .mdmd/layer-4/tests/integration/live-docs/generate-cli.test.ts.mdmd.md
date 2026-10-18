# tests/integration/live-docs/generate-cli.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/generate-cli.test.ts
- Generated At: 2026-10-18T00:39:29.731Z

## Authored
### Purpose
The generate CLI over a workspace given by `--workspace`: it reads that workspace's own `.live-docs.config.json` when no `--config` is given, and the file given when one is.

### Notes
- Written 2026-10-17. Until then `--workspace` without `--config` read no configuration and wrote the shipped default root, which the history probe of 2026-10-16 found and the history command's run over another repository would have met.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:fs`
- `node:os`
- `node:path`
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
