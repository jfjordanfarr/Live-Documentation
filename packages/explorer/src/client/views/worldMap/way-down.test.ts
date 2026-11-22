import { describe, expect, it } from "vitest";

import type { WorldRoad } from "./model";
import { WAY_DOWN_CARDS, heldFiles, wireEndsOf, wireFilesOf } from "./way-down";

/** A wire as the board's join gives it: who calls or stands on whom, and the file-level edges behind it, caller first. */
function road(from: string, to: string, kind: WorldRoad["kind"], lines: Array<[string, string]>): WorldRoad {
  return { id: `${from}>${to}:${kind}`, from, to, kind, basis: kind === "call" ? "contract" : "source", count: lines.length, lines: lines.map(([a, b]) => ({ from: a, to: b, label: "" })) };
}

// The estate's hub as the join reads it: called by the gateway and calling the payment service through one
// configuration file, and standing on the shared contracts through three files.
const estate = {
  roads: [
    road("gateway", "contracts", "stands", [["Gateway/Wcf/HubProxy.cs", "Contracts/IPaymentHub.cs"]]),
    road("gateway", "hub", "call", [["Gateway/Web.config", "Hub/App.config"]]),
    road("hub", "contracts", "stands", [
      ["Hub/App.config", "Contracts/IPaymentHub.cs"],
      ["Hub/Hub.csproj", "Contracts/Contracts.csproj"],
      ["Hub/PaymentHub.cs", "Contracts/IPaymentHub.cs"],
      ["Hub/PaymentHub.cs", "Contracts/PaymentQuery.cs"],
      ["Hub/PaymentHub.cs", "Contracts/PaymentRequest.cs"]
    ]),
    road("hub", "payments", "call", [["Hub/App.config", "PaymentService/App.config"]]),
    road("portal", "gateway", "call", [["Portal/Services/GatewayClient.cs", "Gateway/Controllers/PaymentsController.cs"]]),
    road("action", "hub", "call", [])
  ]
};

describe("the files that carry a thing's wires", () => {
  it("are the thing's own ends of its calls: what it serves and what it calls with, each once", () => {
    // Hub/App.config both serves the gateway's call and makes the call to the payment service: one file, named once.
    // What the hub stands on, the contracts, is not a call and brings no file while a call does.
    expect(wireFilesOf(estate, "hub")).toEqual(["Hub/App.config"]);
  });

  it("never name a file of another thing", () => {
    for (const thing of ["hub", "gateway", "portal", "contracts", "payments"]) {
      const folder = { hub: "Hub/", gateway: "Gateway/", portal: "Portal/", contracts: "Contracts/", payments: "PaymentService/" }[thing]!;
      expect(wireFilesOf(estate, thing).filter((file) => !file.startsWith(folder)), thing).toEqual([]);
    }
  });

  it("take one file for each wire before a second for any", () => {
    // The gateway: its call to the hub, then the portal's call that it serves.
    expect(wireFilesOf(estate, "gateway")).toEqual(["Gateway/Web.config", "Gateway/Controllers/PaymentsController.cs"]);
    // A thing with two files on one wire and one on another takes the other wire's file before the first's second.
    const two = { roads: [road("a", "b", "call", [["a/one.cs", "b/x.cs"], ["a/one.cs", "b/y.cs"], ["a/two.cs", "b/x.cs"]]), road("c", "a", "call", [["c/z.cs", "a/three.cs"]])] };
    expect(wireFilesOf(two, "a")).toEqual(["a/one.cs", "a/three.cs", "a/two.cs"]);
  });

  it("are, for a thing no call touches, the files others stand on and the files that stand on others'", () => {
    // Within a wire the file behind most of its edges comes first: PaymentHub.cs carries three of the five.
    const stands = { roads: [estate.roads[2]] };
    expect(wireFilesOf(stands, "hub")).toEqual(["Hub/PaymentHub.cs", "Hub/App.config", "Hub/Hub.csproj"]);
    // The contracts serve two things, both first through the same file, which is named once.
    expect(wireFilesOf(estate, "contracts")).toEqual(["Contracts/IPaymentHub.cs", "Contracts/Contracts.csproj", "Contracts/PaymentQuery.cs", "Contracts/PaymentRequest.cs"]);
  });

  it("are none for a thing whose wires are only declared, or that has none", () => {
    expect(wireFilesOf(estate, "action")).toEqual([]);
    expect(wireFilesOf(estate, "oracle")).toEqual([]);
  });
});

describe("the files at a wire's two ends", () => {
  it("are the file that calls and the file that serves, pair by pair, each once", () => {
    expect(wireEndsOf(estate.roads[1])).toEqual(["Gateway/Web.config", "Hub/App.config"]);
    expect(wireEndsOf(estate.roads[2])).toEqual([
      "Hub/App.config", "Contracts/IPaymentHub.cs", "Hub/Hub.csproj", "Contracts/Contracts.csproj", "Hub/PaymentHub.cs", "Contracts/PaymentQuery.cs", "Contracts/PaymentRequest.cs"
    ]);
    expect(wireEndsOf(estate.roads[5])).toEqual([]);
  });
});

describe("what one way down pins", () => {
  // Each file's neighbours: the files a line joins to it, which the Local Map draws beside it once it is pinned.
  const neighbours: Record<string, string[]> = {
    light: ["n1", "n2"],
    shared: ["n2", "n3"],
    hub: Array.from({ length: 30 }, (_, index) => `h${index}`),
    late: ["n4"]
  };
  const of = (file: string): string[] => neighbours[file] ?? [];

  it("is every file where the cards they bring are few", () => {
    expect(heldFiles(["light", "shared"], of)).toEqual({ files: ["light", "shared"], total: 2 });
    expect(heldFiles([], of)).toEqual({ files: [], total: 0 });
  });

  it("counts the cards a file brings, itself and its neighbours, each once", () => {
    // light, n1, n2; then shared and n3, n2 being there already: five cards.
    expect(heldFiles(["light", "shared", "late"], of, 0, 5).files).toEqual(["light", "shared"]);
    expect(heldFiles(["light", "shared", "late"], of, 0, 7).files).toEqual(["light", "shared", "late"]);
  });

  it("passes over a file that would overrun the picture for the next that fits, and says how many there were", () => {
    const held = heldFiles(["light", "hub", "late"], of);
    expect(held.files).toEqual(["light", "late"]);
    expect(held.total).toBe(3);
    expect(WAY_DOWN_CARDS).toBeLessThan(31);
  });

  it("passes over a much-used first file too, and pins it alone only where nothing fits, so that no way down arrives with nothing", () => {
    // Pinned first whatever it brought, this repository's engine opened with one file of forty-six and forty-three cards.
    expect(heldFiles(["hub", "light"], of).files).toEqual(["light"]);
    expect(heldFiles(["hub"], of)).toEqual({ files: ["hub"], total: 1 });
    expect(heldFiles(["hub", "light"], of, 0, 2).files).toEqual(["hub"]);
  });

  it("pins a wire's first two whatever they bring: the file that calls and the file that serves", () => {
    expect(heldFiles(["hub", "shared", "light"], of, 2).files).toEqual(["hub", "shared"]);
  });
});
