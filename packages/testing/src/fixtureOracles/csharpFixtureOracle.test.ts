import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateCSharpFixtureGraph,
  mergeCSharpOracleEdges,
  partitionCSharpOracleSegments,
  serializeCSharpOracleEdges,
  type CSharpFixtureOracleOptions,
  type CSharpOracleEdge,
  type CSharpOracleEdgeRecord,
  type CSharpOracleOverrideConfig
} from "./csharpFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "csharp"
);

function buildOptions(fixtureName: string): CSharpFixtureOracleOptions {
  return { fixtureRoot: path.join(fixturesRoot, fixtureName) } satisfies CSharpFixtureOracleOptions;
}

describe("C# fixture oracle", () => {
  it("captures type usage across the basic diagnostics sample", () => {
    const edges = generateCSharpFixtureGraph(buildOptions("basic"));

    expect(edges).toEqual<CSharpOracleEdge[]>([
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Data/Repository.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Models/FormattedReport.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Models/Formatter.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Models/Record.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Services/ReportService.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Data/Repository.cs",
        target: "src/Diagnostics/Models/Record.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Models/FormattedReport.cs",
        target: "src/Diagnostics/Models/Record.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Models/Formatter.cs",
        target: "src/Diagnostics/Models/FormattedReport.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Models/Formatter.cs",
        target: "src/Diagnostics/Models/Record.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Services/ReportService.cs",
        target: "src/Diagnostics/Data/Repository.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Services/ReportService.cs",
        target: "src/Diagnostics/Models/FormattedReport.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Services/ReportService.cs",
        target: "src/Diagnostics/Models/Formatter.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/Services/ReportService.cs",
        target: "src/Diagnostics/Models/Record.cs",
        relation: "uses",
        provenance: "type-usage"
      }
    ]);
  });

  it("serialises edges deterministically", () => {
    const sample: CSharpOracleEdge[] = [
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Models/Formatter.cs",
        relation: "uses",
        provenance: "type-usage"
      },
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Services/ReportService.cs",
        relation: "uses",
        provenance: "type-usage"
      }
    ];

    expect(serializeCSharpOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "src/Diagnostics/App.cs",',
        '    "target": "src/Diagnostics/Models/Formatter.cs",',
        '    "relation": "uses"',
        "  },",
        "  {",
        '    "source": "src/Diagnostics/App.cs",',
        '    "target": "src/Diagnostics/Services/ReportService.cs",',
        '    "relation": "uses"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("merges manual overrides when supplied", () => {
    const edges: CSharpOracleEdge[] = [
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/Services/ReportService.cs",
        relation: "uses",
        provenance: "type-usage"
      }
    ];

    const overrides: CSharpOracleOverrideConfig = {
      manualEdges: [
        {
          source: "src/Diagnostics/App.cs",
          target: "src/Diagnostics/DiagnosticsHost.cs",
          relation: "imports"
        }
      ]
    };

    const partition = partitionCSharpOracleSegments(edges, overrides);
    expect(partition.autoEdges).toEqual([edges[0]]);
    expect(partition.matchedManualEdges).toEqual([]);
    expect(partition.missingManualEntries).toEqual([
      {
        source: "src/Diagnostics/App.cs",
        target: "src/Diagnostics/DiagnosticsHost.cs",
        relation: "imports"
      }
    ]);

    const result = mergeCSharpOracleEdges(edges, overrides);
    const toRecord = (
      source: string,
      target: string,
      relation: string
    ): CSharpOracleEdgeRecord => ({ source, target, relation });

    expect(result.autoRecords).toEqual([
      toRecord(
        "src/Diagnostics/App.cs",
        "src/Diagnostics/Services/ReportService.cs",
        "uses"
      )
    ]);

    expect(result.manualRecords).toEqual([
      toRecord(
        "src/Diagnostics/App.cs",
        "src/Diagnostics/DiagnosticsHost.cs",
        "imports"
      )
    ]);

    expect(result.mergedRecords).toEqual([
      toRecord(
        "src/Diagnostics/App.cs",
        "src/Diagnostics/DiagnosticsHost.cs",
        "imports"
      ),
      toRecord(
        "src/Diagnostics/App.cs",
        "src/Diagnostics/Services/ReportService.cs",
        "uses"
      )
    ]);
  });
});
