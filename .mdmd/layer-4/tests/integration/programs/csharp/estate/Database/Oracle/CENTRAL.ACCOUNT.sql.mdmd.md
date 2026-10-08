# tests/integration/programs/csharp/estate/Database/Oracle/CENTRAL.ACCOUNT.sql

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/programs/csharp/estate/Database/Oracle/CENTRAL.ACCOUNT.sql
- Generated At: 2026-10-02T20:20:04.810Z

## Authored
### Purpose
The account of record, a table in the Oracle database at the centre of the estate: an account number and a balance. Nothing in the estate writes it; the SQL Server procedure reads it through the `ORACLE_CENTRAL` linked server.

### Notes
- Part of the estate, the owner's payment chain in miniature, written on 2026-09-27 so that the oracle and the adapters are measured on their world ([the estate's README](../../../../../../../../../tests/integration/programs/csharp/estate/README.md)). The last file of the chain, "the (yuck) Oracle database at the center of everything" in the owner's words of 2026-09-27 07:32 UTC ([the September 26 record](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/09/2026-09-26.1.md)). The SQL adapter publishes the table as a `table` symbol, and the posting procedure's four-part name reaches it as an edge observed from a contract, the hand-verified remote hop between the two databases. On the estate's board the `oracle` thing declares this table as a door it serves, and the join finds the same door published here, so the door carries this file.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CENTRAL.ACCOUNT` {#symbol-centralaccount}
- Type: table
- Source: [source](../../../../../../../../../tests/integration/programs/csharp/estate/Database/Oracle/CENTRAL.ACCOUNT.sql#L2)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
