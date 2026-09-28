import ts from "typescript";
import { describe, expect, it } from "vitest";

import type { WorkspaceSymbolIndex } from "../coreTypes";
import { collectRouteCalls, inferRouteDependencies } from "./routes";

function parse(text: string): ts.SourceFile {
  return ts.createSourceFile("script.js", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
}

describe("collectRouteCalls", () => {
  it("reads fetch, axios, jQuery and XMLHttpRequest calls with the method and the URL as written", () => {
    const calls = collectRouteCalls(parse([
      "fetch(\"api/payments\", { method: \"POST\", body: x });",
      "fetch(\"api/payments/\" + encodeURIComponent(id));",
      "fetch(`api/payments/${id}/receipt`);",
      "window.fetch(\"/api/status\");",
      "axios.delete(\"api/payments/1\");",
      "axios({ url: \"api/other\", method: \"put\" });",
      "$.getJSON(\"api/list\");",
      "$.ajax({ url: \"api/save\", type: \"POST\" });",
      "request.open(\"GET\", \"api/poll\");",
      "fetch(computed);",
      "fetch(a + b);"
    ].join("\n")));

    expect(calls).toEqual([
      { method: "POST", url: "api/payments" },
      { method: "GET",  url: "api/payments/{}" },
      { method: "GET",  url: "api/payments/{}/receipt" },
      { method: "GET",  url: "/api/status" },
      { method: "DELETE", url: "api/payments/1" },
      { method: "put",  url: "api/other" },
      { method: "GET",  url: "api/list" },
      { method: "POST", url: "api/save" },
      { method: "GET",  url: "api/poll" }
    ]);
  });
});

describe("inferRouteDependencies", () => {
  const symbolIndex: WorkspaceSymbolIndex = new Map([
    ["POST api/payments", [
      { liveDocPath: "d", sourcePath: "Portal/Controllers/PaymentsController.cs",  anchor: "symbol-post-apipayments", kind: "route" },
      { liveDocPath: "d", sourcePath: "Gateway/Controllers/PaymentsController.cs", anchor: "symbol-post-apipayments", kind: "route" }
    ]],
    ["GET api/payments/{paymentId}", [
      { liveDocPath: "d", sourcePath: "Portal/Controllers/PaymentsController.cs",  anchor: "symbol-get-apipaymentspaymentid", kind: "route" }
    ]]
  ]);
  const fileIndex = new Set(["Portal/Portal.csproj", "Gateway/Gateway.csproj"]);

  it("links a script to the controller at home that serves each route, observed from a contract", () => {
    const sourceFile = parse("fetch(\"api/payments\", { method: \"POST\" }); fetch(\"api/payments/\" + id);");

    expect(inferRouteDependencies({ sourceFile, sourcePath: "Portal/Scripts/portal.js", fileIndex, symbolIndex })).toEqual([
      { specifier: "Portal/Controllers/PaymentsController.cs", resolvedPath: "Portal/Controllers/PaymentsController.cs", symbols: ["GET api/payments/{paymentId}", "POST api/payments"], kind: "import", basis: "contract" }
    ]);
  });

  it("keeps a route nothing serves as an external dependency, and ignores a fetched file", () => {
    const sourceFile = parse("fetch(\"api/missing\"); fetch(\"./data.json\");");

    expect(inferRouteDependencies({ sourceFile, sourcePath: "Portal/Scripts/portal.js", fileIndex, symbolIndex })).toEqual([
      { specifier: "GET api/missing", symbols: [], kind: "import", basis: "contract" }
    ]);
  });

  it("looks away from home for an absolute URL", () => {
    const sourceFile = parse("fetch(\"https://gateway.example/api/payments\", { method: \"POST\" });");

    expect(inferRouteDependencies({ sourceFile, sourcePath: "Portal/Scripts/portal.js", fileIndex, symbolIndex })).toEqual([
      { specifier: "Gateway/Controllers/PaymentsController.cs", resolvedPath: "Gateway/Controllers/PaymentsController.cs", symbols: ["POST api/payments"], kind: "import", basis: "contract" }
    ]);
  });
});
