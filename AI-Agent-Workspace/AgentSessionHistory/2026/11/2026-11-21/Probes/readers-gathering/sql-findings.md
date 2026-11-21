# SQL names across schemas and databases, and the readers' oracles as a test

Historical evidence, written on November 21, 2026 by a builder for the root, on a branch from `cdbf98aa9` of the readers' gathering. It records how the SQL reader and its grader came to bind a name as T-SQL binds it, and what a test that fails on a reader's regression against the sample programs' oracles would hold. The account of the gathering it is set beside is [the join's](README.md); the SQL reader's own record is [its probe](../../../2026-11-19/Probes/sql-reader/README.md). No subagent was used; Microsoft's pages were fetched anonymously, nothing of this project in any request.

## In short

- **The grader could not fail on the reader's rule for a one-part name, and now can.** It had adopted the product's matching, an object of the name in any schema. It now binds by the order Microsoft documents, quoted below, and on the new fixture `tests/integration/fixtures/sql-schemas` it failed the reader on nine lines drawn and one kept name missing.
- **Two mends, each its own commit, made the fixture agree.** A one-part name binds to its module's schema, then `dbo`, else nothing; `database..name` reads as `database.dbo.name`, never as a linked server's.
- **Neither mend moved a figure on tSQLt, DNN's SQL or DNN's provider scripts.** The adapter's lines on all three are byte for byte the same before and after, and the new grader gives the recorded figures: 969 of 969, 29 of 29, 6,961 of 6,962. Their only `database..name` names are of `tempdb`, `master` and `msdb`, kept as written before and after.
- **The documentation corrects the ruling in one place.** A one-part name inside a module that neither its schema nor `dbo` holds binds to nothing, whether one other schema holds it or several. The caller's default schema is not searched there.

## What the documentation says, and which source gives what

The figures before any change were reproduced first, with `npm run oracle:sql` on the three folders: tSQLt 281 files read, 268 graded, 13 refused, 1,525 of 1,535 objects, 969 of 969 dependency lines; DNN's `.sql` 12, 12, 0, 51 of 51, 29 of 29; the 299 provider copies made by [`provider_copies.py`](provider_copies.py), 4,052 of 4,056 and 6,961 of 6,962 with one missing. Each equals [the join's table](README.md#sql-t-sql-against-scriptdom).

The sentences, each now quoted in the head of `scripts/oracle/sql-compare.ts`:

| Case | The sentence | Its page |
| --- | --- | --- |
| A one-part name in a batch | "When database objects are referenced by using a one-part name, SQL Server first looks in the user's default schema. If the object is not found there, SQL Server looks next in the dbo schema. If the object is not in the dbo schema, an error is returned." | Microsoft Learn, "Ownership and user-schema separation in SQL Server", the dbo schema |
| A one-part procedure name in a procedure's body | "If the nonqualified procedure name appears inside the body of another procedure definition, the schema that contains this other procedure is searched next." (after `sys`, before `dbo`) | Microsoft Learn, "Execute a stored procedure", user-defined stored procedures |
| Any object a module names | "Active default schema is schema of the SQL module if entity referenced by a statement (except DDL, dynamic SQL, a.k.a. EXECUTE statements, or intrinsic such as object_id()) inside a procedure, function or view. Otherwise, active default schema is current user's default schema." | Microsoft's SQL Server programmability team, "Name resolution, default schema, implicit schema Part I", 2006, archived on Microsoft Learn |
| Which statements are DDL | "Data Definition Language (DDL) statements defines data structures": ALTER, CREATE, DROP, … TRUNCATE TABLE | Microsoft Learn, "Transact-SQL statements" |
| `database..name` | "Server and schema name are omitted." | Microsoft Learn, "Transact-SQL syntax conventions", multipart names |
| Its omitted schema | "For object references outside SQL modules, or DDL, dynamic SQL inside SQL modules, current user's default schema in the specified database is used. Otherwise, the module schema owner's default schema in the specified database is used." | "Part III" of the same series |
| The same, by example | "SQL Server first looks for DBZ.UserB.TableY. If there is no table with this name, SQL Server then looks for a table DBZ.dbo.TableY." | SQL Server 2008 Books Online, "Object Visibility and Qualification Rules" |
| The default itself | "By default, users created with the CREATE USER Transact-SQL command have dbo as their default schema." | the ownership page again |
| A trigger's schema | "DML triggers are scoped to the schema of the table or view on which they're created." | Microsoft Learn, "CREATE TRIGGER", `schema_name` |

**ScriptDom gives the parse**: a name's parts, which of them is written (`SisterDb..Orders` is database `SisterDb`, schema not written, object `Orders`), and, now recorded by `sql-scriptdom.cs`, the procedure, function, view or trigger whose definition holds each reference, with a trigger's table. It binds nothing. **The documentation gives the binding**: which schema is searched first and what follows. **Neither gives the caller's default schema**, which lives in the database's users. The grader and the reader both take `dbo`, the documented default for a user created without one; that is the one presumption, stated in both places.

So, for a loose script, the documentation gives the caller's default schema, then `dbo`; the reader can honestly do one thing with that, take `dbo` alone, since any other schema would be a guess at a fact of the server. A one-part name outside a module that only `archive` holds is kept as a name, not drawn to `archive`.

Two points the documentation decided against the ruling as briefed:

- **"To nothing where neither holds it and more than one other schema does."** Inside a module the caller's default schema is not searched at all (the procedure page's second step replaces it), so a module's one-part name that neither its schema nor `dbo` holds binds to nothing even when exactly one other schema holds it. `notes.sql` holds that case: `dbo.ListNotes` reading `Notes`, which only `archive` holds, is kept as `Notes`.
- **`database..name` inside a module** takes a user's default schema in that database, never the module's schema, so `archive.p` reading `SisterDb..Orders` is `SisterDb.dbo.Orders`, not `SisterDb.archive.Orders`.

