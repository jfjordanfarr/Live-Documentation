import { describe, expect, it } from "vitest";

import { extractExtensionSettings, extractTestModeOverrides } from "./settings";

describe("extractExtensionSettings", () => {
  it("returns undefined when source is not an object", () => {
    expect(extractExtensionSettings(null)).toBeUndefined();
    expect(extractExtensionSettings(42)).toBeUndefined();
  });

  it("parses nested settings structure", () => {
    const result = extractExtensionSettings({
      settings: {
        linkAwareDiagnostics: {
          storagePath: "C:/data",
          enableDiagnostics: true,
          debounceMs: 750,
          noiseSuppression: {
            level: "high",
            minConfidence: 0.25,
            maxDepth: 4,
            maxPerChange: 3,
            maxPerArtifact: 2
          },
          ripple: {
            maxDepth: 2,
            maxResults: 10,
            allowedKinds: ["documents", "invalid", "depends_on"],
            documentKinds: ["documents", "references"],
            codeKinds: ["implements", "references"]
          }
        }
      }
    });

    expect(result).toEqual({
      storagePath: "C:/data",
      enableDiagnostics: true,
      debounceMs: 750,
      noiseSuppression: {
        level: "high",
        minConfidence: 0.25,
        maxDepth: 4,
        maxPerChange: 3,
        maxPerArtifact: 2
      },
      ripple: {
        maxDepth: 2,
        maxResults: 10,
        allowedKinds: ["documents", "depends_on"],
        documentKinds: ["documents", "references"],
        codeKinds: ["implements", "references"]
      }
    });
  });
});

describe("extractTestModeOverrides", () => {
  it("returns undefined when overrides are missing", () => {
    expect(extractTestModeOverrides({})).toBeUndefined();
  });

  it("extracts valid override values", () => {
    const overrides = extractTestModeOverrides({
      testModeOverrides: {
        enableDiagnostics: false,
        noiseSuppression: {
          level: "low",
          minConfidence: 0.15
        },
        ripple: {
          maxDepth: 5,
          allowedKinds: ["documents", "invalid", "references"]
        }
      }
    });

    expect(overrides).toEqual({
      enableDiagnostics: false,
      noiseSuppression: {
        level: "low",
        minConfidence: 0.15
      },
      ripple: {
        maxDepth: 5,
        allowedKinds: ["documents", "references"]
      }
    });
  });
});
