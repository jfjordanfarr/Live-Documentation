import * as fs from "node:fs/promises";
import path from "node:path";

import type { LiveDocumentationConfig } from "@live-documentation/shared/config/liveDocumentationConfig";
import { slug as githubSlug } from "@live-documentation/shared/tooling/githubSlugger";
import { normalizeWorkspacePath } from "@live-documentation/shared/tooling/pathUtils";

import { LIVE_DOCS_SEGMENT, SYSTEM_LAYER_NAME } from "./constants";
import type { Layer3Archetype } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Path Resolution
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolves the output directory for System-layer materialisation.
 *
 * Absolute paths pass through normalised; relative paths are resolved
 * against the workspace root.
 *
 * Extracted from the 1847-line generator during the 2025-12-07 decomposition.
 */
export function resolveOutputDirectory(workspaceRoot: string, outputDir: string): string {
  if (path.isAbsolute(outputDir)) {
    return path.normalize(outputDir);
  }

  return path.resolve(workspaceRoot, outputDir);
}

/**
 * Computes absolute and workspace-relative paths for a System-layer document.
 *
 * Combines the Live Docs config root, system layer name, archetype subdirectory,
 * and slug to produce a deterministic `.mdmd.md` path. When {@link args.outputRoot}
 * is supplied, paths are resolved against that directory instead of the workspace.
 */
export function resolveSystemDocPaths(args: {
  workspaceRoot: string;
  config: LiveDocumentationConfig;
  archetype: Layer3Archetype;
  slug: string;
  outputRoot?: string;
}): { absolute: string; relative: string } {
  const docRelativeFromConfig = path.join(
    args.config.root,
    SYSTEM_LAYER_NAME,
    args.archetype,
    `${args.slug}${args.config.extension}`
  );

  const baseRoot = args.outputRoot ?? args.workspaceRoot;
  const absolute = path.resolve(baseRoot, docRelativeFromConfig);
  const relative = path.relative(baseRoot, absolute);

  return {
    absolute,
    relative: normalizeWorkspacePath(relative)
  };
}

/**
 * Constructs a normalised relative path used as the `source` metadata field
 * inside System-layer Live Docs (e.g. `system/components/my-module`).
 */
export function systemMetadataSourcePath(archetype: Layer3Archetype, slug: string): string {
  return normalizeWorkspacePath(path.join(SYSTEM_LAYER_NAME, archetype, slug));
}

// ─────────────────────────────────────────────────────────────────────────────
// File Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reads a file and returns its contents, or `undefined` if the file does not exist.
 *
 * Any error other than `ENOENT` is re-thrown. Used throughout the System-layer
 * pipeline to attempt loading existing documents before deciding whether to
 * create, update, or skip.
 */
export async function readIfExists(filePath: string): Promise<string | undefined> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Document Classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classifies a document write as `"created"`, `"updated"`, or `"unchanged"`
 * by comparing the rendered output against existing file content.
 *
 * Drives the per-file counters reported by the System-layer generator.
 */
export function classifyChange(existingContent: string | undefined, rendered: string): "created" | "updated" | "unchanged" {
  if (!existingContent) {
    return "created";
  }
  return existingContent === rendered ? "unchanged" : "updated";
}

/**
 * Extracts the `Generated At:` timestamp from an existing System-layer document.
 *
 * Returns `undefined` when no timestamp is present, allowing the generator to
 * decide whether to preserve an existing timestamp or emit a new one.
 */
export function extractGeneratedAt(existingContent?: string): string | undefined {
  if (!existingContent) {
    return undefined;
  }

  const match = existingContent.match(/^-\s+Generated At:\s*(.+)$/m);
  if (!match) {
    return undefined;
  }

  const value = match[1]?.trim();
  return value && value.length > 0 ? value : undefined;
}

/**
 * Removes the `Code Path:` metadata line from a rendered document string.
 *
 * Used during content comparison so that path-only differences do not
 * trigger unnecessary "updated" classifications.
 */
export function stripCodePathLine(document: string): string {
  return document.replace(/^-\s+Code Path:.*\r?\n/m, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug & Display Name Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Produces a GitHub-flavoured slug for a System-layer document heading.
 *
 * Falls back to generic kebab-casing when the GitHub slugger returns an
 * empty result (e.g. for all-numeric inputs).
 */
export function layer3Slug(input: string): string {
  const slug = githubSlug(input) || input.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return slug.replace(/^-+|-+$/g, "");
}

/**
 * Converts a path-like string (e.g. `"some-module/my-util"`) into a
 * human-readable title-cased display name (`"My Util"`).
 *
 * Takes only the last path segment and replaces hyphens/underscores with spaces.
 */
export function formatDisplayName(input: string): string {
  const lastSegment = input.split("/").filter(Boolean).pop() ?? input;
  return lastSegment
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

// ─────────────────────────────────────────────────────────────────────────────
// Path Classification Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines whether a workspace path should appear in the System-layer
 * Components view.
 *
 * A candidate qualifies when it is tracked by the Stage-0 loader, resides
 * under the Live Docs segment, and is not a compiled artifact (`.js`,
 * `.d.ts`, etc.).
 */
export function includeInComponents(candidate: string, stage0PathSet: Set<string>): boolean {
  const normalized = normalizeWorkspacePath(candidate);
  if (!stage0PathSet.has(normalized)) {
    return false;
  }

  if (!normalized.includes(LIVE_DOCS_SEGMENT)) {
    return false;
  }

  if (isCompiledArtifactPath(normalized)) {
    return false;
  }

  return true;
}

/**
 * Returns `true` for paths that represent compiled/transpiled output
 * (`.js`, `.cjs`, `.mjs`, `.d.ts`) which should be excluded from
 * System-layer document generation.
 */
export function isCompiledArtifactPath(candidate: string): boolean {
  if (candidate.endsWith(".d.ts")) {
    return true;
  }

  const extension = path.extname(candidate).toLowerCase();
  return extension === ".js" || extension === ".cjs" || extension === ".mjs";
}
