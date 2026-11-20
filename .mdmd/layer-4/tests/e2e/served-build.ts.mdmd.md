# `tests/e2e/served-build.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/e2e/served-build.ts`
- Generated At: 2026-11-19T21:10:24.170Z

## Authored
### Purpose
That the browser suite runs against this checkout's build and no other. It chooses the port of the suite's own server (free unless `LIVE_DOCS_E2E_PORT` names one, and a named port that already answers refused unless `LIVE_DOCS_E2E_REUSE=1`), and, as the suite's first global setup, refuses stale bundles and proves that the server answering serves this checkout's `dist/explorer`.

### Notes
- Written on 2026-11-19, when builders were running the suite side by side ([Turns 36 and 37 of the November 18 session](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-36)). The configuration then took its port from `LIVE_DOCS_E2E_PORT` (8766 by default) and reused whatever answered there; a builder given a port another builder's server still held would have tested the other's build without a word, and it was caught by luck.
- **The port.** Playwright reads a configuration again in each worker it starts, so a port chosen at random in each would differ. The main process decides once and puts the port in `LIVE_DOCS_E2E_DECIDED_PORT`, which the processes it starts inherit and read first. A free port is asked of the system (a listen on port 0) from a short-lived Node process, since a configuration is read synchronously; if another process takes it before the server does, Playwright's own check refuses the run rather than reuse. A named port is probed the same way, and refused with a sentence that says what to do.
- **The proof.** Reuse alone could still hand a run another checkout's server, so the setup writes a file of a fresh name and content into `dist/explorer`, fetches it through the server, and removes it. Only a server serving that very folder can answer with it. It runs whether or not the server is the suite's own, at the cost of one request. Shown on 2026-11-19 with `LIVE_DOCS_E2E_REUSE=1` against an `http-server` serving the main tree's `dist/explorer` on the worktree's port: refused, "asked for a file just written there, it gave status 404".
- **Stale bundles.** The check and the list of bundles are [`scripts/e2e-bundles.mjs`](../../scripts/e2e-bundles.mjs.mdmd.md)'s, run as a child process.
- No side channel was added to the product for this: the proof uses only the static server and the folder it serves.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PORT_VARIABLE` {#symbol-port_variable}
- Type: const
- Source: [source](../../../../tests/e2e/served-build.ts#L16)

##### `PORT_VARIABLE` — Summary
Names a port for the suite's server; unset, the suite finds a free one.

#### `REUSE_VARIABLE` {#symbol-reuse_variable}
- Type: const
- Source: [source](../../../../tests/e2e/served-build.ts#L18)

##### `REUSE_VARIABLE` — Summary
"1" lets the suite use a server already answering on the named port, once it has proved that server serves this build.

#### `PortProbes` {#symbol-portprobes}
- Type: interface
- Source: [source](../../../../tests/e2e/served-build.ts#L23)

##### `PortProbes` — Summary
What the machine says of ports.

#### `ServerPort` {#symbol-serverport}
- Type: interface
- Source: [source](../../../../tests/e2e/served-build.ts#L31)

##### `ServerPort` — Summary
The port the suite's server takes, and whether a server already there may be used.

#### `decidePort` {#symbol-decideport}
- Type: function
- Source: [source](../../../../tests/e2e/served-build.ts#L40)
- Returns: [`ServerPort`](#symbol-serverport)
- Parameters: `env`: `NodeJS.ProcessEnv`; `probes`: [`PortProbes`](#symbol-portprobes)

##### `decidePort` — Summary
The port for this run, or a plain refusal. A run's own processes take the port its main process chose; a named port
that already answers is refused unless reuse is asked for; with no port named, a free one.

#### `machinePorts` {#symbol-machineports}
- Type: const
- Source: [source](../../../../tests/e2e/served-build.ts#L64)
- Returns: [`PortProbes`](#symbol-portprobes)

##### `machinePorts` — Summary
The machine's answers, each from a short-lived Node process, since a configuration is read synchronously.

#### `serverPortForThisRun` {#symbol-serverportforthisrun}
- Type: function
- Source: [source](../../../../tests/e2e/served-build.ts#L84)
- Returns: [`ServerPort`](#symbol-serverport)
- Parameters: `env`: `NodeJS.ProcessEnv`

##### `serverPortForThisRun` — Summary
Decides this run's port once, in Playwright's main process, and hands it to the processes it starts.

#### `proveServedFolder` {#symbol-proveservedfolder}
- Type: function
- Source: [source](../../../../tests/e2e/served-build.ts#L95)

##### `proveServedFolder` — Summary
Proves that the server at `baseURL` serves `site` itself: a file of a fresh name and content is written into the
folder, fetched through the server, and removed. A server serving any other folder, another checkout's above all,
cannot answer with it.

#### `checkServedBuild` {#symbol-checkservedbuild}
- Type: function (default)
- Source: [source](../../../../tests/e2e/served-build.ts#L131)
- Parameters: `config`: `FullConfig`

##### `checkServedBuild` — Summary
The suite's first global setup: the bundles were built together and are current, and the server serves them.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `FullConfig` (type-only)
- `node:child_process` - `spawnSync`
- `node:crypto` - `randomBytes`
- `node:fs` - `fs`
- `node:path` - `path`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-2/internal-tooling.mdmd.md`](../../../layer-2/internal-tooling.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
