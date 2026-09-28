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
      "function dbo.fn_Balance @5"
    ]);
    expect(result?.dependencies).toEqual([]);
  });
});
