/**
 * Direction of a dependency edge relative to a Live Doc node.
 *
 * - `"inbound"` — the symbol is consumed by the current node (appears in its Dependencies section)
 * - `"outbound"` — the symbol is exported by the current node (appears in its Public Symbols section)
 */
export type AnchorDirection = "inbound" | "outbound";

const NORMALIZED_PREFIX = "normalized";

/**
 * The complete documented heading is the row's identity. The graph projection resolves anchors to headings
 * before a view sees them, so matching must preserve case, kind, overloads and qualification verbatim.
 */
export function normalizeSymbolIdentifier(raw: string | null | undefined): string | null {
    return raw?.trim() || null;
}

/**
 * Constructs a normalised anchor key from a direction and raw symbol name.
 *
 * Returns `null` when the symbol cannot be meaningfully normalised (e.g. empty or whitespace-only).
 * The resulting key has the form `"normalized:<direction>:<documented-heading>"`.
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
