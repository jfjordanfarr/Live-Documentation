# `tests/integration/programs/csharp/estate/expected/hand-verified-misses.json`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `tests/integration/programs/csharp/estate/expected/hand-verified-misses.json`
- Generated At: 2026-11-21T05:11:48.820Z

## Authored
### Purpose
The ledger of the estate's hand-verified edges that the readers do not draw, each with its cause read from the code: a designer file's fields, which name no page; the hub's endpoint name, built at run time; and a row type whose only tie to its procedure is its result columns. `tests/integration/live-docs/oracle.test.ts` fails on a missed edge the ledger does not list and on a listed one that is drawn again, so the ledger can only shrink truthfully.

### Notes
- Written on 2026-11-21 ([the account](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-gathering/sql-findings.md)), when the root found by hand that the comparison reported these three misses and nothing failed on them. They are the three the edges' own doc and [Openings](../../../../../../../layer-3/openings.mdmd.md) name as no scan of the files honestly gives. A reader that comes to draw one removes its entry in the same commit.
- The paths are relative to this file's folder, as in `hand-verified-edges.json`; `readHandVerifiedMisses` in `scripts/oracle/compare.ts` resolves them against the program.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `convention` {#symbol-convention}
- Type: key

#### `misses` {#symbol-misses}
- Type: key
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`dbo.usp_PostPayment`](../Database/SqlServer/dbo.usp_PostPayment.sql.mdmd.md)
- [`App`](../Hub/App.config.mdmd.md)
- [`PaymentHub`](../Hub/PaymentHub.cs.mdmd.md)
- [`PostPaymentRow`](../PaymentService/Data/PostPaymentRow.cs.mdmd.md)
- [`Default`](../Portal/Pages/Default.aspx.mdmd.md)
- [`Default.aspx.designer`](../Portal/Pages/Default.aspx.designer.cs.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
