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

export function resolveOutputDirectory(workspaceRoot: string, outputDir: string): string {
  if (path.isAbsolute(outputDir)) {
    return path.normalize(outputDir);
  }

  return path.resolve(workspaceRoot, outputDir);
}

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

export function systemMetadataSourcePath(archetype: Layer3Archetype, slug: string): string {
  return normalizeWorkspacePath(path.join(SYSTEM_LAYER_NAME, archetype, slug));
}

// ─────────────────────────────────────────────────────────────────────────────
// File Operations
// ─────────────────────────────────────────────────────────────────────────────

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

export function classifyChange(existingContent: string | undefined, rendered: string): "created" | "updated" | "unchanged" {
  if (!existingContent) {
    return "created";
  }
  return existingContent === rendered ? "unchanged" : "updated";
}

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

export function stripCodePathLine(document: string): string {
  return document.replace(/^-\s+Code Path:.*\r?\n/m, "");
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug & Display Name Generation
// ─────────────────────────────────────────────────────────────────────────────

export function layer3Slug(input: string): string {
  const slug = githubSlug(input) || input.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return slug.replace(/^-+|-+$/g, "");
}

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

export function isCompiledArtifactPath(candidate: string): boolean {
  if (candidate.endsWith(".d.ts")) {
    return true;
  }

  const extension = path.extname(candidate).toLowerCase();
  return extension === ".js" || extension === ".cjs" || extension === ".mjs";
}