The three-part form's class was left as it was: `SisterDb.dbo.Orders` links from source to the folder's `dbo.Orders`, the database part playing no part, and `SisterDb..Orders` now does the same. Whether a three-part name naming another database should link at all is the same question as the linked server's, and not this piece's.

## The commits

| Commit | What | The fixture's register test | The adapter's tests |
| --- | --- | --- | --- |
| `Grade SQL names as T-SQL binds them, with a fixture the reader fails` | the grader's binding, the emitter's modules, the fixture and its record, the two adapter tests | red: 9 lines invented, 1 kept name missing | red, both |
| `Bind a one-part SQL name to its module's schema, then dbo, as T-SQL does` | `moduleSchema` on each reference, `bindSqlName`, the adapter binding before it links | red: the 2 lines of `SisterDb..Orders`, drawn as a linked server's | the second green |
| `Read SQL's database..name as database.dbo.name, never a linked server's` | `sqlObjectName` | green: the register's one entry, a trigger, a kind with no symbol | both green |

The nine lines the first commit's grader found, all now gone: `procs.sql`, `archive.ListOrders.sql`, `archive.PurgeOrders.sql`, `archive.CountOrders.sql`, `archive.OrdersKept.sql`, `notes.sql` and `report.sql` each drew its one-part `Orders` or `Notes` to the other schema's table as well, and `procs.sql` drew `SisterDb..Orders` as contract links to both tables.

The emitter had one fault of its own: ScriptDom holds a part left out between two dots as an empty identifier, which the record wrote as `"schema": ""`; it is now written as not written, as the record already did for a called function's name. The estate's and the SQL Server fixture's kept records were rewritten for the new field; both still agree whole.

### Lines each mend changes on the corpora

| Corpus | Before | After the first mend | After the second |
| --- | --- | --- | --- |
| tSQLt: the adapter's dependency lines | 969 | 969, none changed | 969, none changed |
| DNN `.sql` | 29 | 29, none changed | 29, none changed |
| DNN provider scripts | 6,964 | 6,964, none changed | 6,964, none changed |

Measured by dumping every line the adapter writes, file by file, and comparing the dumps. The new grader on the same commits gives 969 of 969, 29 of 29 and 6,961 of 6,962 throughout: neither mend moved a committed score, so no expectation was touched.

