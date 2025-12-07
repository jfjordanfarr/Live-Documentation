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
 * Extensions that are always treated as implementation code, even under fixture directories.
 * These files contain analyzable source code with symbols and dependencies.
 */
export const IMPLEMENTATION_CODE_EXTENSIONS = new Set([
  // TypeScript/JavaScript
  ".ts", ".tsx", ".mts", ".cts",
  ".js", ".jsx", ".mjs", ".cjs",
  // C/C++
  ".c", ".h", ".cpp", ".hpp", ".cc", ".hh", ".cxx", ".hxx",
  // C#
  ".cs",
  // Java
  ".java",
  // Python
  ".py",
  // Ruby
  ".rb",
  // Rust
  ".rs",
  // PowerShell
  ".ps1", ".psm1", ".psd1",
  // ASP.NET Markup (code-behind)
  ".aspx", ".cshtml", ".razor", ".ascx"
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
    "Observed Evidence",
    "Targets",
    "Supporting Fixtures",
    "Re-Exported Symbol Anchors"
  ].map((name) => name.toLowerCase())
);
