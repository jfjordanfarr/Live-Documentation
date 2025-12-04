import { describe, expect, it } from "vitest";

import {
    buildNormalizedAnchorKey,
    normalizeSymbolIdentifier,
    tryBuildNormalizedKeyFromAnchorKey
} from "./symbolAnchors";

describe("normalizeSymbolIdentifier", () => {
    it("lowercases and trims simple identifiers", () => {
        expect(normalizeSymbolIdentifier(" FooBar ")).toBe("foobar");
    });

    it("drops trailing invocation syntax", () => {
        expect(normalizeSymbolIdentifier("createThing(): Promise<void>")).toBe("creatething");
    });

    it("removes generic markers and punctuation", () => {
        expect(normalizeSymbolIdentifier("makeWidget<TDependency>")).toBe("makewidget");
        expect(normalizeSymbolIdentifier("'DefaultExport'")).toBe("defaultexport");
    });

    it("strips namespace prefixes and slug markers", () => {
        expect(normalizeSymbolIdentifier("shared.cleanupReference")).toBe("cleanupreference");
        expect(normalizeSymbolIdentifier("fallbackHeuristicTypes.HeuristicArtifact")).toBe("heuristicartifact");
        expect(normalizeSymbolIdentifier("symbol-computeReferenceStart")).toBe("computereferencestart");
    });

    it("returns null for empty or undefined inputs", () => {
        expect(normalizeSymbolIdentifier("   ")).toBeNull();
        expect(normalizeSymbolIdentifier(undefined)).toBeNull();
    });
});

describe("buildNormalizedAnchorKey", () => {
    it("creates normalized keys when a symbol is provided", () => {
        expect(buildNormalizedAnchorKey("inbound", "CreateThing")).toBe("normalized:inbound:creatething");
    });

    it("returns null when normalization fails", () => {
        expect(buildNormalizedAnchorKey("outbound", "   ")).toBeNull();
    });
});

describe("tryBuildNormalizedKeyFromAnchorKey", () => {
    it("parses standard anchor keys", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("inbound:Create")).toBe("normalized:inbound:create");
    });

    it("ignores wildcard anchors", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("inbound:*")).toBeNull();
    });

    it("guards against malformed keys", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("card")).toBeNull();
        expect(tryBuildNormalizedKeyFromAnchorKey("center:Item")).toBeNull();
    });
});
