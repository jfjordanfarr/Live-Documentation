import { describe, expect, it } from "vitest";

import { parseLiveDoc, renderLiveDoc, type LiveDoc, type SymbolBlock } from "./document";
import { deriveEstateGraph, contains } from "./estateGraph";
import { deriveLiveDocGraph, type LiveDocGraph } from "./graph";

const location = { root: ".live-documentation", baseLayer: "source", extension: ".md" };

function doc(codePath: string, parts: Partial<LiveDoc>): { docPath: string; doc: LiveDoc } {
  const text = renderLiveDoc({ codePath, layer: 4, archetype: "implementation", authored: "### Purpose\nX.\n\n### Notes\nNone.", symbols: [], dependencies: [], ...parts });
  return { docPath: `${location.root}/${location.baseLayer}/${codePath}${location.extension}`, doc: parseLiveDoc(text) };
}

function symbol(name: string, slug: string, kind: string): SymbolBlock {
  return { name, slug, kind, flags: [], references: [], sections: [] };
}

function scan(...docs: Array<{ docPath: string; doc: LiveDoc }>): LiveDocGraph {
  return deriveLiveDocGraph(docs, location);
}

/** The portal: a client that calls a route its own controller also serves, linked at home by the scan, and a route nothing serves. */
const portal = scan(
  doc("Controllers/PaymentsController.cs", { symbols: [symbol("POST api/payments", "symbol-post-apipayments", "route")] }),
  doc("Services/GatewayClient.cs", {
    dependencies: [
      { label: "PaymentsController.POST api/payments", link: "../Controllers/PaymentsController.cs.md#symbol-post-apipayments", qualifiers: ["contract"] },
      { label: "GET api/nowhere", qualifiers: ["contract"] }
    ]
  }),
  doc("Scripts/portal.js", {
    dependencies: [
      { label: "PaymentsController.POST api/payments", link: "../Controllers/PaymentsController.cs.md#symbol-post-apipayments", qualifiers: ["contract"] },
      { label: "POST api/elsewhere", qualifiers: ["contract"] }
    ]
  }),
  doc("Portal.csproj", {
    symbols: [symbol("Portal", "symbol-portal", "web")],
    dependencies: [{ label: "Contracts", qualifiers: [] }, { label: "Microsoft.AspNet.WebApi.Core@5.3.0", qualifiers: [] }]
  })
);

/** The gateway: serves the same route shape with a parameter, listens nowhere, calls the hub's address, and references the contracts project by name. */
const gateway = scan(
  doc("Controllers/PaymentsController.cs", { symbols: [symbol("POST api/payments", "symbol-post-apipayments", "route"), symbol("GET api/payments/{paymentId}", "symbol-get-apipaymentspaymentid", "route")] }),
  doc("Web.config", { dependencies: [{ label: "net.tcp://hub.onprem.example:8731/PaymentHub", qualifiers: ["configuration"] }] }),
  doc("Gateway.csproj", { symbols: [symbol("Gateway", "symbol-gateway", "web")], dependencies: [{ label: "Contracts", qualifiers: [] }] })
);

const hub = scan(doc("App.config", { symbols: [symbol("net.tcp://hub.onprem.example:8731/PaymentHub", "symbol-hub-address", "address")] }));

const contracts = scan(doc("Contracts.csproj", { symbols: [symbol("Estate.Contracts", "symbol-estatecontracts", "library")] }));

const payments = scan(
  doc("Data/PaymentsContext.cs", { dependencies: [{ label: "dbo.usp_PostPayment", qualifiers: ["contract"] }, { label: "dbo.Audit", qualifiers: ["contract"] }] })
);

const sqlserver = scan(
  doc("dbo.usp_PostPayment.sql", {
    symbols: [symbol("dbo.usp_PostPayment", "symbol-dbousp_postpayment", "procedure")],
    dependencies: [{ label: "ORACLE_CENTRAL..CENTRAL.ACCOUNT", qualifiers: ["contract"] }]
  })
);

const oracle = scan(doc("CENTRAL.ACCOUNT.sql", { symbols: [symbol("CENTRAL.ACCOUNT", "symbol-centralaccount", "table")] }));

const estate = deriveEstateGraph(
  [
    { folder: "Portal", graph: portal },
    { folder: "Gateway", graph: gateway },
    { folder: "Hub", graph: hub },
    { folder: "Contracts", graph: contracts },
    { folder: "PaymentService", graph: payments },
    { folder: "Database/SqlServer", graph: sqlserver },
    { folder: "Database/Oracle", graph: oracle }
  ],
  location
);

