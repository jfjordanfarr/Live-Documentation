/**
 * Utility functions for Live Documentation generation.
 *
 * @remarks
 * These are small, stateless helper functions used throughout the
 * Live Documentation system for formatting, path manipulation,
 * and AST node inspection.
 *
 * @module
 */

import path from "node:path";
import ts from "typescript";

import type { DependencyEntry, LocationInfo } from "./coreTypes";
import { slug } from "../tooling/githubSlugger";

// ============================================================================
// Path & Link Formatting
// ============================================================================

/**
 * Formats a source link with line number anchor.
 *
 * @param params.docDir - Absolute path to the Live Doc directory
 * @param params.sourceAbsolute - Absolute path to the source file
 * @param params.line - 1-indexed line number
 * @returns A relative path with #L{line} anchor
 */
export function formatSourceLink(params: { docDir: string; sourceAbsolute: string; line: number }): string {
  const relative = formatRelativePathFromDoc(params.docDir, params.sourceAbsolute);
  return `${relative}#L${params.line}`;
}

/**
 * Formats a relative path from a doc directory to a target file.
 *
 * @param docDir - Absolute path to the doc directory
 * @param targetAbsolute - Absolute path to the target file
 * @returns A relative path, always starting with "./" or "../"
 */
export function formatRelativePathFromDoc(docDir: string, targetAbsolute: string): string {
  const relative = path.relative(docDir, targetAbsolute).split(path.sep).join("/");
  if (!relative.startsWith(".")) {
    return `./${relative}`;
  }
  return relative;
}

// ============================================================================
// Symbol & Module Formatting
// ============================================================================

/**
 * Creates a slug for a symbol name suitable for markdown anchors.
 *
 * @param name - The symbol name
 * @returns A slug like "symbol-myfunction", or undefined if the name is invalid
 */
export function createSymbolSlug(name: string): string | undefined {
  const candidate = slug(`\`${name}\``);
  if (!candidate || candidate.length === 0) {
    return undefined;
  }

  return `symbol-${candidate}`;
}

/**
 * Extracts a module label from a workspace-relative path.
 *
 * @param workspaceRelativePath - Path like "packages/shared/src/core.ts"
 * @returns Base name without extension, e.g., "core"
 */
export function toModuleLabel(workspaceRelativePath: string): string {
  const baseName = path.basename(workspaceRelativePath);
  const withoutExtension = baseName.replace(/\.[^.]+$/, "");
  return withoutExtension || baseName || workspaceRelativePath;
}

/**
 * Formats a value as inline code, escaping backticks.
 *
 * @param value - The value to format
 * @returns The value wrapped in backticks with internal backticks escaped
 */
export function formatInlineCode(value: string): string {
  const sanitized = value.replace(/`/g, "'");
  return `\`${sanitized}\``;
}

/**
 * Formats dependency qualifiers (re-export, type-only) for display.
 *
 * @param dependency - The dependency entry
 * @returns A qualifier string like " (re-export, type-only)" or empty string
 */
export function formatDependencyQualifier(dependency: DependencyEntry): string {
  const qualifiers: string[] = [];
  if (dependency.kind === "export") {
    qualifiers.push("re-export");
  }
  if (dependency.isTypeOnly) {
    qualifiers.push("type-only");
  }
  if (!qualifiers.length) {
    return "";
  }
  return ` (${qualifiers.join(", ")})`;
}

// ============================================================================
// TypeScript AST Helpers
// ============================================================================

/**
 * Resolves the name of an export assignment expression.
 *
 * @param expression - The expression from `export = expr` or `export default expr`
 * @returns The resolved name, or "default" for anonymous expressions
 */
export function resolveExportAssignmentName(expression: ts.Expression): string | undefined {
  if (ts.isIdentifier(expression)) {
    return expression.text;
  }
  if (ts.isPropertyAccessExpression(expression)) {
    return expression.getText();
  }
  return "default";
}

/**
 * Checks if a node has the `export` modifier.
 */
export function hasExportModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
}

/**
 * Checks if a node has the `default` modifier.
 */
export function hasDefaultModifier(node: ts.Node): boolean {
  if (!ts.canHaveModifiers(node)) {
    return false;
  }
  const modifiers = ts.getModifiers(node) ?? [];
  return modifiers.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword);
}

/**
 * Gets the source location (1-indexed line and character) of a node.
 */
export function getNodeLocation(node: ts.Node, sourceFile: ts.SourceFile): LocationInfo {
  const position = node.getStart(sourceFile);
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(position);
  return {
    line: line + 1,
    character: character + 1
  };
}

