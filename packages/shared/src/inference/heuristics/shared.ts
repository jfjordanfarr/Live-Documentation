import path from "node:path";
import { fileURLToPath } from "node:url";

import type { HeuristicArtifact } from "../fallbackHeuristicTypes";

/**
 * Trims whitespace from a reference string, returning an empty string for
 * `undefined` inputs. Used as the first normalisation step in every heuristic
 * match pipeline.
 */
export function cleanupReference(reference: string | undefined): string {
  return (reference ?? "").trim();
}

/**
 * Returns `true` when a value is an absolute HTTP(S) URL.
 *
 * External links are excluded from workspace-internal dependency resolution
 * to prevent false-positive matches against local filenames.
 */
export function isExternalLink(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * Normalises a filesystem path to forward slashes and lowercase for
 * platform-independent comparison during heuristic matching.
 */
export function normalizePath(raw: string): string {
  return path.normalize(raw).replace(/\\/g, "/").toLowerCase();
}

/**
 * Returns the extensionless basename of a path in lowercase.
 *
 * Used to build the lowest-confidence fuzzy match variant: two files
 * sharing a stem (e.g. `utils.ts` and `utils.py`) are weakly linked.
 */
export function stem(value: string): string {
  const basename = path.basename(value).toLowerCase();
  const extension = path.extname(basename);
  return extension ? basename.slice(0, basename.length - extension.length) : basename;
}

/**
 * Converts a path or `file://` URI into a comparable normalised form.
 *
 * `file://` URIs are decoded via `fileURLToPath` before normalisation;
 * all other inputs pass through {@link normalizePath} directly.
 */
export function toComparablePath(uri: string): string {
  try {
    if (uri.startsWith("file://")) {
      return normalizePath(fileURLToPath(uri));
    }
  } catch {
    // ignore URI parsing failures and fall back to generic normalisation
  }

  return normalizePath(uri);
}

/**
 * Computes the start offset of a raw reference within a regex match.
 *
 * When the reference appears as a substring of the full match, the returned
 * offset points to the reference start rather than the overall match start.
 * Returns `null` when neither the reference nor the match index is available.
 */
export function computeReferenceStart(match: RegExpMatchArray, rawReference: string): number | null {
  if (!match[0]) {
    return null;
  }

  const offset = match[0].indexOf(rawReference);
  if (offset < 0) {
    return match.index ?? null;
  }

  return (match.index ?? 0) + offset;
}

/**
 * Determines whether a character position falls inside a C-style line
 * or block comment.
 *
 * Performs a linear scan from the start of the content — O(n) per call.
 * Heuristics invoke this to suppress references found in commented-out code.
 */
export function isWithinComment(content: string, index: number): boolean {
  let inBlockComment = false;
  let inLineComment = false;

  for (let position = 0; position < index; position += 1) {
    const char = content[position];
    const next = content[position + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        position += 1;
      }
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      position += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      position += 1;
      continue;
    }
  }

  return inBlockComment || inLineComment;
}

/**
 * Expands a raw reference string into a set of normalised path variants
 * that a workspace artifact might match.
 *
 * Variants include the literal path, source-directory-resolved forms,
 * common extension swaps (`.js` → `.ts`), extensionless probes, and
 * stem/basename fallbacks. The caller then scores each variant against
 * the workspace artifact list via {@link evaluateVariantMatch}.
 */
export function buildReferenceVariants(reference: string, sourceDir: string): string[] {
  const variants = new Set<string>();
  const cleaned = reference.replace(/\\/g, "/");

  if (!cleaned) {
    return [];
  }

  variants.add(toComparablePath(cleaned));

  const extension = path.extname(cleaned).toLowerCase();
  if ([".js", ".mjs", ".cjs"].includes(extension)) {
    const replacements = extension === ".mjs"
      ? [".mts", ".ts"]
      : extension === ".cjs"
        ? [".cts", ".ts"]
        : [".ts", ".tsx"];

    for (const replacement of replacements) {
      const swapped = cleaned.slice(0, -extension.length) + replacement;
      variants.add(toComparablePath(swapped));
      variants.add(toComparablePath(path.join(sourceDir, swapped)));
    }
  }

  if (cleaned.startsWith(".")) {
    variants.add(toComparablePath(path.join(sourceDir, cleaned)));
  }

  if (!path.extname(cleaned)) {
    const popularExtensions = [".md", ".mdx", ".markdown", ".ts", ".tsx", ".js", ".jsx", ".json", ".py"];
    for (const candidateExtension of popularExtensions) {
      variants.add(toComparablePath(`${cleaned}${candidateExtension}`));
      variants.add(toComparablePath(path.join(sourceDir, `${cleaned}${candidateExtension}`)));
    }
  }

  variants.add(cleaned.toLowerCase());
  variants.add(path.basename(cleaned).toLowerCase());
  variants.add(stem(cleaned));

  return Array.from(variants);
}

/**
 * Confidence score and human-readable rationale for a single variant–artifact
 * match. Returned by {@link evaluateVariantMatch}.
 */
export interface VariantMatchScore {
  confidence: number;
  rationale: string;
}

/**
 * Scores a normalised path variant against a workspace artifact.
 *
 * Returns a {@link VariantMatchScore} with confidence from 0.5 (weak stem
 * match) to 0.8 (exact path match), or `null` when no match is found.
 * Used by every per-language heuristic to rank candidate dependencies.
 */
export function evaluateVariantMatch(
  variant: string,
  rawReference: string,
  candidate: HeuristicArtifact
): VariantMatchScore | null {
  if (variant === candidate.comparablePath) {
    return { confidence: 0.8, rationale: `exact path match ${variant}` };
  }

  if (candidate.basename === variant) {
    return { confidence: 0.7, rationale: `basename match ${variant}` };
  }

  if (candidate.stem === variant) {
    return { confidence: 0.6, rationale: `stem match ${variant}` };
  }

  const trimmedReference = rawReference.replace(/\.\//g, "");
  if (candidate.basename === trimmedReference) {
    return { confidence: 0.55, rationale: `relative basename match ${trimmedReference}` };
  }

  if (candidate.stem === trimmedReference) {
    return { confidence: 0.5, rationale: `relative stem match ${trimmedReference}` };
  }

  return null;
}
