// Live Documentation: .live-documentation/source/packages/shared/src/live-docs/schema.md

import type { LiveDocumentationArchetype } from "../config/liveDocumentationConfig";

/**
 * MDMD documentation layer (1–4), corresponding to the progressive
 * specification hierarchy from vision to implementation.
 */
export type LiveDocLayer = 1 | 2 | 3 | 4;

/**
 * Tracks whether a Live Doc's docstring sections are in sync with
 * the current state of the underlying source artifact.
 */
export interface LiveDocDocstringProvenance {
  /** Whether the docstring content matches the source code. */
  status: "in-sync" | "drifted" | "waived";
  /** ISO timestamp of the last comparison. */
  lastComparedAt?: string;
  /** Human-readable reason when status is `"waived"`. */
  waivedReason?: string;
}

/**
 * Records which generator tool produced a Live Doc's generated
 * sections, when, and with what input hash for staleness detection.
 */
export interface LiveDocGeneratorProvenance {
  /** Name of the generator tool (e.g. `"live-docs-cli"`, `"rosetta"`). */
  tool: string;
  /** Semver version string of the generator at generation time. */
  version?: string;
  /** ISO timestamp of when the section was last generated. */
  generatedAt: string;
  /** Hash of the benchmark or configuration used during generation. */
  benchmarkHash?: string;
  /** Hash of the source input used to produce the generated output. */
  inputHash?: string;
}

/**
 * Combined provenance payload attached to a Live Doc, recording
 * both generator history and docstring synchronisation status.
 */
export interface LiveDocProvenance {
  /** Ordered history of generators that have contributed sections. */
  generators: LiveDocGeneratorProvenance[];
  /** Docstring comparison status, if applicable. */
  docstrings?: LiveDocDocstringProvenance;
}

/**
 * Complete metadata block for a Live Documentation file.
 *
 * Encoded as YAML frontmatter in the `.mdmd.md` file and parsed
 * by the graph builder, lint, and inspector CLIs.
 */
export interface LiveDocMetadata {
  layer: LiveDocLayer;
  archetype?: LiveDocumentationArchetype;
  /** Workspace-relative path to the source asset represented by this Live Doc. */
  sourcePath: string;
  /** Stable identifier for audits and cross-references. */
  liveDocId: string;
  /** ISO timestamp describing when generated sections were last refreshed. */
  generatedAt?: string;
  /** Optional provenance payload emitted by generators and bridges. */
  provenance?: LiveDocProvenance;
  /** Arbitrary metadata produced by enrichers (e.g., co-activation scores, reference counts). */
  enrichers?: Record<string, unknown>;
}

/**
 * Partial input type for {@link normalizeLiveDocMetadata}, requiring
 * only `sourcePath` and `liveDocId` while defaulting everything else.
 */
export type LiveDocMetadataInput = Partial<LiveDocMetadata> & {
  sourcePath: string;
  liveDocId: string;
};

/** Default documentation layer assigned when none is specified. */
export const DEFAULT_LIVE_DOC_LAYER: LiveDocLayer = 4;

/**
 * Normalises a partial metadata input into a complete {@link LiveDocMetadata}
 * object, applying defaults, trimming strings, and normalising paths.
 *
 * @param input - Partial metadata with at least `sourcePath` and `liveDocId`.
 * @returns Fully normalised metadata suitable for YAML frontmatter emission.
 */
export function normalizeLiveDocMetadata(input: LiveDocMetadataInput): LiveDocMetadata {
  const layer = input.layer ?? DEFAULT_LIVE_DOC_LAYER;
  return {
    layer,
    archetype: input.archetype,
    sourcePath: normalizePath(input.sourcePath),
    liveDocId: input.liveDocId.trim(),
    generatedAt: normalizeOptionalString(input.generatedAt),
    provenance: normalizeProvenance(input.provenance),
    enrichers: input.enrichers
  };
}

function normalizeProvenance(provenance?: LiveDocProvenance): LiveDocProvenance | undefined {
  if (!provenance) {
    return undefined;
  }

  const generators = Array.isArray(provenance.generators)
    ? provenance.generators
        .map((entry) => normalizeGenerator(entry))
        .filter((entry): entry is LiveDocGeneratorProvenance => !!entry)
    : [];

  const docstrings = provenance.docstrings
    ? {
        status: provenance.docstrings.status,
        lastComparedAt: normalizeOptionalString(provenance.docstrings.lastComparedAt),
        waivedReason: normalizeOptionalString(provenance.docstrings.waivedReason)
      }
    : undefined;

  if (!generators.length && !docstrings) {
    return undefined;
  }

  return {
    generators,
    docstrings
  };
}

function normalizeGenerator(
  entry: LiveDocGeneratorProvenance | undefined
): LiveDocGeneratorProvenance | undefined {
  if (!entry?.tool?.trim()) {
    return undefined;
  }

  const generatedAt = normalizeOptionalString(entry.generatedAt);
  if (!generatedAt) {
    return undefined;
  }

  return {
    tool: entry.tool.trim(),
    version: normalizeOptionalString(entry.version),
    generatedAt,
    benchmarkHash: normalizeOptionalString(entry.benchmarkHash),
    inputHash: normalizeOptionalString(entry.inputHash)
  };
}

function normalizePath(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("Live Doc metadata requires a non-empty sourcePath");
  }
  return trimmed.replace(/\\/g, "/");
}

function normalizeOptionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}
