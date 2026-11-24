# `scripts/oracle/plsql-compare.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/oracle/plsql-compare.ts`
- Entry: command `oracle:plsql` of [`package.json`](../../package.json.mdmd.md)
- Generated At: 2026-11-24T10:31:41.314Z

## Authored
### Purpose
Grades the SQL reader on PL/SQL against a parser that is not ours: `npm run oracle:plsql -- <folder>` fetches the ANTLR 4.13.2 tool jar and the ANTLR project's PL/SQL grammar at a pinned grammars-v4 commit into `~/.cache/live-documentation/oracle-plsql`, checking each against the SHA-256 sum written in the file, generates and compiles the parser around [`PlSqlEmitter.java`](./PlSqlEmitter.java.mdmd.md) in a scratch folder, and sets the adapter's reading of the folder's PL/SQL beside the parser's: objects by kind, lines, dependency lines right, missing and invented, what is counted and not graded, and how many names kept today a kind the reader has no symbol for would turn into links. Without `java` and `javac` it says so in one line and exits; it installs nothing.

### Notes
- Written on 2026-11-19, the SQL reader's third and fourth legs ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)), so that the PL/SQL grading can be run again. Its header says what it cannot judge: the grammar resolves no names, so calls are graded only by two or more parts and resolved by a presumption written in the file; it refuses some of Oracle's syntax (98 of utPLSQL's 366 files, every `create noneditionable synonym` among them); and SQL*Plus lines are blanked for both readers alike, since the grammar does not read them.
- Every PL/SQL file is copied with `.sql` added to its name, since the reader reads `.sql`; whether the reader should read other suffixes is the owner's question, not this oracle's.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GRAMMAR_COMMIT` {#symbol-grammar_commit}
- Type: const
- Source: [source](../../../../scripts/oracle/plsql-compare.ts#L60)

##### `GRAMMAR_COMMIT` — Summary
The grammars-v4 commit the grammar is read at: the last change to `sql/plsql` as of 2026-11-19.

#### `SQLPLUS_LINE` {#symbol-sqlplus_line}
- Type: const
- Source: [source](../../../../scripts/oracle/plsql-compare.ts#L73)

##### `SQLPLUS_LINE` — Summary
A SQL*Plus line: a command SQL*Plus runs itself, never sent to the database as SQL.

#### `withoutSqlPlus` {#symbol-withoutsqlplus}
- Type: function
- Source: [source](../../../../scripts/oracle/plsql-compare.ts#L76)

##### `withoutSqlPlus` — Summary
A text with every SQL*Plus line blanked, each line kept, so that lines still count.

#### `gradePlSql` {#symbol-gradeplsql}
- Type: function
- Source: [source](../../../../scripts/oracle/plsql-compare.ts#L137)

##### `gradePlSql` — Summary
Grades the adapter's reading of the prepared files against the parser's record.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawnSync`
- `node:crypto` - `createHash`
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- `node:process` - `process`
- [`sql.sqlAdapter`](../../packages/engine/src/live-docs/adapters/sql.ts.mdmd.md#symbol-sqladapter)
- [`coreTypes.WorkspaceSymbolIndex`](../../packages/engine/src/live-docs/coreTypes.ts.mdmd.md#symbol-workspacesymbolindex) (type-only)
- [`nodeHost.registerNodeDiskFallback`](../../packages/engine/src/tooling/nodeHost.ts.mdmd.md#symbol-registernodediskfallback)
<!-- LIVE-DOC:END Dependencies -->
