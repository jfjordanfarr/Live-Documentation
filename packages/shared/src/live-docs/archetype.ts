/**
 * Archetype resolution for Live Documentation.
 *
 * @remarks
 * This module determines which archetype (implementation, test, asset, etc.)
 * applies to a given source file based on configuration overrides and
 * naming conventions.
 *
 * @module
 */

import path from "node:path";

import { IMPLEMENTATION_CODE_EXTENSIONS } from "./coreConstants";
import type {
  LiveDocumentationConfig,
  LiveDocumentationArchetype
} from "../config/liveDocumentationConfig";

/**
 * Determines which Live Documentation archetype applies to a given source file.
 *
 * @remarks
 * Explicit `archetypeOverrides` from the configuration take precedence. When no
 * overrides match, common fixture and test naming conventions are used as a
 * fallback before defaulting to the `implementation` archetype.
 *
 * @param sourcePath - Workspace-relative source path using forward slashes.
 * @param config - Live Documentation configuration containing archetype overrides.
 *
 * @returns The archetype that should be reflected in the generated markdown metadata.
 *
 * @example
 * ```ts
 * const archetype = resolveArchetype("packages/app/src/main.test.ts", config);
 * // archetype === "test"
 * ```
 */
export function resolveArchetype(
  sourcePath: string,
  config: LiveDocumentationConfig
): LiveDocumentationArchetype {
  const overrides = config.archetypeOverrides ?? {};
  for (const [pattern, archetype] of Object.entries(overrides)) {
    if (new RegExp(globPatternToRegExp(pattern)).test(sourcePath)) {
      return archetype;
    }
  }

  // Check for test files FIRST - these always take precedence
  // Matches: *.test.ts, *.spec.ts, *.test.js, etc.
  const basename = path.basename(sourcePath);
  if (/\.(test|spec)\.[^.]+$/.test(basename)) {
    return "test";
  }

  // Check if this is a fixture directory
  const isFixturePath = sourcePath.includes("/__fixtures__/") || /\bfixtures\b/.test(sourcePath);
  
  if (isFixturePath) {
    // Fixture files with code extensions are implementation (they have symbols/dependencies)
    // Non-code fixtures (JSON, config, etc.) are assets
    const ext = path.extname(sourcePath).toLowerCase();
    if (IMPLEMENTATION_CODE_EXTENSIONS.has(ext)) {
      return "implementation";
    }
    return "asset";
  }

  // Check for test directories (but not individual test files - those were caught above)
  if (/\btests?\b|__tests__/i.test(sourcePath)) {
    return "test";
  }

  return "implementation";
}

/**
 * Checks whether an authored markdown block carries information beyond the default placeholders.
 *
 * @param authoredBlock - Raw markdown captured between the `## Authored` markers.
 *
 * @returns `true` when the block contains substantive content, otherwise `false`.
 */
export function hasMeaningfulAuthoredContent(authoredBlock?: string): boolean {
  if (!authoredBlock) {
    return false;
  }

  const normalized = authoredBlock.replace(/\r?\n/g, "\n").trim();
  if (!normalized) {
    return false;
  }

  const sanitized = normalized
    .replace(/###\s+Purpose/gi, "")
    .replace(/###\s+Notes/gi, "")
    .replace(/_Pending authored purpose_/gi, "")
    .replace(/_Pending notes_/gi, "")
    .replace(/_Pending purpose_/gi, "")
    .replace(/_Pending_/gi, "")
    .replace(/\s+/g, "");

  return sanitized.length > 0;
}

// ============================================================================
// Internal Helpers
// ============================================================================

function globPatternToRegExp(pattern: string): string {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "(.+?)")
    .replace(/\*/g, "([^/]*)");
  return `^${escaped}$`;
}
