import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { RelationshipHint } from "@live-documentation/shared/inference/fallbackInference";

import { normalizeFileUri } from "../utils/uri";

export type ArtifactCategory = "document" | "code";

export type PathReferenceOrigin = "import" | "require" | "dynamic-import" | "markdown" | "literal";

interface BuildHintsOptions {
  sourceUri: string;
  content: string;
  category: ArtifactCategory;
}

const DEFAULT_EXTENSION_GUESSES = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".cts",
  ".mts",
  ".json",
  ".md",
  ".mdx",
  ".markdown",
  ".yaml",
  ".yml",
  ".css",
  ".scss",
  ".less",
  ".html"
];

const ORIGIN_CONFIDENCE: Record<PathReferenceOrigin, number> = {
  import: 0.85,
  require: 0.8,
  "dynamic-import": 0.75,
  markdown: 0.7,
  literal: 0.6
};

const IMPORT_FROM_REGEX = /from\s+["'`](?<path>[^"'`]+)["'`]/g;
const REQUIRE_REGEX = /require\(\s*["'`](?<path>[^"'`]+)["'`]\s*\)/g;
const DYNAMIC_IMPORT_REGEX = /import\(\s*["'`](?<path>[^"'`]+)["'`]\s*\)/g;
const MARKDOWN_LINK_REGEX = /!?\[[^\]]*\]\((?<path>[^)]+)\)/g;
const STRING_LITERAL_PATH_REGEX = /["'`](?<path>(?:\.{1,2}\/|\/)?[^"'`\s]+\/[^"'`]+?\.[A-Za-z0-9]+)["'`]/g;

const URL_SCHEME_PATTERN = /^[a-z]+:\/\//i;

export function buildFileReferenceHints(options: BuildHintsOptions): RelationshipHint[] {
  const { sourceUri, content, category } = options;
  const canonicalSource = normalizeFileUri(sourceUri);
  let sourcePath: string;

  try {
    sourcePath = fileURLToPath(canonicalSource);
  } catch {
    return [];
  }

  const baseDir = path.dirname(sourcePath);
  const candidates = new Map<string, RelationshipHint>();

  const handleCandidate = (rawPath: string, origin: PathReferenceOrigin): void => {
    const sanitized = sanitisePath(rawPath);
    if (!sanitized) {
      return;
    }

    for (const absolute of resolveCandidateAbsolutePaths(baseDir, sanitized)) {
      const canonicalTarget = normalizeFileUri(pathToFileURL(absolute).toString());
      if (canonicalTarget === canonicalSource) {
        continue;
      }

      const kind = inferKind(category, path.extname(absolute));
      const confidence = ORIGIN_CONFIDENCE[origin] ?? 0.5;
      const key = canonicalTarget;
      const existing = candidates.get(key);
      if (existing && (existing.confidence ?? 0) >= confidence) {
        continue;
      }

      candidates.set(key, {
        sourceUri: canonicalSource,
        targetUri: canonicalTarget,
        kind,
        confidence,
        rationale: `path-reference:${origin}`
      });
    }
  };

  extractMatches(content, IMPORT_FROM_REGEX, match => handleCandidate(match, "import"));
  extractMatches(content, REQUIRE_REGEX, match => handleCandidate(match, "require"));
  extractMatches(content, DYNAMIC_IMPORT_REGEX, match => handleCandidate(match, "dynamic-import"));
  extractMatches(content, MARKDOWN_LINK_REGEX, match => handleCandidate(match, "markdown"));
  extractMatches(content, STRING_LITERAL_PATH_REGEX, match => handleCandidate(match, "literal"));

  return Array.from(candidates.values());
}

function extractMatches(
  content: string,
  regex: RegExp,
  onMatch: (path: string) => void
): void {
  const pattern = new RegExp(regex.source, regex.flags.replace("g", "") + "g");
  let result: RegExpExecArray | null;
  while ((result = pattern.exec(content)) !== null) {
    const candidate = result.groups?.path ?? result[1];
    if (candidate) {
      onMatch(candidate);
    }
  }
}

function sanitisePath(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  if (URL_SCHEME_PATTERN.test(trimmed) || trimmed.startsWith("#")) {
    return null;
  }

  const withoutFragment = trimmed.replace(/[#?].*$/, "");
  if (!withoutFragment) {
    return null;
  }

  return withoutFragment.replace(/\\/g, "/");
}

function resolveCandidateAbsolutePaths(baseDir: string, candidate: string): string[] {
  const ext = path.extname(candidate);
  const potentialPaths: string[] = [];

  if (ext) {
    potentialPaths.push(path.resolve(baseDir, candidate));
  } else {
    for (const guess of DEFAULT_EXTENSION_GUESSES) {
      potentialPaths.push(path.resolve(baseDir, `${candidate}${guess}`));
      potentialPaths.push(path.resolve(baseDir, path.join(candidate, `index${guess}`)));
    }
  }

  const existing = new Set<string>();

  for (const absolute of potentialPaths) {
    try {
      const stat = fs.statSync(absolute);
      if (stat.isFile()) {
        existing.add(absolute);
      }
    } catch {
      continue;
    }
  }

  return Array.from(existing.values());
}

function inferKind(category: ArtifactCategory, targetExtension: string): RelationshipHint["kind"] {
  const normalised = targetExtension.toLowerCase();
  if (category === "document") {
    if (isCodeExtension(normalised)) {
      return "documents";
    }
    return "references";
  }

  if (isDocumentExtension(normalised)) {
    return "references";
  }

  return "depends_on";
}

function isCodeExtension(ext: string): boolean {
  return (
    ext === ".ts" ||
    ext === ".tsx" ||
    ext === ".js" ||
    ext === ".jsx" ||
    ext === ".mjs" ||
    ext === ".cjs" ||
    ext === ".cts" ||
    ext === ".mts" ||
    ext === ".css" ||
    ext === ".scss" ||
    ext === ".less" ||
    ext === ".html"
  );
}

function isDocumentExtension(ext: string): boolean {
  return ext === ".md" || ext === ".mdx" || ext === ".markdown" || ext === ".json" || ext === ".yaml" || ext === ".yml";
}
