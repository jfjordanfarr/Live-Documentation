import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateCFixtureGraph,
  mergeCOracleEdges,
  partitionCOracleSegments,
  serializeCOracleEdges,
  type CFixtureOracleOptions,
  type COracleEdge,
  type COracleEdgeRecord,
  type COracleOverrideConfig
} from "./cFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "c"
);

const basicsFixtureRoot = path.join(fixturesRoot, "basics");
const modularFixtureRoot = path.join(fixturesRoot, "modular");

function buildOptions(root: string): CFixtureOracleOptions {
  return { fixtureRoot: root };
}

describe("C fixture oracle", () => {
  it("extracts include and call edges for the basics fixture", () => {
    const edges = generateCFixtureGraph(buildOptions(basicsFixtureRoot));

    expect(edges).toEqual<COracleEdge[]>([
      {
        source: "src/main.c",
        target: "src/util.c",
        relation: "references",
        provenance: "function-call"
      },
      {
        source: "src/main.c",
        target: "src/util.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/util.c",
        target: "src/util.h",
        relation: "references",
        provenance: "source-include"
      }
    ]);
  });

  it("recovers multiple call targets across the modular pipeline", () => {
    const edges = generateCFixtureGraph(buildOptions(modularFixtureRoot));

    expect(edges).toEqual<COracleEdge[]>([
      {
        source: "src/logger.c",
        target: "src/logger.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/main.c",
        target: "src/logger.c",
        relation: "references",
        provenance: "function-call"
      },
      {
        source: "src/main.c",
        target: "src/logger.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/main.c",
        target: "src/pipeline.c",
        relation: "references",
        provenance: "function-call"
      },
      {
        source: "src/main.c",
        target: "src/pipeline.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/metrics.c",
        target: "src/metrics.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/pipeline.c",
        target: "src/logger.c",
        relation: "references",
        provenance: "function-call"
      },
      {
        source: "src/pipeline.c",
        target: "src/logger.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/pipeline.c",
        target: "src/metrics.c",
        relation: "references",
        provenance: "function-call"
      },
      {
        source: "src/pipeline.c",
        target: "src/metrics.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/pipeline.c",
        target: "src/pipeline.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/pipeline.h",
        target: "src/metrics.h",
        relation: "references",
        provenance: "source-include"
      }
    ]);
  });

  it("serialises edges in a stable order", () => {
    const sample: COracleEdge[] = [
      {
        source: "c.c",
        target: "d.c",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "a.c",
        target: "b.c",
        relation: "references",
        provenance: "function-call"
      }
    ];

    expect(serializeCOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "a.c",',
        '    "target": "b.c",',
        '    "relation": "references"',
        "  },",
        "  {",
        '    "source": "c.c",',
        '    "target": "d.c",',
        '    "relation": "references"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("matches and merges manual overrides", () => {
    const edges: COracleEdge[] = [
      {
        source: "src/source.c",
        target: "src/header.h",
        relation: "references",
        provenance: "source-include"
      },
      {
        source: "src/source.c",
        target: "src/runtime.c",
        relation: "references",
        provenance: "function-call"
      }
    ];

    const overrides: COracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/source.c",
          target: "src/manual.c",
          relation: "references"
        },
        {
          source: "src/source.c",
          target: "src/runtime.c",
          relation: "references"
        }
      ]
    };

    const partition = partitionCOracleSegments(edges, overrides);
    expect(partition.autoEdges).toEqual([edges[0]]);
    expect(partition.matchedManualEdges).toEqual([edges[1]]);
    expect(partition.missingManualEntries).toEqual([{
      source: "src/source.c",
      target: "src/manual.c",
      relation: "references"
    }]);

    const result = mergeCOracleEdges(edges, overrides);
    const toRecord = (source: string, target: string, relation: string): COracleEdgeRecord => ({
      source,
      target,
      relation
    });

    expect(result.autoRecords).toEqual([
      toRecord("src/source.c", "src/header.h", "references"),
      toRecord("src/source.c", "src/runtime.c", "references")
    ]);

    expect(result.manualRecords).toEqual([
      toRecord("src/source.c", "src/manual.c", "references"),
      toRecord("src/source.c", "src/runtime.c", "references")
    ]);

    expect(result.mergedRecords).toEqual([
      toRecord("src/source.c", "src/header.h", "references"),
      toRecord("src/source.c", "src/manual.c", "references"),
      toRecord("src/source.c", "src/runtime.c", "references")
    ]);

    expect(result.missingManualEntries).toEqual([
      {
        source: "src/source.c",
        target: "src/manual.c",
        relation: "references"
      }
    ]);
  });
});
