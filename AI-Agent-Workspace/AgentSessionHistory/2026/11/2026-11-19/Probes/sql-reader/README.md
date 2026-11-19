# The SQL reader, graded by Microsoft's T-SQL parser

Current as of November 19, 2026. A builder wrote this for the root while mending the SQL reader after [the cold run](../cold-run/README.md). It is filled in as each commit lands; the figures below are those of the commit that last changed it.

## The oracle

`npm run oracle:sql -- <folder>` sets the SQL adapter's reading of every `.sql` file of a folder beside what ScriptDom (`Microsoft.SqlServer.TransactSql.ScriptDom` 170.191.0, the parser SQL Server's own tools use) says about the same files. The parser is driven by `scripts/oracle/sql-scriptdom.cs`, a .NET file-based program; the comparison is `scripts/oracle/sql-compare.ts`, whose header states what it grades and what it sets aside. A fixture keeps the parser's record as `expected/sql-scriptdom.json`, and `tests/integration/live-docs/sql-oracle.test.ts` holds the adapter to it against a register of measured misses, without .NET.

## Before

tSQLt at `4a921d0d`, 281 `.sql` files, 268 of which the parser reads (13 are SQLCMD scripts, templates or experiments it refuses).

| Measure | Before |
| --- | ---: |
| Objects the scripts create (procedures, functions, views, tables, a trigger, types) | 1,506 |
| found by the reader | 1,154 |
| missing | 352 |
| invented | 624 (348 of them tables a test procedure creates in its body) |
| found at the CREATE's line | 618 of 1,154 |
| Dependency lines the docs should carry | 943 |
| right | 855 |
| missing | 88 |
| invented | 279 |

## The crash

A name quoted in brackets or double quotes is passed over whole where comments and strings are blanked. After it, on tSQLt: 1,497 of 1,506 objects found (the nine missing are a trigger and eight types, kinds the reader has none for), 830 at the right line, 376 invented (374 tables made in a procedure's body); 897 of 943 dependency lines right, 46 missing, 268 invented. Generation over the whole of tSQLt, nothing excluded, writes all 465 docs and the index.
