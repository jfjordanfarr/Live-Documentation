import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import * as path from "node:path";

import {
  BenchmarkFixtureDefinition,
  FixtureFileSetSpec,
  FixtureIntegritySpec,
  FixtureMaterialization,
  FixtureProvenance
} from "./benchmark-manifest";
import { DEFAULT_LIVE_DOCUMENTATION_CONFIG } from "../../packages/shared/src/config/liveDocumentationConfig";

/** HTML comment sentinel marking the start of the vendor-inventory section. */
export const VENDOR_SECTION_START = "<!-- benchmark-vendor-inventory:start -->";
/** HTML comment sentinel marking the end of the vendor-inventory section. */
export const VENDOR_SECTION_END = "<!-- benchmark-vendor-inventory:end -->";

/** Options passed to vendor-inventory rendering functions. */
export interface RenderOptions {
  repoRoot: string;
  docPath: string;
}

/**
 * Resolves the doc path for the AST benchmark-fixtures documentation.
 *
 * Prefers the Layer-3 MDMD location (`.mdmd/layer-3/benchmark-fixtures.mdmd.md`)
 * when present; falls back to the consumer-default Live Docs root.
 */
export function resolveAstFixtureDocPath(repoRoot: string): string {
  // benchmark-fixtures is a Layer 3 architectural doc, not a Layer 4 source doc.
  // Prefer this repo's MDMD location when present; otherwise fall back to the
  // consumer-default Live Docs root.
  const mdmdCandidate = path.join(repoRoot, ".mdmd", "layer-3", "benchmark-fixtures.mdmd.md");
  if (existsSync(mdmdCandidate)) {
    return mdmdCandidate;
  }

  const config = DEFAULT_LIVE_DOCUMENTATION_CONFIG;
  return path.join(repoRoot, config.root, "layer-3", `benchmark-fixtures${config.extension}`);
}

/**
 * Reads the doc at `docPath`, re-renders the vendor-inventory delimited
 * section from `fixtures`, and writes back only if content changed.
 */
export async function ensureVendorSection(
  docPath: string,
  fixtures: BenchmarkFixtureDefinition[],
  options: RenderOptions
): Promise<void> {
  const content = await fs.readFile(docPath, "utf8");
  const rendered = renderVendorInventory(fixtures, options);
  const updated = replaceDelimitedSection(content, rendered);
  if (updated !== content) {
    await fs.writeFile(docPath, updated, "utf8");
  }
}

/**
 * Renders the markdown body of a vendor-inventory section from benchmark
 * fixture definitions.  Only fixtures with `provenance.kind === "vendor"`
 * and an integrity block are included.
 */
export function renderVendorInventory(
  fixtures: BenchmarkFixtureDefinition[],
  _options: RenderOptions
): string {
  const vendorFixtures = fixtures.filter(
    fixture => fixture.provenance?.kind === "vendor" && fixture.integrity
  );

  if (vendorFixtures.length === 0) {
    return "\n_No vendored fixtures documented._\n";
  }

  const lines: string[] = [""];

  for (const fixture of vendorFixtures) {
    const label = fixture.label ? `${fixture.label}` : fixture.id;
    lines.push(`#### \`${fixture.id}\` (${label})`);
    lines.push("");

    const provenance = fixture.provenance!;
    appendProvenance(lines, provenance);

    const integrity = fixture.integrity!;
    appendIntegrity(lines, integrity);
    appendFileSelection(lines, fixture, integrity);

    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

/**
 * Extracts the text between the vendor-inventory start/end sentinel comments.
 *
 * @throws If the sentinel markers are missing or misordered.
 */
export function extractVendorInventory(content: string): string {
  const startIndex = content.indexOf(VENDOR_SECTION_START);
  const endIndex = content.indexOf(VENDOR_SECTION_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error("Vendor inventory markers not found in documentation.");
  }

  const start = startIndex + VENDOR_SECTION_START.length;
  const segment = content.slice(start, endIndex);
  return segment.trimStart().replace(/\r\n/g, "\n").trimEnd();
}

/**
 * Replaces content between a matched pair of start/end sentinel comments
 * in `source` with `replacementContent`.
 *
 * @throws If the sentinel markers are missing or misordered.
 */
export function replaceDelimitedSection(source: string, replacementContent: string): string {
  const startIndex = source.indexOf(VENDOR_SECTION_START);
  const endIndex = source.indexOf(VENDOR_SECTION_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    throw new Error("Vendor inventory markers not found in documentation.");
  }

  const before = source.slice(0, startIndex + VENDOR_SECTION_START.length);
  const after = source.slice(endIndex);
  const normalized = `\n${replacementContent.replace(/\r\n/g, "\n").trim()}\n`;
  return `${before}${normalized}${after}`;
}

function appendProvenance(lines: string[], provenance: FixtureProvenance): void {
  const sourceParts: string[] = [];
  if (provenance.repository) {
    sourceParts.push(`\`${provenance.repository}\``);
  }
  if (provenance.commit) {
    sourceParts.push(`@ \`${provenance.commit}\``);
  }
  const sourceLine = sourceParts.length > 0 ? sourceParts.join(" ") : "(unspecified repository)";
  const license = provenance.license ? ` — ${provenance.license}` : "";
  lines.push(`- **Source**: ${sourceLine}${license}`);
}

function appendIntegrity(lines: string[], integrity: FixtureIntegritySpec): void {
  const count = integrity.fileCount ?? integrity.paths?.length ?? 0;
  lines.push(
    `- **Integrity**: \`${integrity.algorithm}\` root \`${integrity.rootHash}\` (${count} files)`
  );
}

function normalizePath(candidate: string): string {
  return candidate.replace(/\\/g, "/");
}

function appendFileSelection(
  lines: string[],
  fixture: BenchmarkFixtureDefinition,
  integrity: FixtureIntegritySpec
): void {
  const fileSet = integrity.fileSet ?? extractMaterializationFileSet(fixture.materialization);

  if (!fileSet) {
    if (integrity.paths && integrity.paths.length > 0) {
      lines.push("- **Files**: manifest enumerates explicit paths (auto-generated)");
    }
    return;
  }

  const includeSummary = fileSet.include
    .map((item: string) => `\`${normalizePath(item)}\``)
    .join(", ");
  const excludeSummary = (fileSet.exclude ?? [])
    .map((item: string) => `\`${normalizePath(item)}\``)
    .join(", ");

  const parts = [`include ${includeSummary}`];
  if (excludeSummary.length > 0) {
    parts.push(`exclude ${excludeSummary}`);
  }

  const count = integrity.fileCount ?? integrity.paths?.length;
  const countSuffix = typeof count === "number" ? ` (resolved ${count} files)` : "";
  lines.push(`- **File Selection**: ${parts.join("; ")}${countSuffix}`);
}

function extractMaterializationFileSet(
  materialization: FixtureMaterialization | undefined
): FixtureFileSetSpec | undefined {
  if (!materialization) {
    return undefined;
  }
  if (materialization.kind !== "git") {
    return undefined;
  }
  return {
    include: materialization.include,
    exclude: materialization.exclude
  };
}
