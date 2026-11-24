import { describe, expect, it } from "vitest";

import { disambiguateHopContexts } from "./path-hops";

describe("disambiguateHopContexts", () => {
  it("omits hops whose basename is unique in the path", () => {
    const contexts = disambiguateHopContexts([
      "Portal/Pages/Default.aspx",
      "Portal/Scripts/portal.js",
      "Database/SqlServer/dbo.Payment.sql"
    ]);
    expect(contexts.size).toBe(0);
  });

  it("distinguishes the estate route's colliding App.config and PaymentsController.cs hops", () => {
    const contexts = disambiguateHopContexts([
      "Portal/Pages/Default.aspx",
      "Portal/Scripts/portal.js",
      "Portal/Controllers/PaymentsController.cs",
      "Portal/Services/GatewayClient.cs",
      "Gateway/Controllers/PaymentsController.cs",
      "Gateway/Wcf/HubProxy.cs",
      "Gateway/Web.config",
      "Hub/App.config",
      "PaymentService/App.config",
      "PaymentService/PaymentService.cs",
      "PaymentService/Data/SqlPaymentRepository.cs",
      "Database/SqlServer/dbo.Payment.sql"
    ]);
    expect([...contexts.entries()]).toEqual([
      ["Portal/Controllers/PaymentsController.cs", "Portal/Controllers"],
      ["Gateway/Controllers/PaymentsController.cs", "Gateway/Controllers"],
      ["Hub/App.config", "Hub"],
      ["PaymentService/App.config", "PaymentService"]
    ]);
  });

  it("handles deeper shared trailing folders and asymmetric nesting depths", () => {
    const contexts = disambiguateHopContexts([
      "services/payments/v1/api/index.ts",
      "services/billing/v1/api/index.ts",
      "v1/api/index.ts",
      "shared/index.ts"
    ]);
    expect(contexts.get("services/payments/v1/api/index.ts")).toBe("payments/v1/api");
    expect(contexts.get("services/billing/v1/api/index.ts")).toBe("billing/v1/api");
    expect(contexts.get("v1/api/index.ts")).toBe("v1/api");
    expect(contexts.get("shared/index.ts")).toBe("shared");
  });

  it("labels a root-level file as '/' when colliding with a nested file of the same name", () => {
    const contexts = disambiguateHopContexts(["index.ts", "src/index.ts", "README.md"]);
    expect(contexts.get("index.ts")).toBe("/");
    expect(contexts.get("src/index.ts")).toBe("src");
    expect(contexts.has("README.md")).toBe(false);
  });

  it("ignores repeated occurrences of the exact same file ID", () => {
    const contexts = disambiguateHopContexts(["Hub/App.config", "Hub/App.config"]);
    expect(contexts.size).toBe(0);
  });
});
