# sql-sqlite

The SQL reader's fixture for SQLite's spellings of what a script creates, which T-SQL, the dialect the reader was written to, does not write: `CREATE … IF NOT EXISTS`, `DROP … IF EXISTS`, `TEMP` and `TEMPORARY` objects, names quoted in backticks, double quotes and brackets, a virtual table, a table made from a query, and a trigger written with its timing before its table, whose body ends at its `END`. `expected/sqlite-schema.json` is what SQLite itself held after running each script alone in an empty database in memory (`scripts/oracle/sql-sqlite.ts`, through `node:sqlite`); the test `sqlite-oracle.test.ts` holds the reader to it without running a database. Made on 2026-11-21 ([the record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).

| File | What it holds |
| --- | --- |
| `migrations/001_init.sql` | this repository's own SQLite migration, `data/migrations/001_init.sql` as committed on 2025-10-16 (`6bccf94be`) and removed in January 2026, which the reader once read as six tables named `IF` |
| `dialect.sql` | the rest of the family, one statement of each, and a table after the trigger |

Index it: `npm run oracle:sqlite -- tests/integration/fixtures/sql-sqlite --write`.
