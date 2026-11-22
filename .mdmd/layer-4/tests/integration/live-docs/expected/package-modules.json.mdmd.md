# `tests/integration/live-docs/expected/package-modules.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/expected/package-modules.json`
- Generated At: 2026-11-22T05:07:15.955Z

## Authored
### Purpose
The register of `package-modules.oracle.test.ts`. It holds how many of the packages installed under this repository's `node_modules` the reader of `package.json` and Node's own resolver agree on, and how many disagree by each named cause, with the reason for each cause. A count that moves fails the test.

### Notes
- Written on 2026-11-22. Measured with Node 26.13.1 over 281 packages: 279 agree, and 2 share their names with Node's own modules. Installing or removing packages moves the counts, and the register is then read again and brought level, not loosened.
- First written with six nested copies registered as answered with the top-level copy's file. That was the oracle's question, not Node. Without `--experimental-import-meta-resolve`, Node ignores the parent handed to `import.meta.resolve` and resolves from the asking script, so a nested copy was answered with the top-level copy's file. Asked with the flag, the six agree.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `about` {#symbol-about}
- Type: key

#### `causes` {#symbol-causes}
- Type: key

#### `causes:a name of one of Node's own modules: Node loads its own` {#symbol-causesa-name-of-one-of-nodes-own-modules-node-loads-its-own}
- Type: key

#### `counts` {#symbol-counts}
- Type: key

#### `counts:agree` {#symbol-countsagree}
- Type: key

#### `counts:a name of one of Node's own modules: Node loads its own` {#symbol-countsa-name-of-one-of-nodes-own-modules-node-loads-its-own}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
