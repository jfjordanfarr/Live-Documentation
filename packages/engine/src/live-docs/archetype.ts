/**
 * Archetype resolution for Live Documentation.
 *
 * @remarks
 * This module determines which archetype (implementation, test or asset)
 * applies to a given source file: a configuration override first, then the
 * file's content (a binary file is an asset, wherever it lies), then the naming
 * conventions of tests, read within a sample root as they would be outside one.
 *
 * @module
 */

import path from "node:path";

import type {
  LiveDocumentationConfig,
  LiveDocumentationArchetype
} from "../config/liveDocumentationConfig";

/** How much of a file's head {@link isBinaryContent} reads: git's own window for the same question. */
export const BINARY_SNIFF_BYTES = 8000;

/**
 * True when a file's content is binary: a NUL byte within its first
 * {@link BINARY_SNIFF_BYTES} bytes, as git decides it, except that a text file
 * in UTF-16 or UTF-32 announced by its byte order mark is text, since a
 * Windows PowerShell script is often written that way. The dividing line is the
 * owner's (2026-10-16): "plaintext/near-plain-text versus binary. It should be
 * that simple." An archive that holds text would be text by that rule and
 * is not read today, since discovery admits no archive.
 */
export function isBinaryContent(head: Uint8Array): boolean {
  const [a, b, c, d] = head;
  if (head.length >= 2 && ((a === 0xff && b === 0xfe) || (a === 0xfe && b === 0xff))) return false;
  if (head.length >= 4 && a === 0 && b === 0 && c === 0xfe && d === 0xff) return false;
  const limit = Math.min(head.length, BINARY_SNIFF_BYTES);
  for (let index = 0; index < limit; index += 1) {
    if (head[index] === 0) return true;
  }
  return false;
}

/**
 * Determines which Live Documentation archetype applies to a given source file.
 *
 * @remarks
 * Explicit `archetypeOverrides` from the configuration take precedence. Then a
 * binary file is an asset, wherever it lies (`binary` is the caller's reading of
 * the content, {@link isBinaryContent}); the asset extensions of discovery say
 * which files are found, and the content says what they are. Then the naming
 * conventions of tests decide, and within a sample root they are read against
 * the path inside the sample, so that a sample's own `tests/` folder is a test
 * folder and the harness around the sample is not. Everything else is
 * implementation: a sample's manifest, configuration, data or SQL file is as
 * much its code as it is anywhere else (the owner's rule of 2026-10-16, which
 * retired the fixtures-era rule that called every non-code file under a sample
 * root an asset).
 *
 * @param sourcePath - Workspace-relative source path using forward slashes.
 * @param config - Live Documentation configuration containing archetype overrides.
 * @param binary - Whether the file's content is binary; false when not known.
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
  config: LiveDocumentationConfig,
  binary = false
): LiveDocumentationArchetype {
  const overrides = config.archetypeOverrides ?? {};
  for (const [pattern, archetype] of Object.entries(overrides)) {
    if (matchesPathPattern(sourcePath, pattern)) {
      return archetype;
    }
  }

  if (binary) {
    return "asset";
  }

  // Check for test files FIRST - these always take precedence
  // Polyglot test file patterns:
  //   *.test.ts, *.spec.ts     (TypeScript/JavaScript)
  //   *_test.go, *_test.rs     (Go, Rust)
  //   test_*.py, test_*.c      (Python, C)
  //   *Test.java, *Tests.cs    (Java, C#)
  //   *_spec.rb                (Ruby)
  const basename = path.basename(sourcePath);
  if (
    /\.(test|spec)\.[^.]+$/.test(basename) ||   // foo.test.ts, foo.spec.js
    /_test\.[^.]+$/.test(basename) ||            // foo_test.go, foo_test.rs
    /^test_[^.]+\.[^.]+$/.test(basename) ||      // test_foo.py, test_foo.c
    /Tests?\.[^.]+$/.test(basename) ||           // FooTest.java, FooTests.cs
    /_spec\.[^.]+$/.test(basename)               // foo_spec.rb
  ) {
    return "test";
  }

  // Check if file is in a spec/ directory (Ruby convention)
  if (/\bspec\b/.test(sourcePath) && basename.endsWith(".rb")) {
    return "test";
  }

  // Sample code keeps its own roles even when the sample collection lives under tests/.
  // Repository-specific roots belong to configuration, not to this path heuristic.
  const sampleRoot = [...config.sampleRoots].sort((a, b) => b.length - a.length)
    .find(root => root === "." || sourcePath === root || sourcePath.startsWith(`${root}/`));
  const isFixturePath = sampleRoot !== undefined || sourcePath.includes("/__fixtures__/") || /\bfixtures\b/.test(sourcePath);
  
  if (isFixturePath) {
    // Ignore the enclosing harness, but retain test directories inside the
    // sample (for example Cargo's tests/report.rs and JS __tests__/ helpers).
    const fixtureRoot = sourcePath.match(/^(.*\/)?(?:__fixtures__|fixtures)\//)?.[0];
    const samplePath = sampleRoot === "." ? sourcePath
      : sampleRoot !== undefined ? sourcePath.slice(sampleRoot.length + 1)
      : fixtureRoot ? sourcePath.slice(fixtureRoot.length) : "";
    if (/(?:^|\/)(?:tests?|__tests__)(?:\/|$)/i.test(path.posix.dirname(samplePath))) {
      return "test";
    }
    return "implementation";
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

/**
 * True when a workspace-relative path matches a configuration pattern: a path
 * exactly, or a glob in which `*` stands for anything within one segment and
 * `**` for anything across segments. The archetype overrides and the declared
 * entry points are read by this rule.
 */
export function matchesPathPattern(sourcePath: string, pattern: string): boolean {
  return new RegExp(globPatternToRegExp(pattern)).test(sourcePath);
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
