# `scripts/oracle/sql-compare.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `scripts/oracle/sql-compare.test.ts`
- Generated At: 2026-11-21T02:15:32.608Z

## Authored
### Purpose
Unit tests of the SQL comparison's own machinery: a parser's name written as the product writes one and read back, what is taken as SQL Server's own, and a seeded draw that repeats for its seed.

### Notes
- Written on 2026-11-19 with the comparison ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). The comparison of whole fixtures is `tests/integration/live-docs/sql-oracle.test.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sql-compare.drawSample`](./sql-compare.ts.mdmd.md#symbol-drawsample)
- [`sql-compare.isSqlServerOwn`](./sql-compare.ts.mdmd.md#symbol-issqlserverown)
- [`sql-compare.partsOfWritten`](./sql-compare.ts.mdmd.md#symbol-partsofwritten)
- [`sql-compare.writtenName`](./sql-compare.ts.mdmd.md#symbol-writtenname)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
