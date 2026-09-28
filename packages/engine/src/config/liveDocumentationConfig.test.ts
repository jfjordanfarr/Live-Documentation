import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  normalizeLiveDocumentationConfig
} from "./liveDocumentationConfig";

describe("normalizeLiveDocumentationConfig", () => {
  it("returns defaults when no input is provided", () => {
    const config = normalizeLiveDocumentationConfig();

    expect(config.root).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.root);
    expect(config.baseLayer).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer);
    expect(config.extension).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension);
    expect(config.glob).toEqual(DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob);
    expect(config.archetypeOverrides).toEqual({});
    expect(config.requireRelativeLinks).toBe(true);
    expect(config.slugDialect).toBe("github");
    expect(config.enableDocstringBridge).toBe(false);
    expect(config.bundleExclude).toEqual([]);
  });

  it("de-duplicates and trims bundleExclude patterns", () => {
    const config = normalizeLiveDocumentationConfig({
      bundleExclude: ["  notes/chat/**  ", "notes/chat/**", "", "drafts/*.md"]
    });

    expect(config.bundleExclude).toEqual(["notes/chat/**", "drafts/*.md"]);
  });

  it("merges overrides and de-duplicates glob patterns", () => {
    const config = normalizeLiveDocumentationConfig({
      root: "  docs/ld  ",
      baseLayer: "  layer-four  ",
      extension: " mdmd.md  ",
      glob: [
        "  packages/**/src/**/*.ts  ",
        "packages/**/src/**/*.ts",
        "tests/**/integration/**/*.ts",
        ""
      ],
      archetypeOverrides: {
        "tests/**/*.ts": "test",
        "assets/**/*.png": "asset"
      },
      requireRelativeLinks: false,
      slugDialect: "azure-devops",
      enableDocstringBridge: true
    });

    expect(config.root).toBe("docs/ld");
    expect(config.baseLayer).toBe("layer-four");
    expect(config.extension).toBe(".mdmd.md");
    expect(config.glob).toEqual([
      "packages/**/src/**/*.ts",
      "tests/**/integration/**/*.ts"
    ]);
    expect(config.archetypeOverrides).toEqual({
      "tests/**/*.ts": "test",
      "assets/**/*.png": "asset"
    });
    expect(config.requireRelativeLinks).toBe(false);
    expect(config.slugDialect).toBe("azure-devops");
    expect(config.enableDocstringBridge).toBe(true);
  });

  it("falls back to defaults when overrides are blank", () => {
    const config = normalizeLiveDocumentationConfig({
      root: "   ",
      baseLayer: "",
      extension: "",
      glob: []
    });

    expect(config.root).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.root);
    expect(config.baseLayer).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer);
    expect(config.extension).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension);
    expect(config.glob).toEqual(DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob);
  });

  it("ensures extension values have a leading dot", () => {
    const config = normalizeLiveDocumentationConfig({
      extension: "md"
    });

    expect(config.extension).toBe(".md");
  });
});
