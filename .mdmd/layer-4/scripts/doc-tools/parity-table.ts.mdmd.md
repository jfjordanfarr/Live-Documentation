# `scripts/doc-tools/parity-table.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/doc-tools/parity-table.ts`
- Generated At: 2026-11-22T03:27:59.872Z

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
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L31)

##### `ParityLedger` — Summary
The ledger: its rows in the table's order.

#### `BEGIN` {#symbol-begin}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L36)

##### `BEGIN` — Summary
The comment line before the printed table.

#### `END` {#symbol-end}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L38)

##### `END` — Summary
The comment line after it.

#### `renderParityTable` {#symbol-renderparitytable}
- Type: function
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L41)
- Parameters: `ledger`: [`ParityLedger`](#symbol-parityledger)

##### `renderParityTable` — Summary
The table and its totals, as markdown, the rows in the ledger's order under their sections.

#### `withTable` {#symbol-withtable}
- Type: function
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L61)

##### `withTable` — Summary
The document's text with its table replaced by the one the ledger prints.

#### `LEDGER_PATH` {#symbol-ledger_path}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L71)

##### `LEDGER_PATH` — Summary
The ledger, from the repository's root.

#### `DOCUMENT_PATH` {#symbol-document_path}
- Type: const
- Source: [source](../../../../scripts/doc-tools/parity-table.ts#L73)

##### `DOCUMENT_PATH` — Summary
The document whose table it prints, from the repository's root.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
<!-- LIVE-DOC:END Dependencies -->
