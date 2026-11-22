# `packages/engine/src/live-docs/adapters/go.module-probe.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/engine/src/live-docs/adapters/go.module-probe.test.ts`
- Generated At: 2026-11-22T05:38:26.412Z

## Authored
### Purpose
Holds the Go reader's walk up to its `go.mod` to the run's promise that the host is asked for each file once. The walk counts failed asks as well as successful ones. The test runs the reader over every Go file of the `go/depot` sample, in path order, on one run's reads, with a host that counts each call. It fails when any path is asked of the host more than once.

### Notes
- Written on 2026-11-22 by the engine review of that day's work ([its record](../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/engine-review/README.md)). A failed read is kept by no one (`workspaceReads`), so each Go file of a folder that holds no `go.mod` asks the host again for that absent file. A whole scan of the sample asked 32 times for eight files that do not exist. The page check cannot see this, because its stand-in counts a read only when the file is there. The design moves such probes to `kind` from the listing in its step 4; until then this case is red. When the review committed it, it failed with `report/go.mod` and `stock/go.mod` asked four times each and `store/go.mod` three times.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:path`
- [`go.goAdapter`](./go.ts.mdmd.md#symbol-goadapter)
- [`nodeHost.NODE_FILE_HOST`](../../tooling/nodeHost.ts.mdmd.md#symbol-node_file_host)
- [`workspaceFiles.workspaceReads`](../../tooling/workspaceFiles.ts.mdmd.md#symbol-workspacereads-function)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
