export type AnchorDirection = "inbound" | "outbound";

const NORMALIZED_PREFIX = "normalized";

/**
 * Normalizes a symbol identifier so different textual representations resolve to the same anchor key.
 */
export function normalizeSymbolIdentifier(raw: string | null | undefined): string | null {
    if (!raw) {
        return null;
    }
    let value = raw.trim();
    if (value.length === 0) {
        return null;
    }
    value = value
        // Drop common TypeScript export syntax noise.
        .replace(/export\s+/gi, "")
        // Remove trailing call signatures and optional return type annotations.
        .replace(/\([^)]*\)\s*(?::.+)?$/u, "")
        // Remove generic annotations like <T>, <A, B>.
        .replace(/<[^>]*>/g, "")
        // Strip surrounding quotes or backticks.
        .replace(/^['"`]/, "")
        .replace(/['"`]$/, "")
        // Collapse whitespace so symbols like "Foo Bar" normalize cleanly.
        .replace(/\s+/g, "");

    // Remove trailing punctuation that can appear in declaration snippets.
    value = value.replace(/[:;,]+$/, "");

    // Drop common namespace or module prefixes so dotted references resolve to the canonical symbol.
    const namespaceSegments = value.split(/(?:\.|::|#|\/)/).filter(segment => segment.length > 0);
    if (namespaceSegments.length > 0) {
        value = namespaceSegments[namespaceSegments.length - 1];
    }

    // Remove leading symbol- prefixes produced by slugged anchors.
    value = value.replace(/^symbol-/i, "");

    // No-op for empty or non-informative results.
    if (value.length === 0) {
        return null;
    }

    return value.toLowerCase();
}

export function buildNormalizedAnchorKey(direction: AnchorDirection, symbol: string): string | null {
    const normalized = normalizeSymbolIdentifier(symbol);
    if (!normalized) {
        return null;
    }
    return `${NORMALIZED_PREFIX}:${direction}:${normalized}`;
}

export function tryBuildNormalizedKeyFromAnchorKey(anchorKey: string): string | null {
    const separatorIndex = anchorKey.indexOf(":");
    if (separatorIndex <= 0 || separatorIndex === anchorKey.length - 1) {
        return null;
    }
    const direction = anchorKey.slice(0, separatorIndex) as AnchorDirection;
    const symbol = anchorKey.slice(separatorIndex + 1);
    if (symbol === "*" || (direction !== "inbound" && direction !== "outbound")) {
        return null;
    }
    return buildNormalizedAnchorKey(direction, symbol);
}

export type NormalizedAnchorKey = `${typeof NORMALIZED_PREFIX}:${AnchorDirection}:${string}`;