describe("deriveEstateGraph", () => {
  it("returns one scan at the estate's root as it is", () => {
    expect(deriveEstateGraph([{ folder: "", graph: portal }], location)).toBe(portal);
  });

  it("keys every file from the estate's root, in path order, and keeps each doc's path inside its scan", () => {
    expect(Object.keys(estate.files)).toEqual([
      "Contracts/Contracts.csproj",
      "Database/Oracle/CENTRAL.ACCOUNT.sql",
      "Database/SqlServer/dbo.usp_PostPayment.sql",
      "Gateway/Controllers/PaymentsController.cs",
      "Gateway/Gateway.csproj",
      "Gateway/Web.config",
      "Hub/App.config",
      "PaymentService/Data/PaymentsContext.cs",
      "Portal/Controllers/PaymentsController.cs",
      "Portal/Portal.csproj",
      "Portal/Scripts/portal.js",
      "Portal/Services/GatewayClient.cs"
    ]);
    expect(estate.files["Hub/App.config"].docPath).toBe("Hub/.live-documentation/source/App.config.md");
    expect(estate.files["Hub/App.config"].codePath).toBe("Hub/App.config");
  });

  it("adds the server another scan publishes to a route call the scan linked at home, keeping the home link and the basis", () => {
    const client = estate.files["Portal/Services/GatewayClient.cs"];
    const routes = client.edges.filter((edge) => edge.basis === "contract" && edge.to !== undefined);
    expect(routes.map((edge) => [edge.to, edge.toSymbol])).toEqual([
      ["Portal/Controllers/PaymentsController.cs", "symbol-post-apipayments"],
      ["Gateway/Controllers/PaymentsController.cs", "symbol-post-apipayments"]
    ]);
    expect(client.outbound).toEqual(["Gateway/Controllers/PaymentsController.cs", "Portal/Controllers/PaymentsController.cs"]);
    expect(estate.files["Gateway/Controllers/PaymentsController.cs"].inbound).toEqual(["Portal/Services/GatewayClient.cs"]);
    // The scan's own graph is untouched.
    expect(portal.files["Services/GatewayClient.cs"].edges.filter((edge) => edge.to !== undefined)).toHaveLength(1);
  });

  it("keeps a browser script's call at home, matching only what its scan could not serve", () => {
    const script = estate.files["Portal/Scripts/portal.js"];
    expect(script.edges.map((edge) => [edge.label, edge.to])).toEqual([
      ["PaymentsController.POST api/payments", "Portal/Controllers/PaymentsController.cs"],
      ["POST api/elsewhere", undefined]
    ]);
  });

  it("leaves a name no scan serves as it was", () => {
    const client = estate.files["Portal/Services/GatewayClient.cs"];
    expect(client.edges.find((edge) => edge.label === "GET api/nowhere")).toEqual({ kind: "import", label: "GET api/nowhere", basis: "contract" });
    expect(estate.files["PaymentService/Data/PaymentsContext.cs"].edges.find((edge) => edge.label === "dbo.Audit")?.to).toBeUndefined();
  });

  it("links an address to the listener another scan publishes", () => {
    const edge = estate.files["Gateway/Web.config"].edges[0];
    expect(edge).toEqual({ kind: "import", label: "net.tcp://hub.onprem.example:8731/PaymentHub", basis: "configuration", to: "Hub/App.config", toSymbol: "symbol-hub-address" });
  });

  it("links a database object by schema and name, and a linked-server name by its last two parts", () => {
    const context = estate.files["PaymentService/Data/PaymentsContext.cs"];
    expect(context.edges.find((edge) => edge.label === "dbo.usp_PostPayment")).toEqual({ kind: "import", label: "dbo.usp_PostPayment", basis: "contract", to: "Database/SqlServer/dbo.usp_PostPayment.sql", toSymbol: "symbol-dbousp_postpayment" });
    const procedure = estate.files["Database/SqlServer/dbo.usp_PostPayment.sql"];
    expect(procedure.edges[0]).toEqual({ kind: "import", label: "ORACLE_CENTRAL..CENTRAL.ACCOUNT", basis: "contract", to: "Database/Oracle/CENTRAL.ACCOUNT.sql", toSymbol: "symbol-centralaccount" });
    expect(estate.files["Database/Oracle/CENTRAL.ACCOUNT.sql"].inbound).toEqual(["Database/SqlServer/dbo.usp_PostPayment.sql"]);
  });

  it("links a project reference kept by name to the project another scan publishes, by the file's stem when the assembly is named otherwise, and leaves packages alone", () => {
    const gatewayProject = estate.files["Gateway/Gateway.csproj"];
    expect(gatewayProject.edges).toEqual([{ kind: "import", label: "Contracts", to: "Contracts/Contracts.csproj", toSymbol: "symbol-estatecontracts" }]);
    const portalProject = estate.files["Portal/Portal.csproj"];
    expect(portalProject.edges.find((edge) => edge.label === "Microsoft.AspNet.WebApi.Core@5.3.0")?.to).toBeUndefined();
    expect(estate.files["Contracts/Contracts.csproj"].inbound).toEqual(["Gateway/Gateway.csproj", "Portal/Portal.csproj"]);
  });

  it("refuses scans that nest or repeat", () => {
    expect(() => deriveEstateGraph([{ folder: "", graph: hub }, { folder: "Hub", graph: hub }], location)).toThrow("a scan lies inside another");
    expect(() => deriveEstateGraph([{ folder: "a", graph: hub }, { folder: "a/b", graph: hub }], location)).toThrow("a scan lies inside another");
    expect(() => deriveEstateGraph([{ folder: "a", graph: hub }, { folder: "a", graph: hub }], location)).toThrow("two scans cover a");
  });

  it("knows which folders contain which", () => {
    expect(contains("", "anything")).toBe(true);
    expect(contains("a", "a/b")).toBe(true);
    expect(contains("a", "ab")).toBe(false);
    expect(contains("a/b", "a")).toBe(false);
  });
});