Two more corpora were graded after both mends, since the reader is shared. dbatools' `.sql` (`bin/`) gives 26 of 26 objects and 199 of 199 dependency lines, its record's. utPLSQL at `01a89eae`, fetched for this into scratch and graded whole by `npm run oracle:plsql` (its two graded folders could not be copied apart, below), gives 512 files read, 365 graded, 147 refused, and 658 dependency lines expected, 337 right, 321 missing, 370 invented: the whole checkout's figures in [the join's table](README.md#plsql-against-the-antlr-projects-grammar), unchanged.

### Forks decided

- **Where the binding lives.** `bindSqlName` is in `openings.ts`, beside `matchSqlObject`, and only the SQL adapter calls it. The C# adapter reads SQL held in strings through the same reader and matches as before, a one-part name to every schema; it is a sibling's file, and adopting the binding there is one call. `sqlObjectName`'s change to `database..name` does reach the C# adapter and the estate join, since they share it.
- **DDL.** `TRUNCATE TABLE`, `ALTER TABLE`, a foreign key and a module's `ALTER` bind by the caller's default schema, by the archived team blog's "except DDL" and the statements page's list.
- **Triggers.** A trigger is bound like a module, its schema its table's when its name writes none: "DML triggers are scoped to the schema of the table or view on which they're created" (Microsoft Learn, "CREATE TRIGGER", `schema_name`). The blog names procedures, functions and views; a DML trigger is a module of its table's schema, and the page calls a trigger "a special type of stored procedure".
- **An object created without a schema** is in its creator's default schema, taken as `dbo`, and is bound by a one-part use at the `dbo` step; a use that writes `dbo.X` still does not bind to a created `X`, as before on both sides. On the provider scripts 265 objects are created without a schema; how many two-part uses would then link to them was not counted.
- **The grader's link line marks a linked server**, `(linked)`, against the adapter's contract basis, so that the class of an edge, not only its ends, can fail.

## Part two: the readers against their oracles on the sample programs

`tests/integration/live-docs/oracle.test.ts` asserted the bookkeeping only. Counted with `compareFixture` on every sample program that keeps `expected/compiler-edges.json`, at the third commit above:

| Program | Compiler edges found / missing / extra | Hand-verified found / missing | Project references found / missing |
| --- | --- | --- | --- |
| c/basics | 2 / 2 / 0 | | |
| c/modular | 8 / 7 / 0 | | |
| c/rosetta | 15 / 15 / 0 | | |
| cpp/rosetta | 15 / 15 / 0 | | |
| csharp/basic | 13 / 0 / 0 | | |
| csharp/estate | 37 / 0 / 1 | 17 / 3 | 3 / 0 |
| csharp/rosetta | 24 / 0 / 0 | | |
| csharp/webforms | 2 / 0 / 0 | | |
| go/depot | 30 / 7 / 0 | | |
| go/rosetta | 12 / 1 / 0 | | |
| java/basic | 6 / 0 / 0 | | |
| java/rosetta | 24 / 0 / 0 | | |
| java/service | 13 / 0 / 0 | | |
| java/warehouse | 33 / 0 / 0 | | |
| powershell/rollout | 9 / 0 / 0 | | |
| python/basics | 2 / 0 / 0 | | |
| python/ledger | 24 / 1 / 1 | | |
| python/pipeline | 7 / 0 / 0 | | |
| python/rosetta | 12 / 0 / 0 | | |
| rust/analytics | 11 / 0 / 0 | | |
| rust/basics | 4 / 0 / 0 | | |
| rust/rosetta | 22 / 0 / 0 | | |
| rust/stockroom | 34 / 2 / 2 | | 0 / 2 |
| typescript/basic | 4 / 0 / 0 | | |
| typescript/layered | 8 / 0 / 0 | | |
| typescript/rosetta | 12 / 0 / 0 | | |

In all: 50 compiler edges missing, 4 extra, 3 hand-verified edges missing, 2 project references missing. Thirty-nine of the fifty are C and C++, and nearly all of them one shape: the compiler records a call's edge to the `.c` file that defines the function and a header's to its implementation, where the reader draws the `#include` to the header. Eight are Go files using their own package's names without an import.

### The three hand-verified edges still missing, and why

The same three the root found on the day branch; this branch finds none of them either.

- **`Hub/PaymentHub.cs → Hub/App.config`.** The endpoint's name is built at run time, `ServiceRouting.EndpointNameFor(workload, environment)`, which joins the constant `EndpointPrefix` (`"PaymentService"`) to two parameters. The C# reader folds only constant strings, so the name `ChannelFactory<IPaymentService>` is given is unknown to it, and the doc links `ServiceRouting` but no endpoint. Matching `App.config`'s `PaymentService.Consumer.*` endpoints by their constant prefix would be a guess the reader does not make.
- **`Portal/Pages/Default.aspx.designer.cs → Portal/Pages/Default.aspx`.** The designer file declares one field per server control and names nothing else. The page publishes those controls' IDs as symbols (`serverForm`, `PaymentsEnabledHidden`, `GatewayBaseUrlHidden`), but the C# reader reads a field's declaration as the file's own symbol, never as a use of the control of the same ID, and a designer file holds no directive or name of its page to link by. Its doc has no dependency.
- **`PaymentService/Data/PostPaymentRow.cs → Database/SqlServer/dbo.usp_PostPayment.sql`.** The class's only ties to the procedure are a doc comment, which no reader reads, and its three property names, which are the procedure's result columns. The SQL reader publishes no result column, and the call that binds the class to the procedure's result, `Database.SqlQuery<PostPaymentRow>(…)` with `dbo.usp_PostPayment`, is in `PaymentsContext.cs`, whose edge to the script is drawn. Its doc has no dependency.

### What was built

`tests/integration/programs/csharp/estate/expected/hand-verified-misses.json` lists the three with those causes. `compare.ts` reads it (`readHandVerifiedMisses`), holds the missed edges to it (`heldToLedger`: those it does not list, and its entries no longer missed) and prints each missed edge's cause. `oracle.test.ts` fails on either, for every program with hand-verified edges, and on a ledger kept by a program with none. A case of its own holds the function to failing both ways, and on the estate it was seen to fail: with the ledger's designer entry swapped for an edge the readers draw, the test named the designer edge as unlisted and the swapped one as gone.

### Proposed, not built: the compiler's edges

Fifty-four entries written one by one would be a ledger nobody reads, so here is a plainer form that still fails on a regression: **a ledger by cause.** Each entry is a cause in a sentence, with the list of edges it explains; the test fails on a missing or extra edge that no cause lists, and on a listed edge now found. Exactness is the same as an edge-by-edge ledger, a regression in any program still fails, and the causes are written once. Read from the symbols the compiler records, the 54 fall into some seven causes, which still need confirming by reading each reader:

| Programs | Edges | Apparent cause |
| --- | ---: | --- |
| C and C++ | about 30 | the compiler ties a declaration and each call to the file that defines the function; the readers draw the `#include` to the header, and nothing includes a `.c` |
| C and C++ | about 9 | uses through a header included by another header: the compiler sees the type's file, the readers draw direct includes only |
| go/depot, go/rosetta | 7 | files of one package use each other's names without an import, and no edge is drawn inside a package |
| go/depot | 1 | a method promoted from an embedded type, in another file of its package |
| python/ledger | 1 missing, 1 extra | a method on an instance typed in another module; an import of a package the compiler resolves to a submodule |
| rust/stockroom | 2 missing, 2 extra | a method on a type of another module; `crate/` and the crate root a binary and a test use by the crate's name |
| csharp/estate | 1 extra | `GatewayClient.cs → Gateway/Controllers/PaymentsController.cs`, a hand-verified remote HTTP edge the compiler cannot see; no error |

A simpler form was considered and refused: committing each program's three counts. A count can stand still while one edge is lost and another gained, so it would not fail on a regression it is meant to catch.

### A fault in the comparison's own bookkeeping

`rust/stockroom`'s two missing project references are not real references: `compare.ts` builds every compiler project's file as `<directory>/<name>.csproj`, and rust-analyzer's Cargo targets come out as `src/stockroom src/main.rs.csproj → src/stockroom.csproj`. The project bucket is .NET's alone and should be read only for .NET projects, or name the manifest the compiler read. Not mended here: the projects' shape is written by `scip-edges.ts`, which is not this piece's.

## Verification

`npm run safe:commit`, without the browser, at the part-two commits: Live Docs generated and validated (1,227 files), lint and build, unit tests 3,000 in 222 files, integration tests 480 in 36 files, the documentation link enforcement and the three SlopCop audits, all passing.

The harness refused three shell commands of this builder's, none of them reached another way: a heredoc writing a scratch script (written with the file tool instead), a generation run chained with `git status` (run apart), and a copy of utPLSQL's `source/` folder, whose name the harness read as the shell's `source` command; utPLSQL was graded whole instead of by its two folders.

## Open

- **The C# adapter's SQL strings** still match a one-part name to every schema; `bindSqlName` is one call away for its owner.
- **A three-part name to another database** links to the folder's object of the same schema and name, from source, as before. Whether it should is the linked server's question asked of a sister database.
- **`dbo.X` against an object created as `X`**, without a schema: no line on either side, as before; not counted.
- **The compiler's edges**: the ledger by cause above, for the root to rule on.
