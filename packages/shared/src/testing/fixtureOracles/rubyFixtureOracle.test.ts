import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  generateRubyFixtureGraph,
  mergeRubyOracleEdges,
  partitionRubyOracleSegments,
  serializeRubyOracleEdges,
  type RubyFixtureOracleOptions,
  type RubyOracleEdge,
  type RubyOracleEdgeRecord,
  type RubyOracleOverrideConfig
} from "./rubyFixtureOracle";

const repoRoot = path.resolve(__dirname, "../../../../../");
const fixturesRoot = path.join(
  repoRoot,
  "tests",
  "integration",
  "benchmarks",
  "fixtures",
  "ruby"
);

function buildOptions(fixtureName: string): RubyFixtureOracleOptions {
  return { fixtureRoot: path.join(fixturesRoot, fixtureName) };
}

describe("Ruby fixture oracle", () => {
  it("captures require relationships for the basic fixture", () => {
    const edges = generateRubyFixtureGraph(buildOptions("basic"));

    expect(edges).toEqual<RubyOracleEdge[]>([
      {
        source: "lib/formatter.rb",
        target: "lib/templates.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/main.rb",
        target: "lib/data_store.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/main.rb",
        target: "lib/reporter.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/reporter.rb",
        target: "lib/data_store.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/reporter.rb",
        target: "lib/formatter.rb",
        relation: "references",
        provenance: "require"
      }
    ]);
  });

  it("captures nested requires for the CLI fixture", () => {
    const edges = generateRubyFixtureGraph(buildOptions("cli"));

    expect(edges).toEqual<RubyOracleEdge[]>([
      {
        source: "lib/cli.rb",
        target: "lib/commands/report.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/cli.rb",
        target: "lib/support/logger.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/commands/report.rb",
        target: "lib/services/analyzer.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/commands/report.rb",
        target: "lib/services/data_loader.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/services/analyzer.rb",
        target: "lib/services/cache.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/services/analyzer.rb",
        target: "lib/support/logger.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/services/data_loader.rb",
        target: "lib/support/logger.rb",
        relation: "references",
        provenance: "require"
      }
    ]);
  });

  it("serialises edges deterministically", () => {
    const sample: RubyOracleEdge[] = [
      {
        source: "lib/b.rb",
        target: "lib/c.rb",
        relation: "references",
        provenance: "require"
      },
      {
        source: "lib/a.rb",
        target: "lib/b.rb",
        relation: "references",
        provenance: "require"
      }
    ];

    expect(serializeRubyOracleEdges(sample)).toBe(
      [
        "[",
        "  {",
        '    "source": "lib/a.rb",',
        '    "target": "lib/b.rb",',
        '    "relation": "references"',
        "  },",
        "  {",
        '    "source": "lib/b.rb",',
        '    "target": "lib/c.rb",',
        '    "relation": "references"',
        "  }",
        "]\n"
      ].join("\n")
    );
  });

  it("merges manual overrides", () => {
    const edges: RubyOracleEdge[] = [
      {
        source: "lib/app.rb",
        target: "lib/runtime.rb",
        relation: "references",
        provenance: "require"
      }
    ];

    const overrides: RubyOracleOverrideConfig = {
      manualEdges: [
        {
          source: "lib/app.rb",
          target: "lib/bridge.rb",
          relation: "references"
        }
      ]
    };

    const partition = partitionRubyOracleSegments(edges, overrides);
    expect(partition.autoEdges).toEqual([edges[0]]);
    expect(partition.matchedManualEdges).toEqual([]);
    expect(partition.missingManualEntries).toEqual([
      {
        source: "lib/app.rb",
        target: "lib/bridge.rb",
        relation: "references"
      }
    ]);

    const result = mergeRubyOracleEdges(edges, overrides);
    const toRecord = (
      source: string,
      target: string,
      relation: string
    ): RubyOracleEdgeRecord => ({ source, target, relation });

    expect(result.autoRecords).toEqual([
      toRecord("lib/app.rb", "lib/runtime.rb", "references")
    ]);
    expect(result.manualRecords).toEqual([
      toRecord("lib/app.rb", "lib/bridge.rb", "references")
    ]);
    expect(result.mergedRecords).toEqual([
      toRecord("lib/app.rb", "lib/bridge.rb", "references"),
      toRecord("lib/app.rb", "lib/runtime.rb", "references")
    ]);
  });
});
