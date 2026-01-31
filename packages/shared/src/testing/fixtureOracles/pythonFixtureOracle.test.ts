import { describe, expect, it } from "vitest";

import {
  mergePythonOracleEdges,
  partitionPythonOracleSegments,
  serializePythonOracleEdges,
  type PythonOracleEdge,
  type PythonOracleOverrideConfig
} from "./pythonFixtureOracle";

describe("pythonFixtureOracle", () => {
  const sampleEdges: PythonOracleEdge[] = [
    {
      source: "src/main.py",
      target: "src/helpers.py",
      relation: "references",
      provenance: "module-import"
    },
    {
      source: "src/main.py",
      target: "src/util.py",
      relation: "references",
      provenance: "module-import"
    },
    {
      source: "src/util.py",
      target: "src/helpers.py",
      relation: "references",
      provenance: "module-import"
    }
  ];

  const overrideConfig: PythonOracleOverrideConfig = {
    manualEdges: [
      {
        source: "src/main.py",
        target: "src/util.py",
        relation: "references"
      },
      {
        source: "src/main.py",
        target: "src/manual.py",
        relation: "references"
      },
      {
        source: "src/missing.py",
        target: "src/helpers.py",
        relation: "references"
      }
    ]
  };

  it("partitions oracle segments and flags missing overrides", () => {
    const partition = partitionPythonOracleSegments(sampleEdges, overrideConfig);
    expect(partition.autoEdges).toHaveLength(2);
    expect(partition.matchedManualEdges).toHaveLength(1);
    expect(partition.manualEntries).toHaveLength(3);
    expect(partition.missingManualEntries).toEqual([
      {
        source: "src/main.py",
        target: "src/manual.py",
        relation: "references"
      },
      {
        source: "src/missing.py",
        target: "src/helpers.py",
        relation: "references"
      }
    ]);
  });

  it("merges automatic and manual records with deterministic ordering", () => {
    const merge = mergePythonOracleEdges(sampleEdges, overrideConfig);

    expect(merge.autoRecords).toHaveLength(3);
    expect(merge.manualRecords).toHaveLength(3);
    expect(merge.matchedManualRecords).toHaveLength(1);
    expect(merge.missingManualEntries).toEqual([
      {
        source: "src/main.py",
        target: "src/manual.py",
        relation: "references"
      },
      {
        source: "src/missing.py",
        target: "src/helpers.py",
        relation: "references"
      }
    ]);

    expect(merge.mergedRecords).toEqual([
      {
        source: "src/main.py",
        target: "src/helpers.py",
        relation: "references"
      },
      {
        source: "src/main.py",
        target: "src/manual.py",
        relation: "references"
      },
      {
        source: "src/main.py",
        target: "src/util.py",
        relation: "references"
      },
      {
        source: "src/missing.py",
        target: "src/helpers.py",
        relation: "references"
      },
      {
        source: "src/util.py",
        target: "src/helpers.py",
        relation: "references"
      }
    ]);
  });

  it("serializes edges with newline termination and lexical ordering", () => {
    const serialized = serializePythonOracleEdges(sampleEdges);
    const parsed = JSON.parse(serialized) as Array<{
      source: string;
      target: string;
      relation: string;
    }>;

    expect(serialized.endsWith("\n")).toBe(true);
    expect(parsed).toEqual([
      {
        source: "src/main.py",
        target: "src/helpers.py",
        relation: "references"
      },
      {
        source: "src/main.py",
        target: "src/util.py",
        relation: "references"
      },
      {
        source: "src/util.py",
        target: "src/helpers.py",
        relation: "references"
      }
    ]);
  });
});
