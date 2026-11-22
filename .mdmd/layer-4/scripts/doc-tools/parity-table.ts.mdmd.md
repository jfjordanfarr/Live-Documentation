# `scripts/doc-tools/parity-table.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/doc-tools/parity-table.ts`
- Generated At: 2026-11-22T02:04:37.438Z

## Authored
### Purpose
Prints the table of [the parity document](../../../layer-2/parity.mdmd.md) from the parity ledger, so that the table a person reads is the one a test holds to the commands.

### Notes
- Made 2026-11-22 at the root's ruling that the table be held by a ledger and a test ([the parity probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-22/Probes/parity/README.md)). `--write` rewrites the table between the document's two comment lines; `parity.test.ts` fails when they differ.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ParityRow` {#symbol-parityrow}
- Type: interface
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L14)

##### `ParityRow` — Summary
One row of the ledger: a thing the page offers, what offers it to an agent or a pipeline, and how it is checked.

#### `ParityLedger` {#symbol-parityledger}
- Type: interface
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L29)

#### `BEGIN` {#symbol-begin}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L33)

#### `END` {#symbol-end}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L34)

#### `renderParityTable` {#symbol-renderparitytable}
- Type: function
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L37)
- Parameters: `ledger`: [`ParityLedger`](#symbol-parityledger)

##### `renderParityTable` — Summary
The table and its totals, as markdown, the rows in the ledger's order under their sections.

#### `withTable` {#symbol-withtable}
- Type: function
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L56)

##### `withTable` — Summary
The document's text with its table replaced by the one the ledger prints.

#### `LEDGER_PATH` {#symbol-ledger_path}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L65)

#### `DOCUMENT_PATH` {#symbol-document_path}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L66)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
