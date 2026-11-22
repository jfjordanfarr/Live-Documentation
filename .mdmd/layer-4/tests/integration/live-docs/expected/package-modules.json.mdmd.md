# `tests/integration/live-docs/expected/package-modules.json`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `tests/integration/live-docs/expected/package-modules.json`
- Generated At: 2026-11-22T04:01:46.823Z

## Authored
### Purpose
The register of `package-modules.oracle.test.ts`. It holds how many of the packages installed under this repository's `node_modules` the reader of `package.json` and Node's own resolver agree on, and how many disagree by each named cause, with the reason for each cause. A count that moves fails the test.

### Notes
- Written on 2026-11-22. Measured with Node 26.13.1 over 281 packages: 273 agree, 6 are nested copies for which Node's ESM resolver answered about the top-level copy, and 2 share their names with Node's own modules. Installing or removing packages moves the counts, and the register is then read again and brought level, not loosened.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `about` {#symbol-about}
- Type: key

#### `causes` {#symbol-causes}
- Type: key

#### `causes:a name of one of Node's own modules: Node loads its own` {#symbol-causesa-name-of-one-of-nodes-own-modules-node-loads-its-own}
- Type: key

#### `causes:a nested copy: Node's ESM resolver answers with the top-level copy's file` {#symbol-causesa-nested-copy-nodes-esm-resolver-answers-with-the-top-level-copys-file}
- Type: key

#### `counts` {#symbol-counts}
- Type: key

#### `counts:agree` {#symbol-countsagree}
- Type: key

#### `counts:a nested copy: Node's ESM resolver answers with the top-level copy's file` {#symbol-countsa-nested-copy-nodes-esm-resolver-answers-with-the-top-level-copys-file}
- Type: key

#### `counts:a name of one of Node's own modules: Node loads its own` {#symbol-countsa-name-of-one-of-nodes-own-modules-node-loads-its-own}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
