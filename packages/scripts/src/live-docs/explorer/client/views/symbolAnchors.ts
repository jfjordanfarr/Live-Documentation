/**
 * Direction of a dependency edge relative to a Live Doc node.
 *
 * - `"inbound"` — the symbol is consumed by the current node (appears in its Dependencies section)
 * - `"outbound"` — the symbol is exported by the current node (appears in its Public Symbols section)
 */
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
        .replace(/\([^)]*\)\s*(?::.+)?$/u, "");
    // Remove generic annotations like <T>, <A, B> - loop until stable for nested generics
    let prevValue: string;
    do {
        prevValue = value;
        value = value.replace(/<[^>]*>/g, "");
    } while (value !== prevValue);
    value = value
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

    // Remove trailing kind suffixes from slugged symbol names (e.g., "-class", "-interface").
    // These are added by the GitHub slugger when generating anchors for symbols like "BaseWidget (class)".
    value = value.replace(/-(class|interface|struct|enum|type|function|method|property|constructor|constant|variable)$/i, "");

    // No-op for empty or non-informative results.
    if (value.length === 0) {
        return null;
    }

    return value.toLowerCase();
}

/**
 * Constructs a normalised anchor key from a direction and raw symbol name.
 *
 * Returns `null` when the symbol cannot be meaningfully normalised (e.g. empty or whitespace-only).
 * The resulting key has the form `"normalized:<direction>:<lowercased-symbol>"`.
 */
export function buildNormalizedAnchorKey(direction: AnchorDirection, symbol: string): string | null {
    const normalized = normalizeSymbolIdentifier(symbol);
    if (!normalized) {
        return null;
    }
    return `${NORMALIZED_PREFIX}:${direction}:${normalized}`;
}

/**
 * Attempts to derive a normalised anchor key from an existing raw anchor key.
 *
 * Parses the `"<direction>:<symbol>"` format, normalises the symbol portion,
 * and returns a key suitable for fuzzy matching. Returns `null` for wildcard
 * keys (`"*"`) or keys with unrecognised direction prefixes.
 */
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

/**
 * Template literal type constraining normalised anchor keys to the
 * `"normalized:<direction>:<symbol>"` shape for type-safe lookups.
 */
export type NormalizedAnchorKey = `${typeof NORMALIZED_PREFIX}:${AnchorDirection}:${string}`;
