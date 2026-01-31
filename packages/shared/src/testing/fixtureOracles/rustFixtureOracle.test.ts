import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateRustFixtureGraph,
  mergeRustOracleEdges,
  partitionRustOracleSegments,
  serializeRustOracleEdges,
  type RustFixtureOracleOptions,
  type RustOracleEdge,
  type RustOracleEdgeRecord,
  type RustOracleOverrideConfig
} from "./rustFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "rust"
);

function buildOptions(fixtureName: string): RustFixtureOracleOptions {
  return { fixtureRoot: path.join(fixturesRoot, fixtureName) };
}

describe("Rust fixture oracle", () => {
  it("recovers module and import edges for the basics crate", () => {
    const edges = generateRustFixtureGraph(buildOptions("basics"));

    expect(edges).toEqual<RustOracleEdge[]>([
      {
        source: "src/main.rs",
        target: "src/math.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/main.rs",
        target: "src/utils.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/math.rs",
        target: "src/utils.rs",
        relation: "references",
        provenance: "use-statement"
      }
    ]);
  });

  it("collects layered edges across the analytics crate", () => {
    const edges = generateRustFixtureGraph(buildOptions("analytics"));

    // The analytics crate has 4 mod declarations in main.rs (analytics, io, metrics, models)
    // plus internal use-statement edges between the modules
    expect(edges).toEqual<RustOracleEdge[]>([
      {
        source: "src/analytics.rs",
        target: "src/metrics.rs",
        relation: "references",
        provenance: "use-statement"
      },
      {
        source: "src/analytics.rs",
        target: "src/models.rs",
        relation: "references",
        provenance: "use-statement"
      },
      {
        source: "src/io.rs",
        target: "src/models.rs",
        relation: "references",
        provenance: "use-statement"
      },
      {
        source: "src/main.rs",
        target: "src/analytics.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/main.rs",
        target: "src/io.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/main.rs",
        target: "src/metrics.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/main.rs",
        target: "src/models.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/metrics.rs",
        target: "src/models.rs",
        relation: "references",
        provenance: "use-statement"
      }
    ]);
  });

  it("serialises edges deterministically", () => {
    const sample: RustOracleEdge[] = [
      {
        source: "src/b.rs",
        target: "src/c.rs",
        relation: "references",
        provenance: "module-declaration"
      },
      {
        source: "src/a.rs",
        target: "src/b.rs",
        relation: "references",
        provenance: "use-statement"
      }
    ];

    expect(serializeRustOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "src/a.rs",',
        '    "target": "src/b.rs",',
        '    "relation": "references"',
        "  },",
        "  {",
        '    "source": "src/b.rs",',
        '    "target": "src/c.rs",',
        '    "relation": "references"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("merges override entries", () => {
    const edges: RustOracleEdge[] = [
      {
        source: "src/lib.rs",
        target: "src/macros.rs",
        relation: "references",
        provenance: "use-statement"
      }
    ];

    const overrides: RustOracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/lib.rs",
          target: "src/runtime.rs",
          relation: "references"
        }
      ]
    };

    const partition = partitionRustOracleSegments(edges, overrides);
    expect(partition.autoEdges).toEqual([edges[0]]);
    expect(partition.matchedManualEdges).toEqual([]);
    expect(partition.missingManualEntries).toEqual([
      {
        source: "src/lib.rs",
        target: "src/runtime.rs",
        relation: "references"
      }
    ]);

    const result = mergeRustOracleEdges(edges, overrides);
    const toRecord = (
      source: string,
      target: string,
      relation: string
    ): RustOracleEdgeRecord => ({ source, target, relation });

    expect(result.autoRecords).toEqual([
      toRecord("src/lib.rs", "src/macros.rs", "references")
    ]);
    expect(result.manualRecords).toEqual([
      toRecord("src/lib.rs", "src/runtime.rs", "references")
    ]);
    expect(result.mergedRecords).toEqual([
      toRecord("src/lib.rs", "src/macros.rs", "references"),
      toRecord("src/lib.rs", "src/runtime.rs", "references")
    ]);
  });
});
