# tests/e2e/served-build.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/served-build.ts
- Generated At: 2026-11-19T07:03:56.634Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

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
