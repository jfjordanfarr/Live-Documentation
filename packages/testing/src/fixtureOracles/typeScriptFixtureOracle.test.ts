import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateTypeScriptFixtureGraph,
  mergeOracleEdges,
  partitionOracleSegments,
  serializeOracleEdges,
  type OracleEdge,
  type OracleEdgeRecord,
  type OracleOverrideConfig
} from "./typeScriptFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "typescript"
);

const basicFixtureRoot = path.join(fixturesRoot, "basic");
const layeredFixtureRoot = path.join(fixturesRoot, "layered");

describe("TypeScript fixture oracle", () => {
  it("classifies runtime versus type-only imports in the basic fixture", () => {
    const edges = generateTypeScriptFixtureGraph({ fixtureRoot: basicFixtureRoot });

    expect(edges).toEqual<OracleEdge[]>([
      {
        source: "src/index.ts",
        target: "src/models.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/index.ts",
        target: "src/util.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/models.ts",
        target: "src/types.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/util.ts",
        target: "src/types.ts",
        relation: "imports",
        provenance: "type-import"
      }
    ]);
  });

  it("detects layered type-only edges in the reporting fixture", () => {
    const edges = generateTypeScriptFixtureGraph({ fixtureRoot: layeredFixtureRoot });

    expect(edges).toEqual<OracleEdge[]>([
      {
        source: "src/index.ts",
        target: "src/models/widget.ts",
        relation: "imports",
        provenance: "type-import"
      },
      {
        source: "src/index.ts",
        target: "src/services/reportService.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/repositories/storage.ts",
        target: "src/models/widget.ts",
        relation: "imports",
        provenance: "type-import"
      },
      {
        source: "src/services/dataService.ts",
        target: "src/repositories/storage.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/services/reportService.ts",
        target: "src/models/widget.ts",
        relation: "imports",
        provenance: "type-import"
      },
      {
        source: "src/services/reportService.ts",
        target: "src/services/dataService.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/services/reportService.ts",
        target: "src/utils/format.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/utils/format.ts",
        target: "src/models/widget.ts",
        relation: "imports",
        provenance: "type-import"
      }
    ]);
  });

  it("serialises edges deterministically", () => {
    const sample: OracleEdge[] = [
      {
        source: "b.ts",
        target: "c.ts",
        relation: "uses",
        provenance: "type-import"
      },
      {
        source: "a.ts",
        target: "b.ts",
        relation: "imports",
        provenance: "runtime-import"
      }
    ];

    expect(serializeOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "a.ts",',
        '    "target": "b.ts",',
        '    "relation": "imports"',
        "  },",
        "  {",
        '    "source": "b.ts",',
        '    "target": "c.ts",',
        '    "relation": "uses"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("merges compiler edges with manual overrides", () => {
    const edges: OracleEdge[] = [
      {
        source: "src/index.ts",
        target: "src/util.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/index.ts",
        target: "src/manual.ts",
        relation: "uses",
        provenance: "type-import"
      }
    ];

    const overrides: OracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/index.ts",
          target: "src/manual.ts",
          relation: "uses"
        },
        {
          source: "docs/spec.md",
          target: "src/index.ts",
          relation: "documents"
        }
      ]
    };

    const result = mergeOracleEdges(edges, overrides);

    const toRecord = (source: string, target: string, relation: string): OracleEdgeRecord => ({
      source,
      target,
      relation
    });

    expect(result.autoRecords).toEqual([
      toRecord("src/index.ts", "src/manual.ts", "uses"),
      toRecord("src/index.ts", "src/util.ts", "imports")
    ]);

    expect(result.manualRecords).toEqual([
      toRecord("docs/spec.md", "src/index.ts", "documents"),
      toRecord("src/index.ts", "src/manual.ts", "uses")
    ]);

    expect(result.mergedRecords).toEqual([
      toRecord("docs/spec.md", "src/index.ts", "documents"),
      toRecord("src/index.ts", "src/manual.ts", "uses"),
      toRecord("src/index.ts", "src/util.ts", "imports")
    ]);

    expect(result.missingManualEntries).toEqual([
      {
        source: "docs/spec.md",
        target: "src/index.ts",
        relation: "documents"
      }
    ]);
  });

  it("partitions manual overrides from regenerable edges", () => {
    const edges: OracleEdge[] = [
      {
        source: "src/index.ts",
        target: "src/util.ts",
        relation: "imports",
        provenance: "runtime-import"
      },
      {
        source: "src/index.ts",
        target: "src/manual.ts",
        relation: "uses",
        provenance: "type-import"
      }
    ];

    const overrides: OracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/index.ts",
          target: "src/manual.ts",
          relation: "uses"
        },
        {
          source: "docs/spec.md",
          target: "src/index.ts",
          relation: "documents"
        }
      ]
    };

    const partition = partitionOracleSegments(edges, overrides);

    expect(partition.autoEdges).toEqual([
      {
        source: "src/index.ts",
        target: "src/util.ts",
        relation: "imports",
        provenance: "runtime-import"
      }
    ]);

    expect(partition.matchedManualEdges).toEqual([
      {
        source: "src/index.ts",
        target: "src/manual.ts",
        relation: "uses",
        provenance: "type-import"
      }
    ]);

    expect(partition.manualEntries).toEqual([
      {
        source: "src/index.ts",
        target: "src/manual.ts",
        relation: "uses"
      },
      {
        source: "docs/spec.md",
        target: "src/index.ts",
        relation: "documents"
      }
    ]);

    expect(partition.missingManualEntries).toEqual([
      {
        source: "docs/spec.md",
        target: "src/index.ts",
        relation: "documents"
      }
    ]);
  });
});
