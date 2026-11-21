import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "../coreTypes";
import { sqlAdapter } from "./sql";

describe("sqlAdapter", () => {
  let workspaceRoot: string;

  beforeEach(async () => {
    workspaceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sql-adapter-"));
  });

  afterEach(async () => {
    await fs.rm(workspaceRoot, { recursive: true, force: true });
  });

  it("publishes what a script creates and links what it names to the scripts that create it, a linked server being a contract", async () => {
    const scriptPath = path.join(workspaceRoot, "Database", "SqlServer", "dbo.usp_PostPayment.sql");
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, [
      "-- Posts a payment; the balance comes from Oracle through the ORACLE_CENTRAL linked server.",
      "CREATE PROCEDURE dbo.usp_PostPayment @AccountNumber NVARCHAR(32), @Amount DECIMAL(18, 2)",
      "AS",
      "BEGIN",
      "    INSERT INTO dbo.Payment (PaymentId, AccountNumber, Amount) VALUES (NEWID(), @AccountNumber, @Amount);",
      "    SELECT a.BALANCE FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT AS a WHERE a.ACCOUNT_NO = @AccountNumber;",
      "    SELECT 'FROM nowhere' AS Note;",
      "END;"
    ].join("\n"), "utf8");
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["dbo.Payment",         [{ liveDocPath: "d", sourcePath: "Database/SqlServer/dbo.Payment.sql",         anchor: "symbol-dbopayment",         kind: "table" }]],
      ["dbo.usp_PostPayment", [{ liveDocPath: "d", sourcePath: "Database/SqlServer/dbo.usp_PostPayment.sql", anchor: "symbol-dbousp_postpayment", kind: "procedure" }]],
      ["CENTRAL.ACCOUNT",     [{ liveDocPath: "d", sourcePath: "Database/Oracle/CENTRAL.ACCOUNT.sql",        anchor: "symbol-centralaccount",     kind: "table" }]]
    ]);

    const result = await sqlAdapter.analyze({ absolutePath: scriptPath, workspaceRoot, symbolIndex });

    expect(result?.symbols).toEqual([{ name: "dbo.usp_PostPayment", kind: "procedure", location: { line: 2, character: 1 } }]);
    expect(result?.dependencies).toEqual([
      { specifier: "Database/SqlServer/dbo.Payment.sql",  resolvedPath: "Database/SqlServer/dbo.Payment.sql",  symbols: ["dbo.Payment"],     kind: "import" },
      { specifier: "Database/Oracle/CENTRAL.ACCOUNT.sql", resolvedPath: "Database/Oracle/CENTRAL.ACCOUNT.sql", symbols: ["CENTRAL.ACCOUNT"], kind: "import", basis: "contract" }
    ]);
  });

  it("keeps a name nothing in the scan creates, as a contract by name, and never a name the script creates itself", async () => {
    const scriptPath = path.join(workspaceRoot, "Database", "dbo.usp_Report.sql");
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, [
      "CREATE PROCEDURE dbo.usp_Report AS",
      "BEGIN",
      "    INSERT INTO dbo.Report (Note) SELECT c.Name FROM dbo.Customer AS c JOIN [Billing].[dbo].[Invoice] AS i ON i.CustomerId = c.Id;",
      "    SELECT * FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT;",
      "    EXEC dbo.usp_Report;",
      "    DELETE FROM dbo.Customer WHERE Id = 0;",
      "END;"
    ].join("\n"), "utf8");
    const symbolIndex: WorkspaceSymbolIndex = new Map([
      ["dbo.usp_Report", [{ liveDocPath: "d", sourcePath: "Database/dbo.usp_Report.sql", anchor: "symbol-dbousp_report", kind: "procedure" }]]
    ]);

    const result = await sqlAdapter.analyze({ absolutePath: scriptPath, workspaceRoot, symbolIndex });

    expect(result?.dependencies).toEqual([
      { specifier: "Billing.dbo.Invoice",             symbols: [], kind: "import", basis: "contract" },
      { specifier: "ORACLE_CENTRAL..CENTRAL.ACCOUNT", symbols: [], kind: "import", basis: "contract" },
      { specifier: "dbo.Customer",                    symbols: [], kind: "import", basis: "contract" },
      { specifier: "dbo.Report",                      symbols: [], kind: "import", basis: "contract" }
    ]);
  });

  it("publishes what the script creates, not a table a procedure's body creates when it runs, and keeps the name of neither", async () => {
    const scriptPath = path.join(workspaceRoot, "Tests", "TotalsTests.class.sql");
    await fs.mkdir(path.dirname(scriptPath), { recursive: true });
    await fs.writeFile(scriptPath, [
      "CREATE PROCEDURE TotalsTests.[test it totals] AS",
      "BEGIN",
      "    CREATE TABLE TotalsTests.Expected (Total INT);",
      "    INSERT INTO TotalsTests.Expected VALUES (1);",
      "    EXEC tSQLt.AssertEqualsTable 'TotalsTests.Expected', 'TotalsTests.Actual';",
      "END;"
    ].join("\n"), "utf8");

    const result = await sqlAdapter.analyze({ absolutePath: scriptPath, workspaceRoot, symbolIndex: new Map() });

    expect(result?.symbols).toEqual([{ name: "TotalsTests.test it totals", kind: "procedure", location: { line: 1, character: 1 } }]);
    expect(result?.dependencies).toEqual([{ specifier: "tSQLt.AssertEqualsTable", symbols: [], kind: "import", basis: "contract" }]);
  });

  /** Reads every script as the generator does: a pass for the symbols, then one with the index they make. */
  async function readScripts(files: Record<string, string>): Promise<Map<string, Awaited<ReturnType<typeof sqlAdapter.analyze>>>> {
    for (const [file, text] of Object.entries(files)) await fs.writeFile(path.join(workspaceRoot, file), text, "utf8");
    const symbolIndex: WorkspaceSymbolIndex = new Map();
    for (const file of Object.keys(files)) {
      const result = await sqlAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot });
      for (const symbol of result?.symbols ?? []) symbolIndex.set(symbol.name, [...(symbolIndex.get(symbol.name) ?? []), { liveDocPath: "d", sourcePath: file, anchor: "", kind: symbol.kind }]);
    }
    const results = new Map<string, Awaited<ReturnType<typeof sqlAdapter.analyze>>>();
    for (const file of Object.keys(files)) results.set(file, await sqlAdapter.analyze({ absolutePath: path.join(workspaceRoot, file), workspaceRoot, symbolIndex }));
    return results;
  }

  it("binds a one-part name as T-SQL does, by its module's schema and then dbo, and reads database..name as database.dbo.name", async () => {
    // ScriptDom gives the parts: `Orders` stands in dbo.ListOrders; `SisterDb..Orders` writes a database and leaves the schema
    // out. Microsoft's documentation gives the binding: a module's one-part name is its schema's, then dbo's; an omitted
    // schema is a user's default, dbo unless set. So each of the three is dbo.Orders, read from source like any name of
    // this server, and archive.Orders is no object any of them names.
    const results = await readScripts({
      "tables.sql":  "CREATE TABLE dbo.Orders (Id INT NOT NULL PRIMARY KEY);",
      "archive.sql": "CREATE TABLE archive.Orders (Id INT NOT NULL PRIMARY KEY);",
      "procs.sql":   [
        "CREATE PROCEDURE dbo.ListOrders AS SELECT Id FROM Orders;",
        "GO",
        "CREATE PROCEDURE dbo.ListSisterOrders AS",
        "BEGIN",
        "    SELECT Id FROM SisterDb..Orders;",
        "    SELECT Id FROM SisterDb.dbo.Orders;",
        "END;"
      ].join("\n")
    });

    expect(results.get("procs.sql")?.dependencies).toEqual([
      { specifier: "tables.sql", resolvedPath: "tables.sql", symbols: ["dbo.Orders"], kind: "import" }
    ]);
  });

  it("binds a module's DDL and the strings it executes by the caller's default schema, and a name neither schema holds to nothing", async () => {
    const results = await readScripts({
      "tables.sql":  "CREATE TABLE dbo.Orders (Id INT NOT NULL PRIMARY KEY);",
      "archive.sql": "CREATE TABLE archive.Orders (Id INT NOT NULL PRIMARY KEY);\nGO\nCREATE TABLE archive.Notes (Id INT NOT NULL PRIMARY KEY);",
      "list.sql":    "CREATE PROCEDURE archive.ListOrders AS SELECT Id FROM Orders;",
      "purge.sql":   "CREATE PROCEDURE archive.PurgeOrders AS TRUNCATE TABLE Orders;",
      "count.sql":   "CREATE PROCEDURE archive.CountOrders AS EXEC ('SELECT COUNT(*) FROM Orders');",
      "kept.sql":    "CREATE TRIGGER OrdersKept ON archive.Orders AFTER DELETE AS INSERT INTO Orders (Id) VALUES (0);",
      "notes.sql":   "CREATE PROCEDURE dbo.ListNotes AS SELECT Id FROM Notes;",
      "report.sql":  "SELECT Id FROM Orders;"
    });
    const lines = (file: string) => (results.get(file)?.dependencies ?? []).map((dependency) => `${dependency.specifier} ${dependency.symbols.join(",")}`);

    expect(lines("list.sql")).toEqual(["archive.sql archive.Orders"]);
    expect(lines("purge.sql")).toEqual(["tables.sql dbo.Orders"]);
    expect(lines("count.sql")).toEqual(["tables.sql dbo.Orders"]);
    expect(lines("kept.sql")).toEqual(["archive.sql archive.Orders"]);
    expect(lines("notes.sql")).toEqual(["Notes "]);
    expect(lines("report.sql")).toEqual(["tables.sql dbo.Orders"]);
  });

  it("publishes tables, views and functions, with brackets off", async () => {
    const scriptPath = path.join(workspaceRoot, "schema.sql");
    await fs.writeFile(scriptPath, [
      "CREATE TABLE [dbo].[Payment] (PaymentId NVARCHAR(36) NOT NULL PRIMARY KEY);",
      "GO",
      "CREATE OR ALTER VIEW dbo.RecentPayments AS SELECT * FROM dbo.Payment;",
      "GO",
      "CREATE FUNCTION dbo.fn_Balance() RETURNS DECIMAL(18, 2) AS BEGIN RETURN 0; END;"
    ].join("\n"), "utf8");

    const result = await sqlAdapter.analyze({ absolutePath: scriptPath, workspaceRoot });

    expect(result?.symbols.map((symbol) => `${symbol.kind} ${symbol.name} @${symbol.location?.line}`)).toEqual([
      "table dbo.Payment @1",
      "view dbo.RecentPayments @3",
      "sql-function dbo.fn_Balance @5"
    ]);
    expect(result?.dependencies).toEqual([]);
  });
});
