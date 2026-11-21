# `scripts/oracle/sql-sqlite.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/sql-sqlite.ts`
- Entry: command `oracle:sqlite` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-21T19:30:04.330Z

## Authored
### Purpose
Grades what the SQL reader says a script creates against SQLite itself: `npm run oracle:sqlite -- <folder>` runs each `.sql` file of the folder alone in an empty database in memory, through the SQLite Node carries (`node:sqlite`), and sets the tables and views its `main` schema then holds beside the reader's declarations; `--write` keeps the answer as the folder's `expected/sqlite-schema.json`, each source named with its digest, for `sqlite-oracle.test.ts` to hold the reader to without a database.

### Notes
- Made on 2026-11-21, when this repository's own SQLite migration, `CREATE TABLE IF NOT EXISTS artifacts (`, was found read as no table at all ([the record](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-21/Probes/readers-batch/README.md)).
- A `TEMP` object, which SQLite keeps in `temp`, and the tables SQLite makes to hold a virtual table (`pragma_table_list`'s `shadow`) are no objects of the script; indexes and triggers, which the reader gives no symbol, are not graded.
- SQLite's spelling alone: no engine or parser of MySQL's or PostgreSQL's was at hand, and their scripts SQLite refuses.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SqliteFileRecord` {#symbol-sqlitefilerecord}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-sqlite.ts#L30)

##### `SqliteFileRecord` — Summary
What SQLite held after one script ran: its lasting tables and views, by name as SQLite keeps it, and why it stopped, if it did.

#### `SqliteRecord` {#symbol-sqliterecord}
- Type: interface
- Source: [source](../../../../scripts/oracle/sql-sqlite.ts#L36)

##### `SqliteRecord` — Summary
SQLite's record of a folder: the SQLite that made it, what each script left in its database, and the files it was made from with their digests.

#### `sqliteSources` {#symbol-sqlitesources}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-sqlite.ts#L43)

##### `sqliteSources` — Summary
The folder's SQL files, folder-relative, as the fixture walk lists them.

#### `runSqlite` {#symbol-runsqlite}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-sqlite.ts#L48)

##### `runSqlite` — Summary
Runs each script in a database of its own and reads back what it made.

#### `compareSqlite` {#symbol-comparesqlite}
- Type: function
- Source: [source](../../../../scripts/oracle/sql-sqlite.ts#L74)
- Parameters: `record`: [`SqliteRecord`](#symbol-sqliterecord)

##### `compareSqlite` — Summary
Every way the reader's declarations differ from what SQLite made, in words.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- `node:sqlite`
- [`openings.readSql`](../../packages/engine/src/live-docs/openings.ts.mdmd.md#symbol-readsql)
- [`openings.sqlNameParts`](../../packages/engine/src/live-docs/openings.ts.mdmd.md#symbol-sqlnameparts)
- [`fixture.listFixtureFiles`](./fixture.ts.mdmd.md#symbol-listfixturefiles)
- [`sources.sourceDigests`](./sources.ts.mdmd.md#symbol-sourcedigests)
<!-- LIVE-DOC:END Dependencies -->
