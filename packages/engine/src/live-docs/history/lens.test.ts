import { describe, expect, it } from "vitest";

import { canonicalJson, lensOf } from "./lens";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG, normalizeLiveDocumentationConfig } from "../../config/liveDocumentationConfig";

const GENERATOR = { version: "0.0.0", commit: "dec184ec", modified: null };

describe("lensOf", () => {
  it("keys the same generator and configuration alike, whatever the order of their keys", () => {
    const reordered = Object.fromEntries(Object.entries(DEFAULT_LIVE_DOCUMENTATION_CONFIG).reverse()) as typeof DEFAULT_LIVE_DOCUMENTATION_CONFIG;
    expect(lensOf(GENERATOR, reordered).key).toBe(lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key);
    expect(lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key).toMatch(/^[0-9a-f]{16}$/u);
  });

  it("keys a new lens apart: another configuration, another commit, an uncommitted change", () => {
    const base = lensOf(GENERATOR, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key;
    const keys = [
      lensOf(GENERATOR, normalizeLiveDocumentationConfig({ exclude: ["vendor/**"] })).key,
      lensOf({ ...GENERATOR, commit: "cad63bdd" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key,
      lensOf({ ...GENERATOR, modified: "0011223344556677" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key,
      lensOf({ ...GENERATOR, version: "0.1.0" }, DEFAULT_LIVE_DOCUMENTATION_CONFIG).key
    ];
    expect(new Set([base, ...keys]).size).toBe(5);
  });
});

describe("canonicalJson", () => {
  it("sorts every object's keys and keeps every array's order", () => {
    expect(canonicalJson({ b: [3, 1, { d: 1, c: 2 }], a: null })).toBe('{"a":null,"b":[3,1,{"c":2,"d":1}]}');
  });
});
