import { describe, expect, it } from "vitest";

import { settledEdges } from "./compare";

/**
 * scip-dotnet's record of the `names` fixture (`tests/integration/programs/csharp/names`): its symbols carry no arity,
 * so `Lib.Helper` and `Lib.Helper<T>` are one symbol, `Lib/Helper#`, and the projects' references leave it to two
 * files. The C# compiler binds the alias `H = Lib.Helper` to `Helper.cs` alone.
 */
const NAMES = {
  edges: [
    { from: "App/Derived.cs", to: "App/Base.cs", symbols: ["App/Base#", "App/Base#Options#"] },
    { from: "App/Use.cs", to: "App/Helper.cs", symbols: ["Lib/Helper#"] },
    { from: "App/Use.cs", to: "App/HelperOfT.cs", symbols: ["Lib/Helper#"] }
  ],
  ambiguous: [{ from: "App/Use.cs", symbol: "Lib/Helper#", candidates: ["App/Helper.cs", "App/HelperOfT.cs"] }]
};

describe("the compiler's edges an ambiguous symbol leaves unsettled", () => {
  it("counts an edge resting only on an ambiguous symbol neither found nor missing", () => {
    const { settled, ambiguous } = settledEdges(NAMES);
    expect(settled.map((edge) => `${edge.from} → ${edge.to}`)).toEqual(["App/Derived.cs → App/Base.cs"]);
    expect(ambiguous.map((edge) => `${edge.from} → ${edge.to}`)).toEqual(["App/Use.cs → App/Helper.cs", "App/Use.cs → App/HelperOfT.cs"]);
  });

  it("keeps an edge that also rests on a symbol only one file defines", () => {
    const record = {
      edges:     [{ from: "App/Use.cs", to: "App/Helper.cs", symbols: ["Lib/Helper#", "Lib/Helper#Make()."] }],
      ambiguous: NAMES.ambiguous
    };
    expect(settledEdges(record).settled).toEqual(record.edges);
  });

  it("reads an ambiguity as the referencing file's own", () => {
    const record = {
      edges:     [{ from: "App/Other.cs", to: "App/Helper.cs", symbols: ["Lib/Helper#"] }],
      ambiguous: NAMES.ambiguous
    };
    expect(settledEdges(record).settled).toEqual(record.edges);
  });
});
