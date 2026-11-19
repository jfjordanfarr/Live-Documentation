# scripts/oracle/PlSqlEmitter.java

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/oracle/PlSqlEmitter.java
- Entry: program [`main`](#symbol-main)
- Generated At: 2026-11-19T22:17:17.230Z

## Authored
### Purpose
The PL/SQL oracle's emitter: a Java program, built by [`plsql-compare.ts`](./plsql-compare.ts.mdmd.md) beside the parser it generates from the ANTLR project's PL/SQL grammar, that prints as JSON what the grammar says about each file: its parse errors; every top-level CREATE of a package, package body, procedure, function, view, table, trigger, type, type body, synonym or sequence, with its line; the procedures and functions a package spec or body holds; and every table read or written, routine a call statement runs and function called with arguments, with the parts of each name as written.

### Notes
- Written on 2026-11-19 in scratch for the SQL reader's third leg and kept here on the fourth ([the probe](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-19/Probes/sql-reader/README.md)). It does not compile on its own: the grammar's generated `PlSqlLexer` and `PlSqlParser` and the ANTLR runtime are on its class path only inside the comparison's scratch folder. It records what is written, not what it is, since the grammar resolves no names.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PlSqlEmitter` {#symbol-plsqlemitter}
- Type: class
- Source: [source](../../../../scripts/oracle/PlSqlEmitter.java#L26)

#### `main` {#symbol-main}
- Type: method
- Source: [source](../../../../scripts/oracle/PlSqlEmitter.java#L121)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `org.antlr.v4.runtime.*`
- `org.antlr.v4.runtime.atn.PredictionMode` - `PredictionMode`
- `org.antlr.v4.runtime.misc.ParseCancellationException` - `ParseCancellationException`
- `org.antlr.v4.runtime.tree.ParseTree` - `ParseTree`
<!-- LIVE-DOC:END Dependencies -->
