/**
 * Constants for Live Documentation file extension handling.
 *
 * @remarks
 * These constants define which file extensions are supported by the
 * TypeScript AST parser, which are treated as implementation code,
 * and which extensions are tried during module resolution.
 *
 * @module
 */

/**
 * Extensions supported by the TypeScript parser for script analysis.
 */
export const SUPPORTED_SCRIPT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs"
]);

/**
 * Extensions tried in order during module resolution (TypeScript-style).
 */
export const MODULE_RESOLUTION_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json"
];

/**
 * Reserved heading names that cannot be used as user-authored sections.
 * These are normalized to lowercase for comparison.
 */
export const RESERVED_HEADING_NAMES = new Set(
  [
    "Metadata",
    "Authored",
    "Purpose",
    "Notes",
    "Generated",
    "Public Symbols",
    "Dependencies",
    "Cited By",
    "Re-Exported Symbol Anchors"
  ].map((name) => name.toLowerCase())
);
