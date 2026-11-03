import { describe, expect, it } from "vitest";

import {
    buildNormalizedAnchorKey,
    normalizeSymbolIdentifier,
    tryBuildNormalizedKeyFromAnchorKey
} from "./symbolAnchors";

describe("normalizeSymbolIdentifier", () => {
    it("trims only surrounding whitespace", () => {
        expect(normalizeSymbolIdentifier(" FooBar ")).toBe("FooBar");
    });

    it("preserves signature text rather than guessing a bare name", () => {
        expect(normalizeSymbolIdentifier("createThing(): Promise<void>")).toBe("createThing(): Promise<void>");
    });

    it("preserves generic markers and punctuation", () => {
        expect(normalizeSymbolIdentifier("makeWidget<TDependency>")).toBe("makeWidget<TDependency>");
        expect(normalizeSymbolIdentifier("'DefaultExport'")).toBe("'DefaultExport'");
    });

    it("preserves qualification and distinguishes an unresolved anchor from a name", () => {
        expect(normalizeSymbolIdentifier("shared.cleanupReference")).toBe("shared.cleanupReference");
        expect(normalizeSymbolIdentifier("fallbackHeuristicTypes.HeuristicArtifact")).toBe("fallbackHeuristicTypes.HeuristicArtifact");
        expect(normalizeSymbolIdentifier("symbol-computeReferenceStart")).toBe("symbol-computeReferenceStart");
    });

    it("returns null for empty or undefined inputs", () => {
        expect(normalizeSymbolIdentifier("   ")).toBeNull();
        expect(normalizeSymbolIdentifier(undefined)).toBeNull();
    });
});

describe("buildNormalizedAnchorKey", () => {
    it("creates normalized keys when a symbol is provided", () => {
        expect(buildNormalizedAnchorKey("inbound", "CreateThing")).toBe("normalized:inbound:CreateThing");
    });

    it("returns null when normalization fails", () => {
        expect(buildNormalizedAnchorKey("outbound", "   ")).toBeNull();
    });
});

describe("tryBuildNormalizedKeyFromAnchorKey", () => {
    it("parses standard anchor keys", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("inbound:Create")).toBe("normalized:inbound:Create");
    });

    it("ignores wildcard anchors", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("inbound:*")).toBeNull();
    });

    it("guards against malformed keys", () => {
        expect(tryBuildNormalizedKeyFromAnchorKey("card")).toBeNull();
        expect(tryBuildNormalizedKeyFromAnchorKey("center:Item")).toBeNull();
    });
});