/**
 * Gets the display key for a dependency entry.
 *
 * @param entry - The dependency entry
 * @returns The resolved path if available, otherwise the specifier
 */
export function displayDependencyKey(entry: DependencyEntry): string {
  return entry.resolvedPath ?? entry.specifier;
}

// ============================================================================
// Barrel File Detection
// ============================================================================

/**
 * Well-known barrel file base names (without extension).
 *
 * These patterns are commonly used for index/barrel files that re-export
 * symbols from other modules without defining them locally.
 */
const BARREL_FILE_BASE_NAMES = new Set(["index", "mod", "barrel", "exports", "public-api"]);

/**
 * Determines if a file path represents a barrel/index file.
 *
 * @remarks
 * Barrel files (also known as index files) are TypeScript/JavaScript modules
 * that primarily re-export symbols from other files rather than defining them.
 * They are commonly used as public API entry points for packages.
 *
 * When resolving symbol references, we generally prefer to link to the file
 * where a symbol is **defined** rather than a barrel that re-exports it.
 * This produces more accurate dependency graphs and clearer documentation links.
 *
 * @param filePath - The file path to check (workspace-relative or absolute)
 * @returns True if the file appears to be a barrel file based on its name
 *
 * @example
 * ```ts
 * isBarrelFilePath("packages/foo/index.ts");      // true
 * isBarrelFilePath("packages/foo/src/utils.ts");  // false
 * isBarrelFilePath("lib/mod.ts");                 // true
 * ```
 */
export function isBarrelFilePath(filePath: string): boolean {
  // Extract base name without extension
  const baseName = path.basename(filePath).replace(/\.[^.]+$/, "").toLowerCase();
  return BARREL_FILE_BASE_NAMES.has(baseName);
}

/**
 * Sorts symbol locations to prefer non-barrel files over barrel files.
 *
 * @remarks
 * When multiple files export the same symbol (e.g., an origin file and a
 * barrel that re-exports it), we want to resolve links to the origin file
 * where the symbol is actually defined.
 *
 * This comparator:
 * 1. Puts non-barrel files before barrel files
 * 2. Among files of the same barrel-ness, prefers deeper paths (more specific)
 *
 * @param a - First location to compare
 * @param b - Second location to compare
 * @returns Negative if a should come first, positive if b should come first
 */
export function compareSymbolLocationsPreferOrigin(
  a: { sourcePath: string },
  b: { sourcePath: string }
): number {
  const aIsBarrel = isBarrelFilePath(a.sourcePath);
  const bIsBarrel = isBarrelFilePath(b.sourcePath);

  // Non-barrel files come first
  if (aIsBarrel !== bIsBarrel) {
    return aIsBarrel ? 1 : -1;
  }

  // Among same barrel-ness, prefer deeper paths (more specific modules)
  const aDepth = a.sourcePath.split(/[\\/]/).length;
  const bDepth = b.sourcePath.split(/[\\/]/).length;
  return bDepth - aDepth;
}

/**
 * Counts the number of shared leading directory segments between two paths.
 * Used for proximity-based symbol resolution.
 */
export function commonDirectoryPrefixLength(pathA: string, pathB: string): number {
  const partsA = pathA.replace(/\\/g, "/").split("/");
  const partsB = pathB.replace(/\\/g, "/").split("/");
  let common = 0;
  for (let i = 0; i < Math.min(partsA.length, partsB.length); i++) {
    if (partsA[i] === partsB[i]) {
      common++;
    } else {
      break;
    }
  }
  return common;
}

/**
 * Creates a comparator that ranks symbol locations by proximity to a reference path.
 *
 * Priority: non-barrel > barrel, then closer directory > distant, then deeper > shallower.
 */
export function createProximityAwareComparator(referencePath: string) {
  return (a: { sourcePath: string }, b: { sourcePath: string }): number => {
    const aIsBarrel = isBarrelFilePath(a.sourcePath);
    const bIsBarrel = isBarrelFilePath(b.sourcePath);

    // Non-barrel files come first
    if (aIsBarrel !== bIsBarrel) {
      return aIsBarrel ? 1 : -1;
    }

    // Prefer files closer to the reference path (more shared directory segments)
    const aProximity = commonDirectoryPrefixLength(a.sourcePath, referencePath);
    const bProximity = commonDirectoryPrefixLength(b.sourcePath, referencePath);
    if (aProximity !== bProximity) {
      return bProximity - aProximity;
    }

    // Among same proximity, prefer deeper paths (more specific modules)
    const aDepth = a.sourcePath.split(/[\\/]/).length;
    const bDepth = b.sourcePath.split(/[\\/]/).length;
    return bDepth - aDepth;
  };
}
