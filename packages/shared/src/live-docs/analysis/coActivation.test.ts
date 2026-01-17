import { describe, expect, it } from "vitest";

import { LIVE_DOCUMENTATION_FILE_EXTENSION } from "../../config/liveDocumentationConfig";
import { buildCoActivationReport } from "./coActivation";
import type { Stage0Doc, TargetManifest } from "../types";

function makeDoc(options: {
  sourcePath: string;
  dependencies?: string[];
  archetype?: string;
}): Stage0Doc {
  const docPath = `${options.sourcePath}${LIVE_DOCUMENTATION_FILE_EXTENSION}`;
  return {
    sourcePath: options.sourcePath,
    docAbsolutePath: `/abs/${docPath}`,
    docRelativePath: docPath,
    archetype: options.archetype ?? "implementation",
    dependencies: options.dependencies ?? [],
    externalModules: [],
    publicSymbols: []
  };
}

describe("buildCoActivationReport", () => {
  it("connects documents that reference each other via dependencies", () => {
    const docs: Stage0Doc[] = [
      makeDoc({ sourcePath: "packages/a.ts", dependencies: ["packages/b.ts"] }),
      makeDoc({ sourcePath: "packages/b.ts" })
    ];

    const report = buildCoActivationReport({
      stage0Docs: docs,
      now: () => new Date("2025-01-01T00:00:00.000Z")
    });

    expect(report.generatedAt).toBe("2025-01-01T00:00:00.000Z");
    expect(report.metrics).toMatchObject({
      nodeCount: 2,
      edgeCount: 1,
      significantEdgeCount: 1,
      clusterCount: 1,
      significantClusterCount: 0,
      dependencyWeight: 1,
      testWeight: 1,
      minWeight: 0,
      edgeAlpha: 0.01,
      clusterAlpha: 0.01,
      totalTests: 0
    });
    expect(report.edges).toEqual([
      {
        source: "packages/a.ts",
        target: "packages/b.ts",
        weight: 1,
        dependencySources: ["packages/a.ts"],
        testSources: [],
        sharedTestCount: 0,
        sourceTestCount: 0,
        targetTestCount: 0,
        pValue: null,
        qValue: null,
        isSignificant: true
      }
    ]);

    expect(report.nodes).toEqual([
      {
        id: "packages/a.ts",
        docRelativePath: `packages/a.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`,
        archetype: "implementation",
        degree: 1,
        strength: 1,
        testCount: 0,
        zScore: 0
      },
      {
        id: "packages/b.ts",
        docRelativePath: `packages/b.ts${LIVE_DOCUMENTATION_FILE_EXTENSION}`,
        archetype: "implementation",
        degree: 1,
        strength: 1,
        testCount: 0,
        zScore: 0
      }
    ]);

    expect(report.clusters).toEqual([
      {
        id: "cluster-001",
        members: ["packages/a.ts", "packages/b.ts"],
        weight: 1,
        edgeCount: 1,
        expectedEdgeCount: 0.5,  // Degree-corrected: deg(a)*deg(b)/(2*E) = 1*1/(2*1) = 0.5
        density: 1,
        pValue: expect.closeTo(0.3935, 2),  // Poisson p-value for observing 1 edge when expecting 0.5
        qValue: expect.closeTo(0.3935, 2),  // Single test so q = p
        isSignificant: false
      }
    ]);
  });

  it("adds co-activation weight for tests that exercise the same targets", () => {
    const docs: Stage0Doc[] = [
      makeDoc({ sourcePath: "packages/a.ts" }),
      makeDoc({ sourcePath: "packages/b.ts" }),
      makeDoc({ sourcePath: "packages/c.ts" })
    ];

    const manifest: TargetManifest = {
      suites: [
        {
          suite: "unit",
          tests: [
            {
              path: "tests/foo.test.ts",
              targets: ["packages/a.ts", "packages/b.ts", "packages/a.ts"]
            }
          ]
        }
      ]
    };

    const report = buildCoActivationReport({
      stage0Docs: docs,
      manifest,
      now: () => new Date("2025-01-01T00:00:00.000Z")
    });

    expect(report.edges).toEqual([
      {
        source: "packages/a.ts",
        target: "packages/b.ts",
        weight: 1,
        dependencySources: [],
        testSources: ["tests/foo.test.ts"],
        sharedTestCount: 1,
        sourceTestCount: 1,
        targetTestCount: 1,
        pValue: 1,
        qValue: 1,
        isSignificant: false
      }
    ]);

    const nodeA = report.nodes.find((node) => node.id === "packages/a.ts");
    const nodeB = report.nodes.find((node) => node.id === "packages/b.ts");
    const nodeC = report.nodes.find((node) => node.id === "packages/c.ts");

    expect(nodeA).toMatchObject({ degree: 0, strength: 0, testCount: 1 });
    expect(nodeB).toMatchObject({ degree: 0, strength: 0, testCount: 1 });
    expect(nodeC).toMatchObject({ degree: 0, strength: 0, testCount: 0 });
  });

  it("applies weight thresholds combining dependency and test signals", () => {
    const docs: Stage0Doc[] = [
      makeDoc({ sourcePath: "packages/a.ts", dependencies: ["packages/b.ts"] }),
      makeDoc({ sourcePath: "packages/b.ts" })
    ];

    const manifest: TargetManifest = {
      suites: [
        {
          suite: "unit",
          tests: [
            {
              path: "tests/foo.test.ts",
              targets: ["packages/a.ts", "packages/b.ts"]
            }
          ]
        }
      ]
    };

    const report = buildCoActivationReport({
      stage0Docs: docs,
      manifest,
      dependencyWeight: 1,
      testWeight: 1,
      minWeight: 2,
      now: () => new Date("2025-01-01T00:00:00.000Z")
    });

    expect(report.edges).toEqual([
      {
        source: "packages/a.ts",
        target: "packages/b.ts",
        weight: 2,
        dependencySources: ["packages/a.ts"],
        testSources: ["tests/foo.test.ts"],
        sharedTestCount: 1,
        sourceTestCount: 1,
        targetTestCount: 1,
        pValue: 1,
        qValue: 1,
        isSignificant: true
      }
    ]);
  });
});
