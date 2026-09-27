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
}
