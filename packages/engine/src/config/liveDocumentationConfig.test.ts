import { describe, expect, it } from "vitest";

import {
  DEFAULT_LIVE_DOCUMENTATION_CONFIG,
  LIVE_DOCUMENTATION_ASSET_EXTENSIONS,
  LIVE_DOCUMENTATION_DEFAULT_GLOBS,
  LIVE_DOCUMENTATION_SOURCE_EXTENSIONS,
  hasReader,
  isMediaAsset,
  normalizeLiveDocumentationConfig
} from "./liveDocumentationConfig";
import { SUPPORTED_SCRIPT_EXTENSIONS } from "../live-docs/coreConstants";

describe("the default globs", () => {
  it("are every file, anywhere in the workspace, so that discovery's own rules alone say what is never documented", () => {
    expect(LIVE_DOCUMENTATION_DEFAULT_GLOBS).toEqual(["**/*"]);
  });
});

describe("what a reader reads", () => {
  it("lists every extension once, the TypeScript parser's among them", () => {
    const extensions = [...LIVE_DOCUMENTATION_SOURCE_EXTENSIONS, ...LIVE_DOCUMENTATION_ASSET_EXTENSIONS];
    expect(new Set(extensions).size).toBe(extensions.length);
    expect(extensions.every((extension) => /^\.[a-z0-9]+$/u.test(extension))).toBe(true);
    for (const extension of SUPPORTED_SCRIPT_EXTENSIONS) {
      expect(LIVE_DOCUMENTATION_SOURCE_EXTENSIONS, `${extension} is read by the TypeScript parser`).toContain(extension);
    }
  });

  it("knows a file a reader handles by its extension, whatever its case, or a manifest by its exact name", () => {
    for (const read of ["src/index.ts", "src/App.TSX", "a/b/Program.cs", "Cargo.toml", "crates/x/Cargo.toml", "go.mod", "pom.xml", "app/pyproject.toml"]) {
      expect(hasReader(read), read).toBe(true);
    }
    for (const unread of [".github/workflows/ci.yml", ".gitignore", ".nvmrc", "Makefile", "Estate.sln", "grammar.patch", "data/rows.toml", "cargo.toml", "pom.xml.bak", "tree-sitter-powershell.wasm", "logo.png"]) {
      expect(hasReader(unread), unread).toBe(false);
    }
  });

  it("knows an image, a font or a recording by its extension, and nothing else as one", () => {
    for (const media of ["logo.png", "img/Photo.JPG", "fonts/x.woff2", "clip.webm"]) {
      expect(isMediaAsset(media), media).toBe(true);
    }
    for (const other of ["grammar.wasm", ".png", "ci.yml", "src/index.ts"]) {
      expect(isMediaAsset(other), other).toBe(false);
    }
  });
});

describe("normalizeLiveDocumentationConfig", () => {
  it("returns defaults when no input is provided", () => {
    const config = normalizeLiveDocumentationConfig();

    expect(config.root).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.root);
    expect(config.baseLayer).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.baseLayer);
    expect(config.extension).toBe(DEFAULT_LIVE_DOCUMENTATION_CONFIG.extension);
    expect(config.glob).toEqual(DEFAULT_LIVE_DOCUMENTATION_CONFIG.glob);
    expect(config.archetypeOverrides).toEqual({});
    expect(config.sampleRoots).toEqual([]);
    expect(config.entryPoints).toEqual([]);
    expect(config.exclude).toEqual([]);
    expect(config.requireRelativeLinks).toBe(true);
    expect(config.slugDialect).toBe("github");
    expect(config.bundleExclude).toEqual([]);
  });

  it("de-duplicates and trims bundleExclude patterns", () => {
    const config = normalizeLiveDocumentationConfig({
      bundleExclude: ["  notes/chat/**  ", "notes/chat/**", "", "drafts/*.md"]
    });

    expect(config.bundleExclude).toEqual(["notes/chat/**", "drafts/*.md"]);
  });

  it("normalizes sample directories without confusing a root with a similarly named sibling", () => {
    const config = normalizeLiveDocumentationConfig({
      sampleRoots: [" ./tests/scenarios/ ", "tests\\scenarios", "", "./", "examples"]
    });
    expect(config.sampleRoots).toEqual(["tests/scenarios", ".", "examples"]);
  });

  it("keeps the declared entry points as workspace-relative paths or globs, deduplicated", () => {
    const config = normalizeLiveDocumentationConfig({
      entryPoints: [" ./packages/explorer/src/client/index.ts ", "packages\\explorer\\src\\client\\styles.css", "", "packages/explorer/src/client/index.ts", "scripts/**/*.mjs"]
    });
    expect(config.entryPoints).toEqual(["packages/explorer/src/client/index.ts", "packages/explorer/src/client/styles.css", "scripts/**/*.mjs"]);
    expect(normalizeLiveDocumentationConfig({}).entryPoints).toEqual([]);
  });

  it("keeps the excluded paths and globs workspace-relative, deduplicated", () => {
    const config = normalizeLiveDocumentationConfig({
      exclude: [" ./AI-Agent-Workspace/** ", "vendor\\third-party\\**", "", "AI-Agent-Workspace/**", "tools/self/x.ts"]
    });
    expect(config.exclude).toEqual(["AI-Agent-Workspace/**", "vendor/third-party/**", "tools/self/x.ts"]);
    expect(normalizeLiveDocumentationConfig({}).exclude).toEqual([]);
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
      slugDialect: "azure-devops"
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
