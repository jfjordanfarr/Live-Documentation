# tests/e2e/served-build.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/served-build.test.ts
- Generated At: 2026-11-19T07:03:56.597Z

## Authored
### Purpose
Tests of [`served-build.ts`](./served-build.ts.mdmd.md): the port the suite's server takes, with the machine's answers stood in for, and the proof that a server serves this build, against small servers of temporary folders.

### Notes
- Written on 2026-11-19 ([Turns 36 and 37 of the November 18 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)). With the refusal of an answering port removed on purpose, its case failed; with the proof's comparison removed, the case of a server serving another folder failed.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:http` - `http`
- `node:net` - `AddressInfo` (type-only)
- `node:os` - `os`
- `node:path` - `path`
- [`served-build.PortProbes`](./served-build.ts.mdmd.md#symbol-portprobes)
- [`served-build.decidePort`](./served-build.ts.mdmd.md#symbol-decideport)
- [`served-build.proveServedFolder`](./served-build.ts.mdmd.md#symbol-proveservedfolder)
- `vitest` - `afterEach`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
