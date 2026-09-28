import { describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "./coreTypes";
import {
  chooseServers,
  homeOf,
  matchRoute,
  matchSqlObject,
  parseRouteSymbol,
  routeSegments,
  routeSymbolName,
  routesMatch,
  sqlDeclarations,
  sqlObjectName,
  sqlReferences,
  stripSql
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

  it("strips comments and strings, keeping positions", () => {
    const text = "SELECT 1 -- FROM nowhere\n/* FROM x */ FROM 'FROM y' dbo.T";
    expect(stripSql(text)).toHaveLength(text.length);
    expect(sqlReferences(text)).toEqual([{ verb: "FROM", name: { parts: ["dbo", "t"], linked: false }, raw: "dbo.T" }]);
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
      { kind: "procedure", name: "dbo.usp_PostPayment", line: 2 },
      { kind: "view",      name: "dbo.Recent",          line: 10 }
    ]);
    expect(sqlReferences(script).map((reference) => `${reference.verb} ${reference.raw}${reference.name.linked ? " (linked)" : ""}`)).toEqual([
      "INSERT INTO dbo.Payment",
      "FROM ORACLE_CENTRAL..CENTRAL.ACCOUNT (linked)",
      "EXEC sp_executesql",
      "FROM dbo.Payment"
    ]);
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
});
