import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateJavaFixtureGraph,
  mergeJavaOracleEdges,
  partitionJavaOracleSegments,
  serializeJavaOracleEdges,
  type JavaFixtureOracleOptions,
  type JavaOracleEdge,
  type JavaOracleEdgeRecord,
  type JavaOracleOverrideConfig
} from "./javaFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "java"
);

function buildOptions(fixtureName: string): JavaFixtureOracleOptions {
  return { fixtureRoot: path.join(fixturesRoot, fixtureName) };
}

describe("Java fixture oracle", () => {
  it("captures imports across the basic reporting app", () => {
    const edges = generateJavaFixtureGraph(buildOptions("basic"));

    expect(edges).toEqual<JavaOracleEdge[]>([
      {
        source: "src/com/example/app/App.java",
        target: "src/com/example/data/Reader.java",
        relation: "imports",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/app/App.java",
        target: "src/com/example/format/ReportWriter.java",
        relation: "imports",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/app/App.java",
        target: "src/com/example/model/Record.java",
        relation: "uses",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/data/Reader.java",
        target: "src/com/example/model/Record.java",
        relation: "uses",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/format/ReportWriter.java",
        target: "src/com/example/data/Catalog.java",
        relation: "imports",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/format/ReportWriter.java",
        target: "src/com/example/model/Record.java",
        relation: "uses",
        provenance: "import-statement"
      }
    ]);
  });

  it("serialises edges deterministically", () => {
    const sample: JavaOracleEdge[] = [
      {
        source: "src/com/example/a/A.java",
        target: "src/com/example/b/B.java",
        relation: "imports",
        provenance: "import-statement"
      },
      {
        source: "src/com/example/a/A.java",
        target: "src/com/example/c/C.java",
        relation: "uses",
        provenance: "import-statement"
      }
    ];

    expect(serializeJavaOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "src/com/example/a/A.java",',
        '    "target": "src/com/example/b/B.java",',
        '    "relation": "imports"',
        "  },",
        "  {",
        '    "source": "src/com/example/a/A.java",',
        '    "target": "src/com/example/c/C.java",',
        '    "relation": "uses"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("merges override entries", () => {
    const edges: JavaOracleEdge[] = [
      {
        source: "src/com/example/App.java",
        target: "src/com/example/runtime/Bootstrap.java",
        relation: "imports",
        provenance: "import-statement"
      }
    ];

    const overrides: JavaOracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/com/example/App.java",
          target: "src/com/example/plugins/Registry.java",
          relation: "uses"
        }
      ]
    };

    const partition = partitionJavaOracleSegments(edges, overrides);
    expect(partition.autoEdges).toEqual([edges[0]]);
    expect(partition.matchedManualEdges).toEqual([]);
    expect(partition.missingManualEntries).toEqual([
      {
        source: "src/com/example/App.java",
        target: "src/com/example/plugins/Registry.java",
        relation: "uses"
      }
    ]);

    const result = mergeJavaOracleEdges(edges, overrides);
    const toRecord = (
      source: string,
      target: string,
      relation: string
    ): JavaOracleEdgeRecord => ({ source, target, relation });

    expect(result.autoRecords).toEqual([
      toRecord(
        "src/com/example/App.java",
        "src/com/example/runtime/Bootstrap.java",
        "imports"
      )
    ]);
    expect(result.manualRecords).toEqual([
      toRecord(
        "src/com/example/App.java",
        "src/com/example/plugins/Registry.java",
        "uses"
      )
    ]);
    expect(result.mergedRecords).toEqual([
      toRecord(
        "src/com/example/App.java",
        "src/com/example/plugins/Registry.java",
        "uses"
      ),
      toRecord(
        "src/com/example/App.java",
        "src/com/example/runtime/Bootstrap.java",
        "imports"
      )
    ]);
  });
});
