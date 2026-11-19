import { describe, expect, it } from "vitest";

import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig } from "../../config/liveDocumentationConfig";
import { canonicalJson, lensOf, summarizedConfiguration } from "./lens";

const GENERATOR = { version: "0.0.0", code: "0a1b2c3d4e5f6a7b", commit: "dec184ec", modified: null };

describe("lensOf", () => {
  it("keys the same generator and configuration alike, whatever the order of their keys", () => {
    const reordered = Object.fromEntries(Object.entries(DEFAULT_LIVE_DOCUMENTATION_CONFIG).reverse()) as typeof DEFAULT_LIVE_DOCUMENTATION_CONFIG;
    expect(lensOf(GENERATOR, reordered).key).toBe(lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key);
    expect(lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key).toMatch(/^[0-9a-f]{16}$/u);
  });

  it("keeps the lens across a commit that touches no generator code, since the commit rides in the lens but does not key it", () => {
    expect(lensOf({ ...GENERATOR, commit: "cad63bdd" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key).toBe(lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key);
    expect(lensOf({ ...GENERATOR, commit: "cad63bdd" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).generator.commit).toBe("cad63bdd");
  });

  it("keys a new lens apart: another configuration, other code, an uncommitted change", () => {
    const base = lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key;
    const keys = [
      lensOf(GENERATOR, normalizeLiveDocumentationConfig({ exclude: ["vendor/**"] })).key,
      lensOf({ ...GENERATOR, code: "ffffffffffffffff" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key,
      lensOf({ ...GENERATOR, modified: "0011223344556677" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key,
      lensOf({ ...GENERATOR, version: "0.1.0" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key
    ];
    expect(new Set([base, ...keys]).size).toBe(5);
  });

  it("keeps the lens across an edit of the bundle exclusions, which are applied where summaries are read, and moves it with an edit of exclude", () => {
    const base = normalizeLiveDocumentationConfig({ exclude: ["archive/**"], bundleExclude: ["archive/**/*.md"] });
    const edited = normalizeLiveDocumentationConfig({ exclude: ["archive/**"], bundleExclude: ["archive/**/*.md", "old-archive/**/*.md"] });
    expect(lensOf(GENERATOR, edited).key).toBe(lensOf(GENERATOR, base).key);
    // The lens still carries the whole configuration for its reader.
    expect(lensOf(GENERATOR, edited).configuration.bundleExclude).toEqual(["archive/**/*.md", "old-archive/**/*.md"]);
    const excluded = normalizeLiveDocumentationConfig({ exclude: ["archive/**", "old-archive/**"], bundleExclude: ["archive/**/*.md"] });
    expect(lensOf(GENERATOR, excluded).key).not.toBe(lensOf(GENERATOR, base).key);
  });
});

describe("summarizedConfiguration", () => {
  it("is what the key holds: the configuration without its bundle exclusions or its board, and nothing else left out", () => {
    const configuration = normalizeLiveDocumentationConfig({ exclude: ["archive/**"], bundleExclude: ["archive/**/*.md"], board: "board.md", slugDialect: "github" });
    const summarized = summarizedConfiguration(configuration);
    expect(summarized.bundleExclude).toEqual([]);
    expect("board" in summarized).toBe(false);
    expect({ ...summarized, bundleExclude: configuration.bundleExclude, board: configuration.board }).toEqual(configuration);
    // An edit of the board keeps the key; any field the summary is made under moves it.
    expect(lensOf(GENERATOR, { ...configuration, board: "other.md" }).key).toBe(lensOf(GENERATOR, configuration).key);
    expect(lensOf(GENERATOR, { ...configuration, slugDialect: "gitlab" as typeof configuration.slugDialect }).key).not.toBe(lensOf(GENERATOR, configuration).key);
  });
});

describe("canonicalJson", () => {
  it("sorts every object's keys and keeps every array's order", () => {
    expect(canonicalJson({ b: [3, 1, { d: 1, c: 2 }], a: null })).toBe('{"a":null,"b":[3,1,{"c":2,"d":1}]}');
  });
});
