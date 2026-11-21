import { describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "./coreTypes";
import {
  bindSqlName,
  chooseServers,
  homeOf,
  isToolingFile,
  matchRoute,
  matchSqlObject,
  parseRouteSymbol,
  routeSegments,
  routesMatch,
  routeSymbolName,
  sqlDeclarations,
  sqlObjectName,
  sqlReferences
} from "./openings";

describe("routes", () => {
  it("normalises a template to its segments", () => {
    expect(routeSegments("/api/payments/{paymentId:guid?}/")).toEqual(["api", "payments", "{paymentId}"]);
    expect(routeSegments("~/files/{*path}")).toEqual(["files", "{*}"]);
    expect(routeSegments("https://gateway.example/api/x?y=1")).toEqual(["api", "x"]);
    expect(routeSegments("api/payments/{}")).toEqual(["api", "payments", "{}"]);
  });

  it("names a route symbol by its method and path, and reads the name back", () => {
    expect(routeSymbolName("get", "/api/payments/{id}")).toBe("GET api/payments/{id}");
    expect(routeSymbolName(undefined, "api/payments")).toBe("api/payments");
    expect(parseRouteSymbol("GET api/payments/{id}")).toEqual({ method: "GET", segments: ["api", "payments", "{id}"] });
    expect(parseRouteSymbol("api/payments")).toEqual({ segments: ["api", "payments"] });
  });

  it("matches a call to a served route segment by segment", () => {
    const served = parseRouteSymbol("GET api/payments/{paymentId}");
    expect(routesMatch({ method: "GET", segments: ["api", "payments", "{}"] }, served)).toBe(true);
    expect(routesMatch({ method: "GET", segments: ["api", "payments", "42"] }, served)).toBe(true);
    expect(routesMatch({ segments: ["API", "Payments", "42"] }, served)).toBe(true);
    expect(routesMatch({ method: "POST", segments: ["api", "payments", "42"] }, served)).toBe(false);
    expect(routesMatch({ method: "GET", segments: ["api", "payments"] }, served)).toBe(false);
    expect(routesMatch({ method: "GET", segments: ["api", "{}", "42"] }, served)).toBe(false);
    expect(routesMatch({ method: "GET", segments: ["files", "a", "b", "c"] }, parseRouteSymbol("GET files/{*path}"))).toBe(true);
  });

  const index: WorkspaceSymbolIndex = new Map([
    ["POST api/payments", [
      { liveDocPath: "d/Portal/Controllers/PaymentsController.cs.md",  sourcePath: "Portal/Controllers/PaymentsController.cs",  anchor: "symbol-post-apipayments", kind: "route" },
      { liveDocPath: "d/Gateway/Controllers/PaymentsController.cs.md", sourcePath: "Gateway/Controllers/PaymentsController.cs", anchor: "symbol-post-apipayments", kind: "route" }
    ]],
    ["PaymentsController", [{ liveDocPath: "x", sourcePath: "Portal/Controllers/PaymentsController.cs", anchor: "symbol-paymentscontroller", kind: "class" }]]
  ]);
  const files = new Set(["Portal/Portal.csproj", "Gateway/Gateway.csproj", "Portal/Scripts/portal.js", "Portal/Services/GatewayClient.cs"]);

  it("finds the served routes a call matches, whatever their files", () => {
    const matches = matchRoute({ method: "POST", segments: ["api", "payments"] }, index);
    expect(matches.map((route) => route.location.sourcePath)).toEqual(["Portal/Controllers/PaymentsController.cs", "Gateway/Controllers/PaymentsController.cs"]);
  });

  it("tells a file's home by the nearest manifest", () => {
    expect(homeOf("Portal/Scripts/portal.js", files)).toBe("Portal");
    expect(homeOf("Gateway/Controllers/PaymentsController.cs", files)).toBe("Gateway");
    expect(homeOf("Database/dbo.Payment.sql", files)).toBe("");
    expect(homeOf("Portal/Scripts/portal.js", undefined)).toBe("");
  });

  it("prefers a server at home for a script and away from home for a client, falling back to the other side", () => {
    const matches = matchRoute({ method: "POST", segments: ["api", "payments"] }, index);
    expect(chooseServers(matches, "Portal/Scripts/portal.js", files, true).map((route) => route.location.sourcePath)).toEqual(["Portal/Controllers/PaymentsController.cs"]);
    expect(chooseServers(matches, "Portal/Services/GatewayClient.cs", files, false).map((route) => route.location.sourcePath)).toEqual(["Gateway/Controllers/PaymentsController.cs"]);
    expect(chooseServers(matches.slice(0, 1), "Portal/Services/GatewayClient.cs", files, false).map((route) => route.location.sourcePath)).toEqual(["Portal/Controllers/PaymentsController.cs"]);
    expect(chooseServers(matches, "Other/app.js", files, true).map((route) => route.location.sourcePath)).toEqual(matches.map((route) => route.location.sourcePath));
  });
});

describe("database objects", () => {
  it("reads written names down to schema and object, noting a linked server", () => {
    expect(sqlObjectName("dbo.usp_PostPayment")).toEqual({ parts: ["dbo", "usp_postpayment"], linked: false });
    expect(sqlObjectName("[dbo].[Payment]")).toEqual({ parts: ["dbo", "payment"], linked: false });
    expect(sqlObjectName("Payments.dbo.Payment")).toEqual({ parts: ["dbo", "payment"], linked: false });
    expect(sqlObjectName("ORACLE_CENTRAL..CENTRAL.ACCOUNT")).toEqual({ parts: ["central", "account"], linked: true });
    expect(sqlObjectName("Payment")).toEqual({ parts: ["payment"], linked: false });
  });

  it("reads nothing inside a comment, a nested comment or a string", () => {
    const text = "SELECT 1 -- FROM nowhere\n/* FROM x /* FROM nested */ FROM still.comment */ SELECT 'FROM y' AS a FROM dbo.T";
    expect(sqlReferences(text)).toEqual([{ verb: "FROM", name: { parts: ["dbo", "t"], linked: false }, raw: "dbo.T" }]);
  });

  it("reads what a script calls and applies, executes into a variable, references by a foreign key, and writes without INTO or FROM", () => {
    const script = [
      "CREATE TABLE dbo.Line (Id INT, InvoiceId INT REFERENCES dbo.Invoice (Id), Total AS dbo.fn_Total(Id));",
      "GO",
      "CREATE PROCEDURE dbo.p AS",
      "BEGIN",
      "    DECLARE @rc INT;",
      "    EXEC @rc = dbo.usp_Archive @Id = 1;",
      "    INSERT dbo.Audit (Note) VALUES (N'x');",
      "    DELETE dbo.Old WHERE Id = 1;",
      "    DELETE o FROM dbo.Older AS o;",
      "    MERGE dbo.Target AS t USING dbo.Source AS s ON t.Id = s.Id WHEN MATCHED THEN DELETE;",
      "    IF tSQLt.Private_IsTestClass(@c) = 1",
      "        SELECT x.y.value('a', 'int'), r.Lines.value('b', 'int') FROM dbo.Lines AS r CROSS APPLY dbo.fn_Split(r.Id) AS f OUTER APPLY r.Doc.nodes('/a') AS n(c);",
      "    SELECT 1 FROM dbo.Users u WITH (NOLOCK), dbo.Roles AS r, @rows AS w, dbo.fn_Range(1, 2) AS g (n)",
      "        LEFT JOIN (dbo.Defs d JOIN dbo.Mods m ON m.Id = d.Id) ON 1 = 1;",
      "    CREATE INDEX ix ON dbo.Line (InvoiceId);",
      "    GRANT REFERENCES ON dbo.Line TO app;",
      "    BEGIN DIALOG @h FROM SERVICE [//Billing/Service] TO SERVICE N'//Billing/Service';",
      "END;",
      "GO",
      "CREATE EVENT SESSION calls ON SERVER ADD EVENT sqlserver.rpc_completed (SET collect_statement = 1) ADD TARGET package0.ring_buffer (SET max_memory = 4096);"
    ].join("\n");
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual([
      "REFERENCES dbo.Invoice",
      "CALL dbo.fn_Total",
      "EXEC dbo.usp_Archive",
      "INSERT dbo.Audit",
      "DELETE dbo.Old",
      "FROM dbo.Older",
      "MERGE dbo.Target",
      "USING dbo.Source",
      "CALL tSQLt.Private_IsTestClass",
      "FROM dbo.Lines",
      "APPLY dbo.fn_Split",
      "FROM dbo.Users",
      "FROM dbo.Roles",
      "FROM dbo.fn_Range",
      "JOIN dbo.Defs",
      "JOIN dbo.Mods"
    ]);
  });

  it("reads no name a statement or its batch defines, nor a word T-SQL reserves, as an object", () => {
    const script = [
      "CREATE TYPE dbo.Money FROM DECIMAL(18, 2);",
      "GO",
      "CREATE PROCEDURE tests.[test it can execute if asked to] AS",
      "BEGIN",
      "    WITH recent AS (SELECT * FROM dbo.Invoice), totals (Id, Total) AS (SELECT Id, SUM(x) FROM recent GROUP BY Id)",
      "    SELECT * INTO #t FROM totals;",
      "    UPDATE c SET Note = 'x' FROM dbo.Customer AS c JOIN #t ON 1 = 1;",
      "    DELETE FROM t FROM dbo.Old t WHERE t.Id = 1;",
      "    UPDATE Jobs SET Completed = 1 FROM @Jobs Jobs WHERE JobId = 1;",
      "    UPDATE STATISTICS dbo.Invoice;",
      "    EXECUTE AS USER = 'x';",
      "    EXECUTE IMMEDIATE 'TRUNCATE TABLE central.day_buffer';",
      "    SELECT * FROM tempdb..#gone;",
      "    INSERT INTO @rows SELECT 1;",
      "    FETCH NEXT FROM columnsLeft INTO @x;",
      "END;",
      "GO",
      "CREATE TABLE dbo.Line (Id INT REFERENCES dbo.Invoice (Id) ON DELETE CASCADE ON UPDATE NO ACTION);",
      "CREATE USER [app] FROM LOGIN [app];"
    ].join("\n");
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual([
      "FROM dbo.Invoice",
      "FROM dbo.Customer",
      "FROM dbo.Old",
      "REFERENCES dbo.Invoice"
    ]);
  });

  it("finds what a script declares and what it names", () => {
    const script = [
      "-- Posts a payment.",
      "CREATE PROCEDURE dbo.usp_PostPayment @Amount DECIMAL(18, 2)",
      "AS",
      "BEGIN",
      "    INSERT INTO dbo.Payment (Amount) VALUES (@Amount);",
      "    SELECT a.BALANCE FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT AS a JOIN #temp t ON 1 = 1;",
      "    DELETE FROM @rows;",
      "    EXEC sp_executesql N'x';",
      "END;",
      "CREATE OR ALTER VIEW [dbo].[Recent] AS SELECT * FROM dbo.Payment;"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([
      { kind: "procedure", name: "dbo.usp_PostPayment", line: 2, inBody: false },
      { kind: "view",      name: "dbo.Recent",          line: 10, inBody: false }
    ]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}${reference.name.linked ? " (linked)" : ""}`)).toEqual([
      "INSERT INTO dbo.Payment",
      "FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT (linked)",
      "EXEC sp_executesql",
      "FROM dbo.Payment"
    ]);
  });

  it("puts a declaration at its own line, whatever comment, string or name spans lines before it", () => {
    expect(sqlDeclarations("/*\n licence\n*/\nCREATE TABLE dbo.T (a int);")).toEqual([{ kind: "table", name: "dbo.T", line: 4, inBody: false }]);
    expect(sqlDeclarations("PRINT 'one\r\ntwo\r\nthree';\r\nGO\r\nCREATE PROCEDURE [a\r\nb] AS SELECT 1;\r\nGO\r\nCREATE VIEW dbo.V AS SELECT 1 AS x;")).toEqual([
      { kind: "procedure", name: "a\r\nb", line: 5, inBody: false },
      { kind: "view",      name: "dbo.V",  line: 8, inBody: false }
    ]);
  });

  it("reads Oracle's CREATE with the words that stand between CREATE and what it makes", () => {
    const script = [
      "create global temporary table ut_coverage_sources_tmp (a NUMBER) on commit preserve rows;",
      "CREATE PRIVATE TEMPORARY TABLE ora$ptt_rows (a NUMBER);",
      "CREATE OR REPLACE EDITIONABLE PROCEDURE central.close_day IS BEGIN NULL; END;",
      "/",
      "CREATE OR REPLACE NONEDITIONABLE FUNCTION central.fmt RETURN VARCHAR2 IS BEGIN RETURN 'x'; END;",
      "/",
      "CREATE OR REPLACE FORCE EDITIONABLE VIEW central.open_accounts AS SELECT * FROM central.account;",
      "CREATE OR REPLACE NO FORCE VIEW central.v2 AS SELECT 1 a FROM dual;",
      "CREATE TABLE central.accounts OF account_t;"
    ].join("\n");
    expect(sqlDeclarations(script).map((declaration) => `${declaration.kind} ${declaration.name} @${declaration.line}`)).toEqual([
      "table ut_coverage_sources_tmp @1",
      "table ora$ptt_rows @2",
      "procedure central.close_day @3",
      "sql-function central.fmt @5",
      "view central.open_accounts @7",
      "view central.v2 @8",
      "table central.accounts @9"
    ]);
  });

  it("reads past an Oracle q-quoted string and a SQL*Plus PROMPT or REM line holding an apostrophe, and keeps a column of that name", () => {
    const script = [
      "PROMPT Creating the day's close",
      "CREATE OR REPLACE PROCEDURE central.close_day IS v VARCHAR2(20) := q'[it's closed]'; w VARCHAR2(9) := Q'{a'b}'; BEGIN NULL; END;",
      "/",
      "REM it's done; the ledger follows",
      "CREATE TABLE central.ledger (a NUMBER);",
      "SELECT Id,",
      "Remark FROM dbo.Notes;"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([
      { kind: "procedure", name: "central.close_day", line: 2, inBody: false },
      { kind: "table",     name: "central.ledger",    line: 5, inBody: false }
    ]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual(["FROM dbo.Notes"]);
  });

  it("reads the SQL a script executes from a string written out in full, where it runs, and not a string with a computed part", () => {
    const script = [
      "IF OBJECT_ID('tSQLt.AssertStringIn') IS NOT NULL DROP PROCEDURE tSQLt.AssertStringIn;",
      "GO",
      "EXEC('CREATE PROCEDURE tSQLt.AssertStringIn @Actual NVARCHAR(MAX)",
      "AS",
      "BEGIN",
      "  EXEC tSQLt.Fail ''it''''s not in'';",
      "END;');",
      "GO",
      "EXEC sp_executesql N'SELECT * FROM dbo.Settings';",
      "EXEC (N'SELECT 1 FROM ' + @table);",
      "SELECT * FROM OPENQUERY(ORACLE_CENTRAL, 'SELECT BALANCE FROM CENTRAL.ACCOUNT');",
      "GO",
      "CREATE PROCEDURE tests.[test it] AS EXEC('CREATE PROCEDURE tests.Helper AS EXEC dbo.Inner;');"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([
      { kind: "procedure", name: "tSQLt.AssertStringIn", line: 3,  inBody: false },
      { kind: "procedure", name: "tests.test it",        line: 13, inBody: false },
      { kind: "procedure", name: "tests.Helper",         line: 13, inBody: true }
    ]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}${reference.name.linked ? " (linked)" : ""}`)).toEqual([
      "EXEC tSQLt.Fail",
      "FROM dbo.Settings",
      "EXEC sp_executesql",
      "FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT (linked)",
      "EXEC dbo.Inner"
    ]);
  });

  it("puts a procedure created as a stub and then altered at its ALTER, and reads an ALTER of what nothing here creates as a use", () => {
    const script = [
      "IF OBJECT_ID('dbo.usp_Get') IS NULL EXEC('CREATE PROCEDURE dbo.usp_Get AS BEGIN SELECT 1 END');",
      "GO",
      "ALTER PROCEDURE dbo.usp_Get @Id INT AS SELECT * FROM dbo.Things WHERE Id = @Id;",
      "GO",
      "ALTER PROCEDURE dbo.usp_Other AS SELECT 1;"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([{ kind: "procedure", name: "dbo.usp_Get", line: 3, inBody: false }]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual(["ALTER dbo.usp_Get", "FROM dbo.Things", "ALTER dbo.usp_Other"]);
  });

  it("tells a table a procedure's body creates when it runs from one the script creates", () => {
    const script = [
      "CREATE TABLE dbo.Kept (a INT);",
      "GO",
      "CREATE PROCEDURE tests.[test it] AS",
      "BEGIN",
      "    CREATE TABLE tests.Expected (a INT);",
      "    CREATE TABLE #actual (a INT);",
      "END;",
      "GO",
      "ALTER PROCEDURE dbo.p AS CREATE TABLE dbo.Made (a INT);",
      "GO",
      "CREATE TABLE dbo.Also (a INT);"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([
      { kind: "table",     name: "dbo.Kept",       line: 1,  inBody: false },
      { kind: "procedure", name: "tests.test it",  line: 3,  inBody: false },
      { kind: "table",     name: "tests.Expected", line: 5,  inBody: true },
      { kind: "table",     name: "dbo.Made",       line: 9,  inBody: true },
      { kind: "table",     name: "dbo.Also",       line: 11, inBody: false }
    ]);
  });

  it("reads no object of the database engine's own: its system schemas and its built-in table functions", () => {
    const script = [
      "SELECT * FROM sys.objects o JOIN INFORMATION_SCHEMA.COLUMNS c ON 1 = 1 CROSS JOIN STRING_SPLIT(@list, ',') s JOIN OPENJSON(@doc) j ON 1 = 1;",
      "EXEC master.sys.sp_executesql N'SELECT 1';",
      "EXEC sys.sp_addextendedproperty 'x';",
      "SELECT * FROM dbo.Mine JOIN Billing.sys_log ON 1 = 1;"
    ].join("\n");
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual(["FROM dbo.Mine", "JOIN Billing.sys_log"]);
  });

  it("ends a line at a carriage return alone, as editors and SQL Server's parser do", () => {
    expect(sqlDeclarations("PRINT 1;\r\r\nCREATE TABLE dbo.T (a INT); -- one\rCREATE TABLE dbo.U (a INT);")).toEqual([
      { kind: "table", name: "dbo.T", line: 3, inBody: false },
      { kind: "table", name: "dbo.U", line: 4, inBody: false }
    ]);
  });

  it("never lets an apostrophe in a bracketed name open a string: the cold run's smallest crash", () => {
    expect(sqlDeclarations("CREATE PROC [a'b]\n'\nx]")).toEqual([{ kind: "procedure", name: "a'b", line: 1, inBody: false }]);
  });

  it("reads a name quoted in brackets or double quotes as the name itself, whatever it holds", () => {
    const script = [
      "CREATE PROCEDURE tests.[test it doesn't fail]",
      "AS",
      "BEGIN",
      "    EXEC tSQLt.FakeTable 'dbo.T';",
      "END;",
      "GO",
      "CREATE PROCEDURE tests.[test fn.sums ]]the[[ open ones] AS SELECT * FROM \"odd \"\"quoted\"\" schema\".[it's];"
    ].join("\n");
    expect(sqlDeclarations(script)).toEqual([
      { kind: "procedure", name: "tests.test it doesn't fail",             line: 1, inBody: false },
      { kind: "procedure", name: "tests.[test fn.sums ]]the[[ open ones]", line: 7, inBody: false }
    ]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}`)).toEqual([
      "EXEC tSQLt.FakeTable",
      "FROM [odd \"quoted\" schema].it's"
    ]);
    expect(sqlObjectName("tests.[test fn.sums ]]the[[ open ones]")).toEqual({ parts: ["tests", "test fn.sums ]the[[ open ones"], linked: false });
    expect(sqlObjectName("[Billing].[dbo].[Invoice]")).toEqual({ parts: ["dbo", "invoice"], linked: false });
  });

  it("matches a name to the declared objects of the workspace", () => {
    const index: WorkspaceSymbolIndex = new Map([
      ["dbo.Payment",        [{ liveDocPath: "d", sourcePath: "Database/SqlServer/dbo.Payment.sql",         anchor: "symbol-dbopayment",        kind: "table" }]],
      ["dbo.usp_PostPayment", [{ liveDocPath: "d", sourcePath: "Database/SqlServer/dbo.usp_PostPayment.sql", anchor: "symbol-dbousp_postpayment", kind: "procedure" }]],
      ["CENTRAL.ACCOUNT",    [{ liveDocPath: "d", sourcePath: "Database/Oracle/CENTRAL.ACCOUNT.sql",        anchor: "symbol-centralaccount",    kind: "table" }]],
      ["Payment",            [{ liveDocPath: "d", sourcePath: "PaymentService/Data/Payment.cs",              anchor: "symbol-payment",           kind: "class" }]]
    ]);
    expect(matchSqlObject(sqlObjectName("[dbo].[payment]"), index).map((object) => object.name)).toEqual(["dbo.Payment"]);
    expect(matchSqlObject(sqlObjectName("ORACLE_CENTRAL..CENTRAL.ACCOUNT"), index).map((object) => object.name)).toEqual(["CENTRAL.ACCOUNT"]);
    expect(matchSqlObject(sqlObjectName("Payment"), index).map((object) => object.name)).toEqual(["dbo.Payment"]);
    expect(matchSqlObject(sqlObjectName("other.Payment"), index)).toEqual([]);
  });

  it("says which schema a one-part name binds by: its module's, a trigger's table's, and none in DDL, in a string or outside a module", () => {
    const script = [
      "SELECT 1 FROM Loose;",
      "GO",
      "CREATE PROCEDURE archive.ListOrders AS",
      "BEGIN",
      "    SELECT o.Id FROM Orders AS o JOIN dbo.Customers AS c ON c.Id = o.Id;",
      "    EXEC Archive_Log;",
      "    TRUNCATE TABLE Staging;",
      "    EXEC ('SELECT 1 FROM InString');",
      "END;",
      "GO",
      "CREATE TRIGGER OrdersKept ON archive.Orders AFTER DELETE AS INSERT INTO Kept (Id) VALUES (0);",
      "GO",
      "ALTER VIEW Reports.Totals AS SELECT 1 AS x FROM Ledger;",
      "GO",
      "CREATE FUNCTION Unwritten() RETURNS TABLE AS RETURN SELECT 1 AS x FROM Things;"
    ].join("\n");
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw} ${reference.moduleSchema ?? "-"}`)).toEqual([
      "FROM Loose -",
      "FROM Orders archive",
      "JOIN dbo.Customers archive",
      "EXEC Archive_Log archive",
      "TRUNCATE TABLE Staging -",
      "FROM InString -",
      "INSERT INTO Kept archive",
      "ALTER Reports.Totals -",
      "FROM Ledger reports",
      "FROM Things -"
    ]);
  });

  it("binds a one-part name to its module's schema, then dbo, and to nothing when neither holds it; a written schema to itself", () => {
    const declared = [{ name: "dbo.Orders", parts: ["dbo", "orders"] }, { name: "archive.Orders", parts: ["archive", "orders"] }, { name: "archive.Notes", parts: ["archive", "notes"] }, { name: "Things", parts: ["things"] }];
    const bound = (raw: string, moduleSchema?: string) => {
      const name = sqlObjectName(raw);
      const matches = declared.filter((object) => object.parts[object.parts.length - 1] === name.parts[name.parts.length - 1] && (name.parts.length === 1 || object.parts.join(".") === name.parts.join(".")));
      return bindSqlName({ name, ...(moduleSchema ? { moduleSchema } : {}) }, matches).map((object) => object.name);
    };
    expect(bound("Orders")).toEqual(["dbo.Orders"]);
    expect(bound("Orders", "archive")).toEqual(["archive.Orders"]);
    expect(bound("Notes")).toEqual([]);
    expect(bound("Notes", "sales")).toEqual([]);
    expect(bound("Notes", "archive")).toEqual(["archive.Notes"]);
    expect(bound("Things", "archive")).toEqual(["Things"]);
    expect(bound("archive.Orders")).toEqual(["archive.Orders"]);
    expect(bound("ORACLE_CENTRAL...Orders")).toEqual(["dbo.Orders", "archive.Orders"]);
  });
});

describe("isToolingFile", () => {
  it("knows a compiler's, a runner's and a .NET configuration by its name, anywhere", () => {
    for (const file of ["tsconfig.json", "packages/app/tsconfig.base.json", "vitest.config.ts", "tests/e2e/playwright.config.ts", "eslint.config.js", "src/Web.config", "packages.config", ".live-docs.config.json"]) {
      expect(isToolingFile(file), file).toBe(true);
    }
  });

  it("knows every package manifest by its name, and nothing else of its format", () => {
    for (const file of ["package.json", "packages/engine/package.json", "Hub/Hub.csproj", "Lib/Lib.fsproj", "Old/Old.VBPROJ", "Cargo.toml", "crates/core/Cargo.toml", "pyproject.toml", "go.mod", "svc/pom.xml", "build.gradle.kts", "Gemfile"]) {
      expect(isToolingFile(file), file).toBe(true);
    }
    for (const file of ["rustfmt.toml", "cargo.toml", "src/pyproject.py", "go.sum", "log4j2.xml", "package.json5", "Hub/Hub.csproj.user"]) {
      expect(isToolingFile(file), file).toBe(false);
    }
  });

  it("knows an editor's and a development container's configuration by its place", () => {
    // A second development container stands one folder down, the specification's third place (this repository's own
    // `.devcontainer/wsl2-graphics-card/devcontainer.json`, 2026-11-17); two folders down is no documented place.
    for (const file of [".vscode/settings.json", ".vscode/tasks.json", "tools/.vscode/launch.json", ".devcontainer/devcontainer.json", ".devcontainer.json", ".devcontainer/wsl2-graphics-card/devcontainer.json"]) {
      expect(isToolingFile(file), file).toBe(true);
    }
    for (const file of ["settings.json", "devcontainer.json", "src/vscode/settings.json", ".vscode/README.md", "config.json", ".devcontainer/a/b/devcontainer.json", ".devcontainer/wsl2-graphics-card/settings.json"]) {
      expect(isToolingFile(file), file).toBe(false);
    }
  });
});
