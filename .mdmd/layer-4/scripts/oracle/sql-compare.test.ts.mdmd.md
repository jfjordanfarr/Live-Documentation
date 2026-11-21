# `scripts/oracle/sql-compare.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/oracle/sql-compare.test.ts`
- Generated At: 2026-11-21T04:55:42.476Z

## Authored
### Purpose
Unit tests of the SQL comparison's own machinery: a parser's name written as the product writes one and read back, what is taken as SQL Server's own, and a seeded draw that repeats for its seed.

### Notes
- Written on 2026-11-19 with the comparison ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The comparison of whole fixtures is `tests/integration/live-docs/sql-oracle.test.ts`.
- Since 2026-11-21 it holds the comparison's binding of a name to Microsoft's documented order, case by case: a batch's one-part name, a module's, a trigger's by its table, a module's DDL, `database..name`, a written schema, a linked server's name without one, and what binds when neither searched schema holds the name ([the account](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sql-compare.bindName`](./sql-compare.ts.mdmd.md#symbol-bindname)
- [`sql-compare.drawSample`](./sql-compare.ts.mdmd.md#symbol-drawsample)
- [`sql-compare.isSqlServerOwn`](./sql-compare.ts.mdmd.md#symbol-issqlserverown)
- [`sql-compare.partsOfWritten`](./sql-compare.ts.mdmd.md#symbol-partsofwritten)
- [`sql-compare.searchedSchemas`](./sql-compare.ts.mdmd.md#symbol-searchedschemas)
- [`sql-compare.writtenName`](./sql-compare.ts.mdmd.md#symbol-writtenname)
- [`sql-scriptdom.ScriptDomModule`](./sql-scriptdom.ts.mdmd.md#symbol-scriptdommodule) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
